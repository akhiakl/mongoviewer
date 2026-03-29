import { useEffect, useState } from 'react';

import type { ConnectionsState, SaveConnectionInput } from '@/shared/mongo-types';
import { mongoViewer } from '@/renderer/renderer-api';

const INITIAL_CONNECTIONS_STATE: ConnectionsState = {
    connections: [],
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

    async function removeConnection(connectionId: string) {
        setConnectionError(null);

        try {
            await mongoViewer.deleteConnection(connectionId);
            setConnectionsState((current) => ({
                connections: current.connections.filter((item) => item.id !== connectionId),
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
        removeConnection,
        pickTlsCertificate,
    };
}
