import { EJSON } from 'bson';

import type { CollectionFieldSummary, CollectionSchemaSummary, SerializableRecord } from '../shared/mongo-types';

const MAX_SCHEMA_DEPTH = 3;
const MAX_EXAMPLES_PER_FIELD = 3;

type FieldAccumulator = {
  types: Set<string>;
  exampleValues: Set<string>;
  occurrences: number;
};

function isNestedDocument(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isExtendedJsonScalar(value: Record<string, unknown>) {
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key.startsWith('$'));
}

function describeFieldType(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object' && value !== null) {
    if ('$oid' in value) {
      return 'objectId';
    }

    if ('$date' in value) {
      return 'date';
    }

    if ('$numberInt' in value || '$numberLong' in value || '$numberDouble' in value || '$numberDecimal' in value) {
      return 'number';
    }

    return 'object';
  }

  return typeof value;
}

function formatExampleValue(value: unknown) {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (typeof value === 'object' && value !== null) {
    return EJSON.stringify(value, { relaxed: true });
  }

  return String(value);
}

function visitValue(
  value: unknown,
  fields: Map<string, FieldAccumulator>,
  prefix = '',
  depth = 0,
) {
  if (!isNestedDocument(value) || isExtendedJsonScalar(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    const accumulator = fields.get(nextPath) ?? {
      types: new Set<string>(),
      exampleValues: new Set<string>(),
      occurrences: 0,
    };

    accumulator.occurrences += 1;
    accumulator.types.add(describeFieldType(nestedValue));

    if (accumulator.exampleValues.size < MAX_EXAMPLES_PER_FIELD) {
      accumulator.exampleValues.add(formatExampleValue(nestedValue));
    }

    fields.set(nextPath, accumulator);

    if (depth < MAX_SCHEMA_DEPTH) {
      visitValue(nestedValue, fields, nextPath, depth + 1);
    }
  }
}

export function summarizeCollectionSchema(records: SerializableRecord[]): CollectionSchemaSummary {
  const fieldMap = new Map<string, FieldAccumulator>();

  for (const record of records) {
    visitValue(record, fieldMap);
  }

  const fields: CollectionFieldSummary[] = Array.from(fieldMap.entries())
    .map(([path, accumulator]) => ({
      path,
      types: Array.from(accumulator.types).sort((left, right) => left.localeCompare(right)),
      presenceRate: records.length === 0 ? 0 : accumulator.occurrences / records.length,
      exampleValues: Array.from(accumulator.exampleValues),
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    sampleSize: records.length,
    fields,
  };
}
