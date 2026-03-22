import { useEffect, useState } from 'react';

import { getPresetStorageKey, parseStoredPresets, toStoredPresets, type QueryPreset, upsertPreset, removePresetByName } from '@/renderer/components/mongo-viewer/query-presets';
import type { Selection } from '@/renderer/components/mongo-viewer/types';

export function useQueryPresets(selection: Selection | null) {
  const [presets, setPresets] = useState<QueryPreset[]>([]);

  useEffect(() => {
    const storageKey = getPresetStorageKey(selection);
    if (!storageKey) {
      setPresets([]);
      return;
    }

    setPresets(parseStoredPresets(window.localStorage.getItem(storageKey)));
  }, [selection]);

  const savePreset = (name: string, query: string) => {
    const storageKey = getPresetStorageKey(selection);
    const normalizedName = name.trim();
    const normalizedQuery = query.trim();

    if (!storageKey || !normalizedName || !normalizedQuery) {
      return false;
    }

    const nextPresets = upsertPreset(presets, {
      name: normalizedName,
      query: normalizedQuery,
    });

    window.localStorage.setItem(storageKey, toStoredPresets(nextPresets));
    setPresets(nextPresets);
    return true;
  };

  const deletePreset = (name: string) => {
    const storageKey = getPresetStorageKey(selection);
    const normalizedName = name.trim();

    if (!storageKey || !normalizedName) {
      return false;
    }

    const nextPresets = removePresetByName(presets, normalizedName);
    window.localStorage.setItem(storageKey, toStoredPresets(nextPresets));
    setPresets(nextPresets);
    return nextPresets.length !== presets.length;
  };

  const getPresetByName = (name: string) => presets.find((preset) => preset.name === name) ?? null;

  return {
    presets,
    savePreset,
    deletePreset,
    getPresetByName,
  };
}
