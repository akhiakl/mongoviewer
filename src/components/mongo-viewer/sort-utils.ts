import type { SerializableRecord } from '@/lib/mongo-types';

export type SortDirection = 'asc' | 'desc';

function toComparable(value: unknown): string | number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  if (typeof value === 'boolean') {
    return Number(value);
  }

  return String(value ?? '');
}

export function sortRecords(
  records: SerializableRecord[],
  sortField: string | null,
  sortDirection: SortDirection,
) {
  if (!sortField) {
    return records;
  }

  const direction = sortDirection === 'desc' ? -1 : 1;

  return [...records].sort((left, right) => {
    const leftValue = left[sortField];
    const rightValue = right[sortField];

    if (leftValue == null && rightValue == null) {
      return 0;
    }

    if (leftValue == null) {
      return 1;
    }

    if (rightValue == null) {
      return -1;
    }

    const a = toComparable(leftValue);
    const b = toComparable(rightValue);

    if (a < b) {
      return -1 * direction;
    }

    if (a > b) {
      return 1 * direction;
    }

    return 0;
  });
}
