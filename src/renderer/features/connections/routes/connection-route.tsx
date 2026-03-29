import { useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { MongoViewerClient } from '@/renderer/components/mongo-viewer';
import { Button } from '@/renderer/components/ui/button';
import { useConnectionsController } from '@/renderer/features/connections/hooks/use-connections-controller';
import { useConnectionSessionStore } from '@/renderer/features/connections/store/connection-session-store';
import { getMongoErrorGuidance } from '@/renderer/features/viewer/mongo-error-guidance';
import {
    selectConnectionById,
    useConnectionsStore,
} from '@/renderer/features/connections/store/connections-store';

export function ConnectionRoute() {
    const navigate = useNavigate();
    const { connectionId } = useParams();
    const { connectionError, loadingConnections, refreshConnections } = useConnectionsController();
    const markOpened = useConnectionSessionStore((state) => state.markOpened);
    const activeConnection = useConnectionsStore(
        useMemo(() => selectConnectionById(connectionId), [connectionId]),
    );
    const errorGuidance = getMongoErrorGuidance(
        connectionError,
        'Unable to load the saved connection.',
    );

    useEffect(() => {
        if (connectionId) {
            markOpened(connectionId);
        }
    }, [connectionId, markOpened]);

    if (!connectionId) {
        return <Navigate to="/" replace />;
    }

    if (loadingConnections) {
        return (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading connection...
            </div>
        );
    }

    if (connectionError) {
        return (
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-sm text-destructive">{connectionError}</p>
                    <p className="text-xs text-muted-foreground">{errorGuidance.hint}</p>
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                void refreshConnections(true);
                            }}
                        >
                            Retry
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/">Back To Connections</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!activeConnection) {
        return (
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">
                        That saved connection could not be found.
                    </p>
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
