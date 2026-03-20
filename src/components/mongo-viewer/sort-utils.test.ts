import { describe, expect, it } from 'vitest';

import { sortRecords } from '@/components/mongo-viewer/sort-utils';

describe('sortRecords', () => {
  const records = [
    { _id: 1, name: 'Charlie', score: 30 },
    { _id: 2, name: 'Alice', score: 10 },
    { _id: 3, name: 'Bob', score: 20 },
  ];

  it('returns original order when no sort field is provided', () => {
    expect(sortRecords(records, null, 'asc')).toEqual(records);
  });

  it('sorts by string field ascending', () => {
    const result = sortRecords(records, 'name', 'asc');
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts by numeric field descending', () => {
    const result = sortRecords(records, 'score', 'desc');
    expect(result.map((r) => r.score)).toEqual([30, 20, 10]);
  });

  it('keeps sort stable for missing values', () => {
    const result = sortRecords(
      [{ _id: 1, score: 2 }, { _id: 2 }, { _id: 3, score: 1 }],
      'score',
      'asc',
    );
    expect(result.map((r) => r._id)).toEqual([3, 1, 2]);
  });
});
