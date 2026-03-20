import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

import type {
  DatabaseTreeItem,
  DocumentsQuery,
  DocumentsResult,
  SerializableRecord,
} from '../mongo-types';

const EXCLUDED_DATABASES = new Set(['admin', 'config']);
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

declare global {
  var __mongoClientPromises: Map<string, Promise<MongoClient>> | undefined;
}

function getClientCache() {
  if (!global.__mongoClientPromises) {
    global.__mongoClientPromises = new Map<string, Promise<MongoClient>>();
  }

  return global.__mongoClientPromises;
}

async function getMongoClient(uri: string) {
  const cache = getClientCache();
  const cachedPromise = cache.get(uri);

  if (cachedPromise) {
    return cachedPromise;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  const connectionPromise = client.connect().catch((error) => {
    cache.delete(uri);
    throw error;
  });

  cache.set(uri, connectionPromise);
  return connectionPromise;
}

function parsePositiveInt(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return fallback;
  }

  return Math.trunc(value);
}

function serializeDocument(document: SerializableRecord) {
  return EJSON.serialize(document, { relaxed: true }) as SerializableRecord;
}

function parseMongoFilter(mongoQuery: string | undefined) {
  const normalizedQuery = mongoQuery?.trim();
  if (!normalizedQuery) {
    return {};
  }

  try {
    const parsed = EJSON.parse(normalizedQuery) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Mongo query must be a JSON object.');
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid query.';
    throw new Error(`Invalid Mongo query: ${message}`, { cause: error });
  }
}

export async function listDatabaseNames(uri: string) {
  const client = await getMongoClient(uri);
  const { databases } = await client.db().admin().listDatabases();

  return databases
    .map((database) => database.name)
    .filter((name) => !EXCLUDED_DATABASES.has(name))
    .sort((left, right) => left.localeCompare(right));
}

export async function listDatabaseTree(uri: string): Promise<DatabaseTreeItem[]> {
  const client = await getMongoClient(uri);
  const databaseNames = await listDatabaseNames(uri);

  return Promise.all(
    databaseNames.map(async (name) => {
      const collections = await client.db(name).listCollections({}, { nameOnly: true }).toArray();

      return {
        name,
        collections: collections
          .map((collection) => collection.name)
          .sort((left, right) => left.localeCompare(right)),
      };
    }),
  );
}

export async function listDocuments(uri: string, query: DocumentsQuery): Promise<DocumentsResult> {
  const page = parsePositiveInt(query.page, 1);
  const pageSize = Math.min(parsePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const client = await getMongoClient(uri);
  const collection = client.db(query.db).collection(query.collection);
  const filter = parseMongoFilter(query.mongoQuery);

  const [records, total] = await Promise.all([
    collection
      .find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    db: query.db,
    collection: query.collection,
    page,
    pageSize,
    total,
    records: records.map((record) => serializeDocument(record as SerializableRecord)),
  };
}