import { useMemo, useState } from 'react';

import { ConnectionHome } from '@/components/connection-home';
import { MongoViewerClient } from '@/components/mongo-viewer';
import { TitleBar } from '@/components/title-bar';
import { useConnections } from '@/hooks/use-connections';
import { mongoViewer } from '@/lib/renderer-api';
import { TooltipProvider } from "@/components/ui/tooltip"

type View = 'connections' | 'viewer';

const { platform } = mongoViewer;

const bgGradient =
  'bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_30%),linear-gradient(180deg,#f5f3ef_0%,#ebe6dd_100%)]';

export default function App() {
  const [view, setView] = useState<View>('connections');

  const {
    connectionsState,
    loadingConnections,
    connectionError,
    saveConnection,
    activateConnection,
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

  const subtitle = view === 'viewer' ? (activeConnection?.name ?? null) : null;

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TitleBar platform={platform} subtitle={subtitle} />
        <div className={`flex-1 overflow-hidden ${bgGradient} p-4 md:p-6`}>
          {view === 'viewer' && connectionsState.activeConnectionId ? (
            <MongoViewerClient
              activeConnectionId={connectionsState.activeConnectionId}
              activeConnectionName={activeConnection?.name ?? null}
              onBack={() => setView('connections')}
            />
          ) : (
            <div className="flex min-h-full items-center justify-center">
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