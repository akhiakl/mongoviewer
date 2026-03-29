import { beforeEach, describe, expect, it } from 'vitest';

import { useQueryHistoryStore } from '@/renderer/features/viewer/store/query-history-store';

describe('query-history-store', () => {
    beforeEach(() => {
        window.localStorage.clear();
        useQueryHistoryStore.setState({
            entriesByConnectionId: {},
        });
    });

    it('deduplicates entries and clears collection-scoped history', () => {
        const state = useQueryHistoryStore.getState();

        state.addEntry({
            connectionId: 'conn-1',
            db: 'app',
            collection: 'users',
            query: '{"status":"active"}',
            resultCount: 4,
        });
        state.addEntry({
            connectionId: 'conn-1',
            db: 'app',
            collection: 'users',
            query: '{"status":"active"}',
            resultCount: 8,
        });
        state.addEntry({
            connectionId: 'conn-1',
            db: 'app',
            collection: 'orders',
            query: '{"state":"new"}',
            resultCount: 2,
        });

        expect(useQueryHistoryStore.getState().entriesByConnectionId['conn-1']).toHaveLength(2);

        useQueryHistoryStore.getState().clearEntries('conn-1', {
            db: 'app',
            collection: 'users',
        });

        expect(useQueryHistoryStore.getState().entriesByConnectionId['conn-1']).toHaveLength(1);
        expect(
            useQueryHistoryStore.getState().entriesByConnectionId['conn-1']?.[0]?.collection,
        ).toBe('orders');
    });

    it('removes individual entries and clears all entries for a connection', () => {
        const state = useQueryHistoryStore.getState();

        state.addEntry({
            connectionId: 'conn-1',
            db: 'app',
            collection: 'users',
            query: '{"status":"active"}',
            resultCount: 1,
        });
        state.addEntry({
            connectionId: 'conn-1',
            db: 'app',
            collection: 'orders',
            query: '{"state":"new"}',
            resultCount: 2,
        });

        const entryId = useQueryHistoryStore.getState().entriesByConnectionId['conn-1']?.[0]?.id;
        expect(entryId).toBeTruthy();
        if (entryId) {
            useQueryHistoryStore.getState().removeEntry('conn-1', entryId);
        }

        expect(useQueryHistoryStore.getState().entriesByConnectionId['conn-1']).toHaveLength(1);

        useQueryHistoryStore.getState().clearEntries('conn-1');
        expect(useQueryHistoryStore.getState().entriesByConnectionId['conn-1']).toEqual([]);
    });
});
