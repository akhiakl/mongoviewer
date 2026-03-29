import { useEffect } from 'react';

import {
    selectConnections,
    selectConnectionsError,
    selectConnectionsHasLoaded,
    selectConnectionsLoading,
    useConnectionsStore,
} from '@/renderer/features/connections/store/connections-store';

export function useConnectionsController() {
    const connections = useConnectionsStore(selectConnections);
    const loadingConnections = useConnectionsStore(selectConnectionsLoading);
    const connectionError = useConnectionsStore(selectConnectionsError);
    const hasLoaded = useConnectionsStore(selectConnectionsHasLoaded);
    const refreshConnections = useConnectionsStore((state) => state.refresh);
    const saveConnection = useConnectionsStore((state) => state.save);
    const updateConnection = useConnectionsStore((state) => state.update);
    const removeConnection = useConnectionsStore((state) => state.remove);
    const pickTlsCertificate = useConnectionsStore((state) => state.pickTlsCertificate);

    useEffect(() => {
        if (!hasLoaded && !loadingConnections) {
            void refreshConnections();
        }
    }, [hasLoaded, loadingConnections, refreshConnections]);

    return {
        connectionsState: { connections },
        loadingConnections,
        connectionError,
        refreshConnections,
        saveConnection,
        updateConnection,
        removeConnection,
        pickTlsCertificate,
    };
}
