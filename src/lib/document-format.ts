import type { SerializableRecord } from './mongo-types';

export function isObjectLike(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function formatEjsonScalar(value: Record<string, unknown>) {
    if (typeof value.$date === 'string') {
        return value.$date;
    }

    if (typeof value.$oid === 'string') {
        return value.$oid;
    }

    if (typeof value.$numberInt === 'string') {
        return value.$numberInt;
    }

    if (typeof value.$numberLong === 'string') {
        return value.$numberLong;
    }

    if (typeof value.$numberDouble === 'string') {
        return value.$numberDouble;
    }

    if (typeof value.$numberDecimal === 'string') {
        return value.$numberDecimal;
    }

    if (typeof value.$binary === 'string') {
        return value.$binary;
    }

    if (typeof value.$regularExpression === 'string') {
        return value.$regularExpression;
    }

    if (isObjectLike(value.$timestamp)) {
        const timestamp = value.$timestamp;
        const seconds = typeof timestamp.t === 'number' ? timestamp.t : Number(timestamp.t);
        const increment = typeof timestamp.i === 'number' ? timestamp.i : Number(timestamp.i);

        if (Number.isFinite(seconds) && Number.isFinite(increment)) {
            return `${seconds}:${increment}`;
        }
    }

    return null;
}

export function formatCellValue(value: unknown) {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }

    if (isObjectLike(value)) {
        const scalar = formatEjsonScalar(value);

        if (scalar !== null) {
            return scalar;
        }

        return JSON.stringify(value);
    }

    return String(value);
}

export function getRecordId(record: SerializableRecord, fallbackIndex: number) {
    return record._id ? String(formatCellValue(record._id)) : `doc-${fallbackIndex + 1}`;
}