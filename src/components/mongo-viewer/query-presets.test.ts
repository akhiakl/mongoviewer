import { describe, expect, it } from 'vitest';

import {
  parseStoredPresets,
  removePresetByName,
  toStoredPresets,
  upsertPreset,
} from '@/components/mongo-viewer/query-presets';

describe('query preset helpers', () => {
  it('returns empty list for invalid stored payload', () => {
    expect(parseStoredPresets('not-json')).toEqual([]);
  });

  it('upserts presets by name', () => {
    const initial = [{ name: 'active', query: '{"status":"active"}' }];
    const next = upsertPreset(initial, { name: 'active', query: '{"status":"enabled"}' });

    expect(next).toEqual([{ name: 'active', query: '{"status":"enabled"}' }]);
  });

  it('adds new preset when name does not exist', () => {
    const initial = [{ name: 'active', query: '{"status":"active"}' }];
    const next = upsertPreset(initial, { name: 'archived', query: '{"archived":true}' });

    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({ name: 'archived', query: '{"archived":true}' });
  });

  it('removes preset by name', () => {
    const initial = [
      { name: 'active', query: '{"status":"active"}' },
      { name: 'archived', query: '{"archived":true}' },
    ];

    expect(removePresetByName(initial, 'active')).toEqual([
      { name: 'archived', query: '{"archived":true}' },
    ]);
  });

  it('serializes preset list', () => {
    const presets = [{ name: 'active', query: '{"status":"active"}' }];
    const stored = toStoredPresets(presets);
    expect(parseStoredPresets(stored)).toEqual(presets);
  });
});
