import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useQueryPresets } from '@/components/mongo-viewer/hooks/use-query-presets';
import type { Selection } from '@/components/mongo-viewer/types';

const usersSelection: Selection = {
  db: 'app',
  collection: 'users',
};

const ordersSelection: Selection = {
  db: 'app',
  collection: 'orders',
};

describe('useQueryPresets', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads, saves, updates, and deletes collection-scoped presets', async () => {
    window.localStorage.setItem(
      'mongo-viewer:query-presets:app.users',
      JSON.stringify([{ name: 'active', query: '{"status":"active"}' }]),
    );

    const { result } = renderHook(({ selection }) => useQueryPresets(selection), {
      initialProps: { selection: usersSelection as Selection | null },
    });

    await waitFor(() => {
      expect(result.current.presets).toEqual([{ name: 'active', query: '{"status":"active"}' }]);
    });

    act(() => {
      expect(result.current.savePreset(' recent ', ' {"recent":true} ')).toBe(true);
    });

    expect(result.current.presets).toEqual([
      { name: 'active', query: '{"status":"active"}' },
      { name: 'recent', query: '{"recent":true}' },
    ]);
    expect(result.current.getPresetByName('recent')).toEqual({
      name: 'recent',
      query: '{"recent":true}',
    });

    act(() => {
      expect(result.current.savePreset('recent', '{"recent":false}')).toBe(true);
    });

    expect(result.current.getPresetByName('recent')).toEqual({
      name: 'recent',
      query: '{"recent":false}',
    });

    act(() => {
      expect(result.current.deletePreset('recent')).toBe(true);
    });

    expect(result.current.getPresetByName('recent')).toBeNull();
    expect(result.current.presets).toEqual([{ name: 'active', query: '{"status":"active"}' }]);
    expect(window.localStorage.getItem('mongo-viewer:query-presets:app.users')).toBe(
      JSON.stringify([{ name: 'active', query: '{"status":"active"}' }]),
    );
  });

  it('rejects invalid saves and deletes when selection or values are missing', () => {
    const { result, rerender } = renderHook(({ selection }) => useQueryPresets(selection), {
      initialProps: { selection: null as Selection | null },
    });

    act(() => {
      expect(result.current.savePreset('recent', '{"recent":true}')).toBe(false);
      expect(result.current.deletePreset('recent')).toBe(false);
    });

    rerender({ selection: usersSelection });

    act(() => {
      expect(result.current.savePreset('   ', '{"recent":true}')).toBe(false);
      expect(result.current.savePreset('recent', '   ')).toBe(false);
      expect(result.current.deletePreset('   ')).toBe(false);
    });

    expect(result.current.presets).toEqual([]);
  });

  it('refreshes presets when the selected collection changes', async () => {
    window.localStorage.setItem(
      'mongo-viewer:query-presets:app.users',
      JSON.stringify([{ name: 'active', query: '{"status":"active"}' }]),
    );
    window.localStorage.setItem(
      'mongo-viewer:query-presets:app.orders',
      JSON.stringify([{ name: 'open', query: '{"open":true}' }]),
    );

    const { result, rerender } = renderHook(({ selection }) => useQueryPresets(selection), {
      initialProps: { selection: usersSelection as Selection | null },
    });

    await waitFor(() => {
      expect(result.current.presets).toEqual([{ name: 'active', query: '{"status":"active"}' }]);
    });

    rerender({ selection: ordersSelection });

    await waitFor(() => {
      expect(result.current.presets).toEqual([{ name: 'open', query: '{"open":true}' }]);
    });

    rerender({ selection: null });

    await waitFor(() => {
      expect(result.current.presets).toEqual([]);
    });
  });
});
