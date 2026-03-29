import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/renderer/components/ui/empty';
import type { ConnectionListItem, ConnectionsState } from '@/shared/mongo-types';
import ConnectionCard from './connection-card';
import { Link2 } from 'lucide-react';

type SavedConnectionsListProps = {
    connectionsState: ConnectionsState;
    loadingConnections: boolean;
    copiedId: string | null;
    onCopy: (connString: string, id: string) => void;
    onEdit: (connection: ConnectionListItem) => void;
    onDelete: (id: string, name: string) => void;
};

export function SavedConnectionsList({
    connectionsState,
    loadingConnections,
    copiedId,
    onCopy,
    onEdit,
    onDelete,
}: SavedConnectionsListProps) {
    const { connections } = connectionsState;

    return (
        <div className="flex-1 overflow-y-auto rounded-ss-[1rem] bg-background">
            <div className="p-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Saved Connections</h2>
                        {!loadingConnections && (
                            <p className="text-sm text-muted-foreground">
                                {connections.length} connection
                                {connections.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {/* Connections Grid */}
                    <div className="space-y-4">
                        {loadingConnections ? <p className="text-sm text-muted-foreground">Loading connections...</p> : null}

                        {connections.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Link2 />
                                    </EmptyMedia>
                                    <EmptyTitle>No connections yet</EmptyTitle>
                                    <EmptyDescription>Create your first MongoDB connection to get started</EmptyDescription>
                                </EmptyHeader>

                            </Empty>
                        ) : (
                            <div className="mt-1 grid grid-cols-4 gap-4 overflow-auto pr-1">
                                {connections.map((connection) => (
                                    <ConnectionCard
                                        key={connection.id}
                                        connection={connection}
                                        isCopied={copiedId === connection.id}
                                        onCopy={onCopy}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
