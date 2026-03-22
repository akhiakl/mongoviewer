import {
    clearActiveConnection,
    createConnection,
    deleteConnection,
    getActiveConnection,
    getConnectionsState,
    setActiveConnection,
} from '../connection-store';

import {
    getCollectionSchemaSummary,
    getCollectionStats,
    listCollectionIndexes,
    listDatabaseNames,
    listDatabaseTree,
    listDocuments,
} from '../mongo-service';

import {
    persistTlsCertificate,
    removeTlsCertificate,
} from '../tls-certificate-service';

import type {
    DocumentsQuery,
    SaveConnectionInput,
} from '@/shared/mongo-types';

import {
    requireNonEmptyString,
    validateDocumentsQuery,
} from '../input-validators';

import { IpcHandlerMap } from '@/shared/types';
import { buildMongoConnectionString } from '../mongo-connection';

export const mongoHandlers = {
    'mongo:list-databases': async (_event, connectionString: string) => {
        const normalizedConnectionString = requireNonEmptyString(
            connectionString,
            'A MongoDB connection string is required.',
        );

        try {
            return await listDatabaseNames(normalizedConnectionString);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown connection error.';
            throw new Error(`Failed to connect to MongoDB: ${message}`, {
                cause: error,
            });
        }
    },

    'mongo:list-connections': async () => {
        return getConnectionsState();
    },

    'mongo:save-connection': async (_event, input: SaveConnectionInput) => {
        const name = requireNonEmptyString(input.name, 'Connection name is required.');
        const connectionString = requireNonEmptyString(
            input.connectionString,
            'Connection string is required.',
        );

        const selectedTlsCertificatePath = input.tlsCertificatePath?.trim();

        let persistedTlsCertificatePath: string | undefined;

        if (selectedTlsCertificatePath) {
            persistedTlsCertificatePath = await persistTlsCertificate(
                selectedTlsCertificatePath,
            );
        }

        const uri = buildMongoConnectionString(
            connectionString,
            persistedTlsCertificatePath,
        );

        try {
            return await createConnection({
                name,
                uri,
                tlsCertificatePath: persistedTlsCertificatePath,
            });
        } catch (error) {
            await removeTlsCertificate(persistedTlsCertificatePath);
            throw error;
        }
    },

    'mongo:delete-connection': async (_event, connectionId: string) => {
        const normalizedConnectionId = requireNonEmptyString(
            connectionId,
            'Connection id is required.',
        );

        return deleteConnection(normalizedConnectionId);
    },

    'mongo:set-active-connection': async (_event, connectionId: string) => {
        const normalizedConnectionId = requireNonEmptyString(
            connectionId,
            'Connection id is required.',
        );

        return setActiveConnection(normalizedConnectionId);
    },

    'mongo:clear-active-connection': async () => {
        return clearActiveConnection();
    },

    'mongo:list-database-tree': async () => {
        const activeConnection = await getActiveConnection();
        if (!activeConnection) {
            throw new Error('No active connection selected.');
        }

        return listDatabaseTree(activeConnection.uri);
    },

    'mongo:list-documents': async (_event, query: DocumentsQuery) => {
        validateDocumentsQuery(query);

        const activeConnection = await getActiveConnection();
        if (!activeConnection) {
            throw new Error('No active connection selected.');
        }

        return listDocuments(activeConnection.uri, query);
    },

    'mongo:get-collection-indexes': async (_event, query: DocumentsQuery) => {
        validateDocumentsQuery(query);

        const activeConnection = await getActiveConnection();
        if (!activeConnection) {
            throw new Error('No active connection selected.');
        }

        return listCollectionIndexes(activeConnection.uri, query);
    },

    'mongo:get-collection-stats': async (_event, query: DocumentsQuery) => {
        validateDocumentsQuery(query);

        const activeConnection = await getActiveConnection();
        if (!activeConnection) {
            throw new Error('No active connection selected.');
        }

        return getCollectionStats(activeConnection.uri, query);
    },

    'mongo:get-collection-schema-summary': async (_event, query: DocumentsQuery) => {
        validateDocumentsQuery(query);

        const activeConnection = await getActiveConnection();
        if (!activeConnection) {
            throw new Error('No active connection selected.');
        }

        return getCollectionSchemaSummary(activeConnection.uri, query);
    },
} satisfies IpcHandlerMap<'mongo'>;