import { beforeEach, describe, expect, it } from 'vitest';

import { useConnectionSessionStore } from '@/renderer/features/connections/store/connection-session-store';

describe('connection-session-store', () => {
    beforeEach(() => {
        window.localStorage.clear();
        useConnectionSessionStore.setState({
            recentConnectionIds: [],
            statusesByConnectionId: {},
        });
    });

    it('tracks recent connections and status transitions', () => {
        const state = useConnectionSessionStore.getState();

        state.markOpened('conn-1');
        state.markConnecting('conn-1');
        state.markHealthy('conn-1');
        state.markError('conn-2', 'TLS failed');

        expect(useConnectionSessionStore.getState().recentConnectionIds).toEqual([
            'conn-2',
            'conn-1',
        ]);
        expect(useConnectionSessionStore.getState().statusesByConnectionId['conn-1']?.kind).toBe(
            'healthy',
        );
        expect(
            useConnectionSessionStore.getState().statusesByConnectionId['conn-2']?.message,
        ).toBe('TLS failed');
    });
});
