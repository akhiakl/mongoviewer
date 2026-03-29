import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { MongoViewerClient } from '@/renderer/components/mongo-viewer';
import { Button } from '@/renderer/components/ui/button';
import { useConnections } from '@/renderer/hooks/use-connections';

export function ConnectionPage() {
    const navigate = useNavigate();
    const { connectionId } = useParams();
    const { connectionError, connectionsState, loadingConnections } = useConnections();

    const activeConnection = useMemo(
        () =>
            connectionId
                ? connectionsState.connections.find((connection) => connection.id === connectionId) ?? null
                : null,
        [connectionId, connectionsState.connections],
    );

    if (!connectionId) {
        return <Navigate to="/" replace />;
    }

    if (loadingConnections) {
        return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading connection...</div>;
    }

    if (connectionError) {
        return (
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-sm text-destructive">{connectionError}</p>
                    <Button asChild variant="outline">
                        <Link to="/">Back To Connections</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!activeConnection) {
        return (
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">That saved connection could not be found.</p>
                    <Button asChild variant="outline">
                        <Link to="/">Back To Connections</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <MongoViewerClient
            connectionId={activeConnection.id}
            activeConnectionName={activeConnection.name}
            onBack={() => navigate('/')}
        />
    );
}
