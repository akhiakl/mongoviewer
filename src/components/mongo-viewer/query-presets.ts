export type QueryPreset = {
  name: string;
  query: string;
};

export function parseStoredPresets(raw: string | null | undefined): QueryPreset[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is QueryPreset =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as QueryPreset).name === 'string' &&
        typeof (item as QueryPreset).query === 'string',
    );
  } catch {
    return [];
  }
}

export function toStoredPresets(presets: QueryPreset[]) {
  return JSON.stringify(presets);
}

export function upsertPreset(presets: QueryPreset[], nextPreset: QueryPreset) {
  const index = presets.findIndex((item) => item.name === nextPreset.name);
  if (index === -1) {
    return [...presets, nextPreset];
  }

  const next = [...presets];
  next[index] = nextPreset;
  return next;
}

export function removePresetByName(presets: QueryPreset[], name: string) {
  return presets.filter((item) => item.name !== name);
}
