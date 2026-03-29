import type {
    CollectionIndexSummary,
    CollectionSchemaSummary,
    CollectionStats,
    ConnectionsState,
    DatabaseTreeItem,
    DocumentsQuery,
    DocumentsResult,
    SaveConnectionInput,
} from '../shared/mongo-types';

export { };

declare global {
    interface Window {
        mongoViewer: {
            listDatabases(connectionString: string): Promise<string[]>;
            listConnections(): Promise<ConnectionsState>;
            saveConnection(input: SaveConnectionInput): Promise<{ id: string; name: string }>;
            deleteConnection(connectionId: string): Promise<void>;
            listDatabaseTree(connectionId: string): Promise<DatabaseTreeItem[]>;
            listDocuments(query: DocumentsQuery): Promise<DocumentsResult>;
            getCollectionIndexes(query: DocumentsQuery): Promise<CollectionIndexSummary[]>;
            getCollectionStats(query: DocumentsQuery): Promise<CollectionStats>;
            getCollectionSchemaSummary(query: DocumentsQuery): Promise<CollectionSchemaSummary>;
            pickTlsCertificate(): Promise<string | null>;
        };
    }
}
