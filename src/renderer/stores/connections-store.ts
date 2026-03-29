import { create } from 'zustand';

import { mongoViewer } from '@/renderer/renderer-api';
import type { ConnectionListItem, ConnectionsState, SaveConnectionInput } from '@/shared/mongo-types';

export type ConnectionsStoreState = {
    connections: ConnectionListItem[];
    loading: boolean;
    error: string | null;
    hasLoaded: boolean;
    refresh: (force?: boolean) => Promise<void>;
    save: (input: SaveConnectionInput) => Promise<void>;
    remove: (connectionId: string) => Promise<void>;
    pickTlsCertificate: () => Promise<string | null>;
    getById: (connectionId: string) => ConnectionListItem | null;
};

let refreshPromise: Promise<void> | null = null;

const INITIAL_CONNECTIONS_STATE: ConnectionsState = {
    connections: [],
};

function normalizeError(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export const useConnectionsStore = create<ConnectionsStoreState>((set, get) => ({
    connections: INITIAL_CONNECTIONS_STATE.connections,
    loading: false,
    error: null,
    hasLoaded: false,
    refresh: async (force = false) => {
        if (refreshPromise && !force) {
            return refreshPromise;
        }

        if (get().hasLoaded && !force) {
            return;
        }

        set({ loading: true, error: null });

        refreshPromise = (async () => {
            try {
                const nextState = await mongoViewer.listConnections();
                set({
                    connections: nextState.connections,
                    loading: false,
                    error: null,
                    hasLoaded: true,
                });
            } catch (error) {
                set({
                    loading: false,
                    error: normalizeError(error, 'Unable to load saved connections.'),
                    hasLoaded: true,
                });
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    },
    save: async (input) => {
        set({ error: null });

        try {
            await mongoViewer.saveConnection(input);
            await get().refresh(true);
        } catch (error) {
            set({
                error: normalizeError(error, 'Unable to save connection.'),
            });
            throw error;
        }
    },
    remove: async (connectionId) => {
        set({ error: null });

        try {
            await mongoViewer.deleteConnection(connectionId);
            set((state) => ({
                connections: state.connections.filter((item) => item.id !== connectionId),
            }));
        } catch (error) {
            set({
                error: normalizeError(error, 'Unable to delete connection.'),
            });
            throw error;
        }
    },
    pickTlsCertificate: async () => {
        set({ error: null });

        try {
            return await mongoViewer.pickTlsCertificate();
        } catch (error) {
            const message = normalizeError(
                error,
                'Unable to select a TLS certificate.',
            );
            set({ error: message });
            throw error;
        }
    },
    getById: (connectionId) =>
        get().connections.find((connection) => connection.id === connectionId) ?? null,
}));

export const selectConnections = (state: ConnectionsStoreState) => state.connections;
export const selectConnectionsLoading = (state: ConnectionsStoreState) => state.loading;
export const selectConnectionsError = (state: ConnectionsStoreState) => state.error;
export const selectConnectionsHasLoaded = (state: ConnectionsStoreState) => state.hasLoaded;
export const selectConnectionById =
    (connectionId: string | undefined) => (state: ConnectionsStoreState) =>
        connectionId
            ? state.connections.find((connection) => connection.id === connectionId) ?? null
            : null;
