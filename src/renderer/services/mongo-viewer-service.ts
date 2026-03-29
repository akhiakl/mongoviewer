import type {
    CollectionIndexSummary,
    CollectionSchemaSummary,
    CollectionStats,
    ConnectionsState,
    DatabaseTreeItem,
    DocumentsQuery,
    DocumentsResult,
    SaveConnectionInput,
} from '@/shared/mongo-types';
import { mongoViewer } from '@/renderer/renderer-api';
import { logRendererError } from '@/renderer/services/logger';

async function invokeRendererApi<T>(
    action: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>,
) {
    try {
        return await operation();
    } catch (error) {
        logRendererError(`ipc.${action}`, error, context);
        throw error;
    }
}

export const mongoViewerService = {
    listConnections: () =>
        invokeRendererApi<ConnectionsState>('listConnections', () =>
            mongoViewer.listConnections(),
        ),
    saveConnection: (input: SaveConnectionInput) =>
        invokeRendererApi<{ id: string; name: string }>(
            'saveConnection',
            () => mongoViewer.saveConnection(input),
            { connectionName: input.name },
        ),
    deleteConnection: (connectionId: string) =>
        invokeRendererApi('deleteConnection', () => mongoViewer.deleteConnection(connectionId), {
            connectionId,
        }),
    pickTlsCertificate: () =>
        invokeRendererApi<string | null>('pickTlsCertificate', () =>
            mongoViewer.pickTlsCertificate(),
        ),
    listDatabaseTree: (connectionId: string) =>
        invokeRendererApi<DatabaseTreeItem[]>('listDatabaseTree', () =>
            mongoViewer.listDatabaseTree(connectionId),
        ),
    listDocuments: (query: DocumentsQuery) =>
        invokeRendererApi<DocumentsResult>('listDocuments', () => mongoViewer.listDocuments(query), {
            connectionId: query.connectionId,
            db: query.db,
            collection: query.collection,
        }),
    getCollectionIndexes: (query: DocumentsQuery) =>
        invokeRendererApi<CollectionIndexSummary[]>(
            'getCollectionIndexes',
            () => mongoViewer.getCollectionIndexes(query),
            {
                connectionId: query.connectionId,
                db: query.db,
                collection: query.collection,
            },
        ),
    getCollectionStats: (query: DocumentsQuery) =>
        invokeRendererApi<CollectionStats>('getCollectionStats', () =>
            mongoViewer.getCollectionStats(query),
        ),
    getCollectionSchemaSummary: (query: DocumentsQuery) =>
        invokeRendererApi<CollectionSchemaSummary>(
            'getCollectionSchemaSummary',
            () => mongoViewer.getCollectionSchemaSummary(query),
        ),
    setThemePreference: (themePreference: 'system' | 'light' | 'dark') =>
        invokeRendererApi('setThemePreference', () =>
            mongoViewer.setThemePreference(themePreference),
        ),
};
