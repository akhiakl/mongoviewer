import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConnectionsState } from '@/lib/mongo-types';

type SavedConnectionsListProps = {
    connectionsState: ConnectionsState;
    loadingConnections: boolean;
    connectingId: string | null;
    deletingId: string | null;
    onConnect: (connectionId: string) => Promise<void>;
    onDelete: (connectionId: string) => Promise<void>;
};

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
            <CardContent className="min-h-0 flex-1">
                {loadingConnections ? <p className="text-sm text-muted-foreground">Loading connections...</p> : null}

                {connections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved connections yet.</p>
                ) : (
                    <div className="mt-1 space-y-2 overflow-auto pr-1">
                        {connections.map((connection) => (
                            <div
                                key={connection.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground">{connection.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(connection.createdAt).toLocaleString()}
                                    </p>
                                    {activeConnectionId === connection.id ? (
                                        <Badge variant="secondary" className="mt-1">
                                            Active
                                        </Badge>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={connectingId === connection.id}
                                        onClick={() => {
                                            void onConnect(connection.id);
                                        }}
                                    >
                                        {connectingId === connection.id ? 'Connecting...' : activeConnectionId === connection.id ? 'Open' : 'Connect'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={deletingId === connection.id}
                                        onClick={() => {
                                            void onDelete(connection.id);
                                        }}
                                    >
                                        {deletingId === connection.id ? 'Removing...' : 'Remove'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
