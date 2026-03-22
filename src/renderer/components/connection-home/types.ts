import type { ConnectionsState, SaveConnectionInput } from '@/shared/mongo-types';

export type ConnectionHomeProps = {
    connectionsState: ConnectionsState;
    loadingConnections: boolean;
    connectionError: string | null;
    onSaveConnection: (input: SaveConnectionInput) => Promise<void>;
    onActivateConnection: (connectionId: string) => Promise<void>;
    onDeleteConnection: (connectionId: string) => Promise<void>;
    onPickTlsCertificate: () => Promise<string | null>;
};
