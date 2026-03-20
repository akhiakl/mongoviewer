import { describe, expect, it } from 'vitest';

import {
    formatCellValue,
    formatEjsonScalar,
    getRecordId,
    isObjectLike,
} from '@/lib/document-format';

describe('document-format', () => {
    it('detects object-like values correctly', () => {
        expect(isObjectLike({ a: 1 })).toBe(true);
        expect(isObjectLike([])).toBe(false);
        expect(isObjectLike(null)).toBe(false);
        expect(isObjectLike('x')).toBe(false);
    });

    it('formats supported extended JSON scalars', () => {
        expect(formatEjsonScalar({ $date: '2026-01-01T00:00:00.000Z' })).toBe('2026-01-01T00:00:00.000Z');
        expect(formatEjsonScalar({ $numberInt: '1' })).toBe('1');
        expect(formatEjsonScalar({ $numberLong: '2' })).toBe('2');
        expect(formatEjsonScalar({ $numberDouble: '3.14' })).toBe('3.14');
        expect(formatEjsonScalar({ $numberDecimal: '4.2' })).toBe('4.2');
        expect(formatEjsonScalar({ $binary: 'deadbeef' })).toBe('deadbeef');
        expect(formatEjsonScalar({ $regularExpression: '/abc/i' })).toBe('/abc/i');
        expect(formatEjsonScalar({ $timestamp: { t: 10, i: 2 } })).toBe('10:2');
        expect(formatEjsonScalar({ $timestamp: { t: '11', i: '3' } })).toBe('11:3');
        expect(formatEjsonScalar({ $timestamp: { t: 'bad', i: '3' } })).toBeNull();
        expect(formatEjsonScalar({ unknown: 'value' })).toBeNull();
    });

    it('formats cell values for table display', () => {
        expect(formatCellValue(null)).toBe('-');
        expect(formatCellValue(undefined)).toBe('-');
        expect(formatCellValue('plain')).toBe('plain');
        expect(formatCellValue(10)).toBe('10');
        expect(formatCellValue(true)).toBe('true');
        expect(formatCellValue(['a', 1])).toBe('["a",1]');
        expect(formatCellValue({ $oid: 'abc' })).toBe('abc');
        expect(formatCellValue({ nested: { a: 1 } })).toBe('{"nested":{"a":1}}');
        expect(formatCellValue(Symbol('x'))).toBe('Symbol(x)');
    });

    it('creates stable record ids', () => {
        expect(getRecordId({ _id: 123 }, 4)).toBe('123');
        expect(getRecordId({ name: 'missing-id' }, 4)).toBe('doc-5');
    });
});
