import { useMemo, useState } from 'react';

import { ConnectionHome } from '@/components/connection-home';
import { MongoViewerClient } from '@/components/mongo-viewer';
import { TitleBar } from '@/components/title-bar';
import { useConnections } from '@/hooks/use-connections';
import { mongoViewer } from '@/lib/renderer-api';
import { TooltipProvider } from "@/components/ui/tooltip"

type View = 'connections' | 'viewer';

const { platform } = mongoViewer;

export default function App() {
  const [view, setView] = useState<View>('connections');

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

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TitleBar platform={platform} />
        <div className="flex min-h-0 flex-1 overflow-hidden p-2 md:p-3">
          {view === 'viewer' && connectionsState.activeConnectionId ? (
            <MongoViewerClient
              activeConnectionId={connectionsState.activeConnectionId}
              activeConnectionName={activeConnection?.name ?? null}
              onBack={async () => {
                await clearActiveConnection();
                setView('connections');
              }}
            />
          ) : (
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
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
