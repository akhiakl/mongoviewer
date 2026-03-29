import type { ConnectionsState, SaveConnectionInput, UpdateConnectionInput } from '@/shared/mongo-types';

export type ConnectionHomeProps = {
    connectionsState: ConnectionsState;
    loadingConnections: boolean;
    connectionError: string | null;
    onSaveConnection: (input: SaveConnectionInput) => Promise<void>;
    onUpdateConnection: (input: UpdateConnectionInput) => Promise<void>;
    onDeleteConnection: (connectionId: string) => Promise<void>;
    onPickTlsCertificate: () => Promise<string | null>;
};
