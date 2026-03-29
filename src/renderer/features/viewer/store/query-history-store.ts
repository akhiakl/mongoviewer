import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type QueryHistoryEntry = {
    id: string;
    connectionId: string;
    db: string;
    collection: string;
    query: string;
    executedAt: string;
    resultCount: number;
};

type QueryHistoryState = {
    entriesByConnectionId: Record<string, QueryHistoryEntry[]>;
    addEntry: (entry: Omit<QueryHistoryEntry, 'id' | 'executedAt'>) => void;
    removeEntry: (connectionId: string, entryId: string) => void;
    clearEntries: (connectionId: string, scope?: { db: string; collection: string }) => void;
};

const STORAGE_KEY = 'mongoviewer-query-history';
const MAX_HISTORY_PER_CONNECTION = 30;
const EMPTY_QUERY_HISTORY: QueryHistoryEntry[] = [];

function makeEntryId(entry: Omit<QueryHistoryEntry, 'id' | 'executedAt'>) {
    return `${entry.connectionId}:${entry.db}:${entry.collection}:${entry.query}`;
}

export const useQueryHistoryStore = create<QueryHistoryState>()(
    persist(
        (set) => ({
            entriesByConnectionId: {},
            addEntry: (entry) =>
                set((state) => {
                    const nextEntry: QueryHistoryEntry = {
                        ...entry,
                        id: makeEntryId(entry),
                        executedAt: new Date().toISOString(),
                    };
                    const previousEntries = state.entriesByConnectionId[entry.connectionId] ?? [];
                    const dedupedEntries = previousEntries.filter(
                        (item) =>
                            !(
                                item.db === entry.db &&
                                item.collection === entry.collection &&
                                item.query === entry.query
                            ),
                    );

                    return {
                        entriesByConnectionId: {
                            ...state.entriesByConnectionId,
                            [entry.connectionId]: [nextEntry, ...dedupedEntries].slice(
                                0,
                                MAX_HISTORY_PER_CONNECTION,
                            ),
                        },
                    };
                }),
            removeEntry: (connectionId, entryId) =>
                set((state) => ({
                    entriesByConnectionId: {
                        ...state.entriesByConnectionId,
                        [connectionId]: (state.entriesByConnectionId[connectionId] ?? []).filter(
                            (entry) => entry.id !== entryId,
                        ),
                    },
                })),
            clearEntries: (connectionId, scope) =>
                set((state) => ({
                    entriesByConnectionId: {
                        ...state.entriesByConnectionId,
                        [connectionId]: scope
                            ? (state.entriesByConnectionId[connectionId] ?? []).filter(
                                  (entry) =>
                                      entry.db !== scope.db || entry.collection !== scope.collection,
                              )
                            : [],
                    },
                })),
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export type { QueryHistoryEntry };

export const selectConnectionQueryHistory =
    (connectionId: string) => (state: QueryHistoryState) =>
        state.entriesByConnectionId[connectionId] ?? EMPTY_QUERY_HISTORY;
