import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron/main';

import type { ConnectionListItem, ConnectionsState } from '../shared/mongo-types';
import { removeTlsCertificate } from './tls-certificate-service';

type StoredConnection = ConnectionListItem & {
    tlsCertificatePath: string | null;
};

type ConnectionStore = {
    activeConnectionId: string | null;
    connections: StoredConnection[];
};

const EMPTY_STORE: ConnectionStore = {
    activeConnectionId: null,
    connections: [],
};

let storeMutationQueue = Promise.resolve();

async function getStoreFilePath() {
    const storageDir = path.join(app.getPath('userData'), 'storage');
    await mkdir(storageDir, { recursive: true });
    return path.join(storageDir, 'connections.json');
}

async function readStore(): Promise<ConnectionStore> {
    const filePath = await getStoreFilePath();

    try {
        const raw = await readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<ConnectionStore>;

        return {
            activeConnectionId:
                typeof parsed.activeConnectionId === 'string' ? parsed.activeConnectionId : null,
            connections: Array.isArray(parsed.connections)
                ? parsed.connections.filter(
                    (connection): connection is StoredConnection =>
                        typeof connection?.id === 'string' &&
                        typeof connection?.name === 'string' &&
                        typeof connection?.createdAt === 'string' &&
                        typeof connection?.uri === 'string',
                )
                : [],
        };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return EMPTY_STORE;
        }

        throw error;
    }
}

async function writeStore(store: ConnectionStore) {
    const filePath = await getStoreFilePath();
    await writeFile(filePath, JSON.stringify(store, null, 2), 'utf8');
}

async function mutateStore<T>(mutator: (store: ConnectionStore) => Promise<T> | T): Promise<T> {
    const operation = storeMutationQueue.then(async () => {
        const store = await readStore();
        const result = await mutator(store);
        await writeStore(store);
        return result;
    });

    storeMutationQueue = operation.then(
        (): void => undefined,
        (): void => undefined,
    );

    return operation;
}

function toSummary(connection: StoredConnection): ConnectionListItem {
    return {
        id: connection.id,
        name: connection.name,
        createdAt: connection.createdAt,
        uri: connection.uri,
    };
}

export async function getConnectionsState(): Promise<ConnectionsState> {
    const store = await readStore();
    const connections = [...store.connections]
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        .map(toSummary);

    return {
        connections,
        activeConnectionId:
            connections.some((connection) => connection.id === store.activeConnectionId)
                ? store.activeConnectionId
                : null,
    };
}

export async function createConnection(input: {
    name: string;
    uri: string;
    tlsCertificatePath?: string;
}) {
    return mutateStore((store) => {
        const normalizedName = input.name.trim();
        if (!normalizedName) {
            throw new Error('Connection name is required.');
        }

        const duplicate = store.connections.find(
            (connection) => connection.name.toLowerCase() === normalizedName.toLowerCase(),
        );
        if (duplicate) {
            throw new Error('A connection with this name already exists.');
        }

        const connection: StoredConnection = {
            id: randomUUID(),
            name: normalizedName,
            uri: input.uri,
            tlsCertificatePath: input.tlsCertificatePath?.trim() || null,
            createdAt: new Date().toISOString(),
        };

        store.connections.push(connection);
        store.activeConnectionId = connection.id;

        return toSummary(connection);
    });
}

export async function deleteConnection(connectionId: string) {
    return mutateStore(async (store) => {
        const target = store.connections.find((connection) => connection.id === connectionId);
        if (!target) {
            throw new Error('Connection not found.');
        }

        const nextConnections = store.connections.filter((connection) => connection.id !== connectionId);

        store.connections = nextConnections;

        if (store.activeConnectionId === connectionId) {
            store.activeConnectionId = nextConnections[0]?.id ?? null;
        }

        await removeTlsCertificate(target.tlsCertificatePath);

        return {
            activeConnectionId: store.activeConnectionId,
        };
    });
}

export async function setActiveConnection(connectionId: string) {
    return mutateStore((store) => {
        const target = store.connections.find((connection) => connection.id === connectionId);
        if (!target) {
            throw new Error('Connection not found.');
        }

        store.activeConnectionId = connectionId;

        return toSummary(target);
    });
}

export async function clearActiveConnection() {
    return mutateStore((store) => {
        store.activeConnectionId = null;

        return {
            activeConnectionId: null as string | null,
        };
    });
}

export async function getActiveConnection() {
    const store = await readStore();

    const active = store.connections.find((connection) => connection.id === store.activeConnectionId);
    if (active) {
        return active;
    }

    return null;
}
