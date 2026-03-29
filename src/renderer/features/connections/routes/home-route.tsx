import { ConnectionHome } from '@/renderer/components/connection-home';
import { useConnectionsController } from '@/renderer/features/connections/hooks/use-connections-controller';

export function HomeRoute() {
    const {
        connectionsState,
        loadingConnections,
        connectionError,
        saveConnection,
        updateConnection,
        removeConnection,
        pickTlsCertificate,
    } = useConnectionsController();

    return (
        <ConnectionHome
            connectionsState={connectionsState}
            loadingConnections={loadingConnections}
            connectionError={connectionError}
            onSaveConnection={saveConnection}
            onUpdateConnection={updateConnection}
            onDeleteConnection={removeConnection}
            onPickTlsCertificate={pickTlsCertificate}
        />
    );
}
