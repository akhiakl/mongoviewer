import type {
  ConnectionsState,
  DatabaseTreeItem,
  DocumentsQuery,
  DocumentsResult,
  SaveConnectionInput,
} from './lib/mongo-types';

export {};

declare global {
    interface Window {
        mongoViewer: {
            listDatabases(connectionString: string): Promise<string[]>;
            listConnections(): Promise<ConnectionsState>;
            saveConnection(input: SaveConnectionInput): Promise<{ id: string; name: string }>;
            deleteConnection(connectionId: string): Promise<{ activeConnectionId: string | null }>;
            setActiveConnection(connectionId: string): Promise<void>;
            listDatabaseTree(): Promise<DatabaseTreeItem[]>;
            listDocuments(query: DocumentsQuery): Promise<DocumentsResult>;
            pickTlsCertificate(): Promise<string | null>;
        };
    }
}