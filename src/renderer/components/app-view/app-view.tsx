import { useMemo } from 'react'
import { useConnections } from '@/renderer/hooks/use-connections';
import { ConnectionHome } from '../connection-home';
import { MongoViewerClient } from '../mongo-viewer';
import { useAppView } from './app-view-context';

export const AppView = () => {
    const { view, setView } = useAppView();

    const {
        connectionsState,
        loadingConnections,
        connectionError,
        saveConnection,
        activateConnection,
        clearActiveConnection,
        removeConnection,
        pickTlsCertificate,
    } = useConnections();

    const activeConnection = useMemo(
        () =>
            connectionsState.connections.find(
                (connection) => connection.id === connectionsState.activeConnectionId,
            ) ?? null,
        [connectionsState.activeConnectionId, connectionsState.connections],
    );

    const handleActivateConnection = async (connectionId: string) => {
        await activateConnection(connectionId);
        setView('viewer');
    };
    if (view === 'viewer' && connectionsState.activeConnectionId) {
        return (
            <MongoViewerClient
                activeConnectionId={connectionsState.activeConnectionId}
                activeConnectionName={activeConnection?.name ?? null}
                onBack={async () => {
                    await clearActiveConnection();
                    setView('connections');
                }}
            />
        );
    }

    return (
        <div className="flex min-h-0 flex-1">
            <ConnectionHome
                connectionsState={connectionsState}
                loadingConnections={loadingConnections}
                connectionError={connectionError}
                onSaveConnection={saveConnection}
                onActivateConnection={handleActivateConnection}
                onDeleteConnection={removeConnection}
                onPickTlsCertificate={pickTlsCertificate}
            />
        </div>
    )
}
