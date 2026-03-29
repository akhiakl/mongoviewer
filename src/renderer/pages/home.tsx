import { useConnections } from '@/renderer/hooks/use-connections';
import { ConnectionHome } from '../components/connection-home';

export const Home = () => {
    const {
        connectionsState,
        loadingConnections,
        connectionError,
        saveConnection,
        removeConnection,
        pickTlsCertificate,
    } = useConnections();

    return (
        <ConnectionHome
            connectionsState={connectionsState}
            loadingConnections={loadingConnections}
            connectionError={connectionError}
            onSaveConnection={saveConnection}
            onDeleteConnection={removeConnection}
            onPickTlsCertificate={pickTlsCertificate}
        />
    )
}
