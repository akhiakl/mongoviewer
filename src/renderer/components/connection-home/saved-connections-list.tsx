import { Badge } from '@/renderer/components/ui/badge';
import { Button } from '@/renderer/components/ui/button';
import { ButtonGroup } from '@/renderer/components/ui/button-group';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card';
import type { ConnectionsState } from '@/shared/mongo-types';
import { Trash2 } from 'lucide-react';

type SavedConnectionsListProps = {
    connectionsState: ConnectionsState;
    loadingConnections: boolean;
    connectingId: string | null;
    deletingId: string | null;
    onConnect: (connectionId: string) => Promise<void>;
    onDelete: (connectionId: string) => Promise<void>;
};

const getConnectionDetails = (uri: string) => {
    try {
        const url = new URL(uri);
        return `${url.hostname}:${url.port}`;
    } catch {
        return 'Invalid URI';
    }
};

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

export function SavedConnectionsList({
    connectionsState,
    loadingConnections,
    connectingId,
    deletingId,
    onConnect,
    onDelete,
}: SavedConnectionsListProps) {
    const { connections, activeConnectionId } = connectionsState;

    return (
        <Card className="flex h-full min-h-0 w-full flex-col">
            <CardHeader className="pb-4">
                <CardTitle>Saved Connections</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-auto">
                {loadingConnections ? <p className="text-sm text-muted-foreground">Loading connections...</p> : null}

                {connections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved connections yet.</p>
                ) : (
                    <div className="mt-1 space-y-2 overflow-auto pr-1">
                        {connections.map((connection) => (
                            <Card
                                key={connection.id}
                                className="rounded-lg border border-border"
                            >
                                <CardHeader>
                                    <CardTitle>{connection.name}</CardTitle>
                                    <CardDescription>
                                        <p>{getConnectionDetails(connection.uri)}</p>
                                        <p className="text-sm">created {timeAgo(connection.createdAt)}</p>
                                    </CardDescription>
                                    {activeConnectionId === connection.id ? (
                                        <Badge variant="secondary" className="mt-1">
                                            Active
                                        </Badge>
                                    ) : null}
                                    <CardAction>
                                        <ButtonGroup>
                                            <Button
                                                variant="default"
                                                disabled={connectingId === connection.id}
                                                onClick={() => {
                                                    void onConnect(connection.id);
                                                }}
                                            >
                                                {connectingId === connection.id ? 'Connecting...' : activeConnectionId === connection.id ? 'Open' : 'Connect'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                disabled={deletingId === connection.id}
                                                onClick={() => {
                                                    void onDelete(connection.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </ButtonGroup>
                                    </CardAction>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
