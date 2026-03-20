import type {
    ConnectionsState,
    DatabaseTreeItem,
    DocumentsQuery,
    DocumentsResult,
    SaveConnectionInput,
} from './mongo-types';

type MongoViewerApi = {
    platform: string;
    listDatabases(connectionString: string): Promise<string[]>;
    listConnections(): Promise<ConnectionsState>;
    saveConnection(input: SaveConnectionInput): Promise<{ id: string; name: string }>;
    deleteConnection(connectionId: string): Promise<{ activeConnectionId: string | null }>;
    setActiveConnection(connectionId: string): Promise<void>;
    clearActiveConnection(): Promise<{ activeConnectionId: string | null }>;
    listDatabaseTree(): Promise<DatabaseTreeItem[]>;
    listDocuments(query: DocumentsQuery): Promise<DocumentsResult>;
    pickTlsCertificate(): Promise<string | null>;
};

export const mongoViewer = (window as unknown as { mongoViewer: MongoViewerApi }).mongoViewer;
