import { useEffect, useState } from 'react';

import type { ConnectionsState, SaveConnectionInput } from '@/shared/mongo-types';
import { mongoViewer } from '@/renderer/renderer-api';

const INITIAL_CONNECTIONS_STATE: ConnectionsState = {
    connections: [],
    activeConnectionId: null,
};

export function useConnections() {
    const [connectionsState, setConnectionsState] = useState<ConnectionsState>(
        INITIAL_CONNECTIONS_STATE,
    );
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        void refreshConnections();
    }, []);

    async function refreshConnections() {
        setLoadingConnections(true);
        setConnectionError(null);

        try {
            const nextState = await mongoViewer.listConnections();
            setConnectionsState(nextState);
        } catch (error) {
            setConnectionError(error instanceof Error ? error.message : 'Unable to load saved connections.');
        } finally {
            setLoadingConnections(false);
        }
    }

    async function saveConnection(input: SaveConnectionInput) {
        setConnectionError(null);

        try {
            await mongoViewer.saveConnection(input);
            await refreshConnections();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save connection.';
            setConnectionError(message);
            throw error;
        }
    }

    async function activateConnection(connectionId: string) {
        setConnectionError(null);

        try {
            await mongoViewer.setActiveConnection(connectionId);
            setConnectionsState((current) => ({
                ...current,
                activeConnectionId: connectionId,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to activate connection.';
            setConnectionError(message);
            throw error;
        }
    }

    async function clearActiveConnection() {
        setConnectionError(null);

        try {
            const result = await mongoViewer.clearActiveConnection();
            setConnectionsState((current) => ({
                ...current,
                activeConnectionId: result.activeConnectionId,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to clear the active connection.';
            setConnectionError(message);
            throw error;
        }
    }

    async function removeConnection(connectionId: string) {
        setConnectionError(null);

        try {
            const result = await mongoViewer.deleteConnection(connectionId);
            setConnectionsState((current) => ({
                connections: current.connections.filter((item) => item.id !== connectionId),
                activeConnectionId: result.activeConnectionId,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to delete connection.';
            setConnectionError(message);
            throw error;
        }
    }

    async function pickTlsCertificate() {
        setConnectionError(null);

        try {
            return await mongoViewer.pickTlsCertificate();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unable to select a TLS certificate.';
            setConnectionError(message);
            throw error;
        }
    }

    return {
        connectionsState,
        loadingConnections,
        connectionError,
        refreshConnections,
        saveConnection,
        activateConnection,
        clearActiveConnection,
        removeConnection,
        pickTlsCertificate,
    };
}
