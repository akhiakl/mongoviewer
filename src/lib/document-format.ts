import type { SerializableRecord } from '../shared/mongo-types';

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

function truncateMiddle(value: string, maxLength: number) {
    if (value.length <= maxLength) {
        return value;
    }

    const headLength = Math.max(4, Math.floor((maxLength - 1) / 2));
    const tailLength = Math.max(3, maxLength - headLength - 1);
    return `${value.slice(0, headLength)}…${value.slice(-tailLength)}`;
}

function formatObjectPreview(value: Record<string, unknown>) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
        return '{}';
    }

    const scalar = formatEjsonScalar(value);
    if (scalar !== null) {
        return scalar;
    }

    const previewKeys = keys.slice(0, 3).join(', ');
    const suffix = keys.length > 3 ? ', …' : '';
    return `{ ${previewKeys}${suffix} }`;
}

export function formatCellValue(value: unknown) {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'string') {
        return value.length > 80 ? truncateMiddle(value, 80) : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }

        const scalarPreview = value
            .filter((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))
            .slice(0, 2)
            .map((item) => (item === null ? 'null' : String(item)));

        if (scalarPreview.length > 0) {
            const preview = scalarPreview.join(', ');
            const suffix = value.length > scalarPreview.length ? ', …' : '';
            return `[${preview}${suffix}]`;
        }

        return `[${value.length} items]`;
    }

    if (isObjectLike(value)) {
        return formatObjectPreview(value);
    }

    return String(value);
}

export function formatCellTooltip(value: unknown) {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value) || isObjectLike(value)) {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

export function getRecordId(record: SerializableRecord, fallbackIndex: number) {
    return record._id ? String(formatCellValue(record._id)) : `doc-${fallbackIndex + 1}`;
}
