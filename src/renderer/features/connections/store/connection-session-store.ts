import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ConnectionStatusKind = 'idle' | 'connecting' | 'healthy' | 'error';

export type ConnectionStatus = {
    kind: ConnectionStatusKind;
    message: string | null;
    updatedAt: string | null;
};

type ConnectionSessionState = {
    recentConnectionIds: string[];
    statusesByConnectionId: Record<string, ConnectionStatus>;
    markOpened: (connectionId: string) => void;
    markConnecting: (connectionId: string) => void;
    markHealthy: (connectionId: string) => void;
    markError: (connectionId: string, message: string) => void;
    clearStatus: (connectionId: string) => void;
};

const STORAGE_KEY = 'mongoviewer-connection-sessions';
const MAX_RECENT_CONNECTIONS = 6;

const DEFAULT_CONNECTION_STATUS: ConnectionStatus = {
    kind: 'idle',
    message: null,
    updatedAt: null,
};

function touchRecentConnection(recentConnectionIds: string[], connectionId: string) {
    return [connectionId, ...recentConnectionIds.filter((id) => id !== connectionId)].slice(
        0,
        MAX_RECENT_CONNECTIONS,
    );
}

function createStatus(kind: ConnectionStatusKind, message: string | null = null): ConnectionStatus {
    return {
        kind,
        message,
        updatedAt: new Date().toISOString(),
    };
}

export const useConnectionSessionStore = create<ConnectionSessionState>()(
    persist(
        (set) => ({
            recentConnectionIds: [],
            statusesByConnectionId: {},
            markOpened: (connectionId) =>
                set((state) => ({
                    recentConnectionIds: touchRecentConnection(state.recentConnectionIds, connectionId),
                })),
            markConnecting: (connectionId) =>
                set((state) => ({
                    recentConnectionIds: touchRecentConnection(state.recentConnectionIds, connectionId),
                    statusesByConnectionId: {
                        ...state.statusesByConnectionId,
                        [connectionId]: createStatus('connecting'),
                    },
                })),
            markHealthy: (connectionId) =>
                set((state) => ({
                    recentConnectionIds: touchRecentConnection(state.recentConnectionIds, connectionId),
                    statusesByConnectionId: {
                        ...state.statusesByConnectionId,
                        [connectionId]: createStatus('healthy'),
                    },
                })),
            markError: (connectionId, message) =>
                set((state) => ({
                    recentConnectionIds: touchRecentConnection(state.recentConnectionIds, connectionId),
                    statusesByConnectionId: {
                        ...state.statusesByConnectionId,
                        [connectionId]: createStatus('error', message),
                    },
                })),
            clearStatus: (connectionId) =>
                set((state) => ({
                    statusesByConnectionId: Object.fromEntries(
                        Object.entries(state.statusesByConnectionId).filter(([id]) => id !== connectionId),
                    ),
                })),
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                recentConnectionIds: state.recentConnectionIds,
            }),
        },
    ),
);

export const selectRecentConnectionIds = (state: ConnectionSessionState) => state.recentConnectionIds;
export const selectConnectionStatus =
    (connectionId: string) => (state: ConnectionSessionState) =>
        state.statusesByConnectionId[connectionId] ?? DEFAULT_CONNECTION_STATUS;
