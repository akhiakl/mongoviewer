import { ConnectionHome } from '@/renderer/components/connection-home';
import { useConnectionsController } from '@/renderer/features/connections/hooks/use-connections-controller';

export function HomeRoute() {
    const {
        connectionsState,
        loadingConnections,
        connectionError,
        saveConnection,
        removeConnection,
        pickTlsCertificate,
    } = useConnectionsController();

    return (
        <ConnectionHome
            connectionsState={connectionsState}
            loadingConnections={loadingConnections}
            connectionError={connectionError}
            onSaveConnection={saveConnection}
            onDeleteConnection={removeConnection}
            onPickTlsCertificate={pickTlsCertificate}
        />
    );
}
