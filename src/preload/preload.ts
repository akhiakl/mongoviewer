import { contextBridge } from 'electron';
import { invoke } from './ipc';
import type { DocumentsQuery, SaveConnectionInput } from '@/shared/mongo-types';

export const api = {
    platform: process.platform,

    listDatabases: (connectionString: string) =>
        invoke('mongo:list-databases', connectionString),

    listConnections: () =>
        invoke('mongo:list-connections'),

    saveConnection: (input: SaveConnectionInput) =>
        invoke('mongo:save-connection', input),

    deleteConnection: (connectionId: string) =>
        invoke('mongo:delete-connection', connectionId),

    listDatabaseTree: (connectionId: string) =>
        invoke('mongo:list-database-tree', connectionId),

    listDocuments: (query: DocumentsQuery) =>
        invoke('mongo:list-documents', query),

    getCollectionIndexes: (query: DocumentsQuery) =>
        invoke('mongo:get-collection-indexes', query),

    getCollectionStats: (query: DocumentsQuery) =>
        invoke('mongo:get-collection-stats', query),

    getCollectionSchemaSummary: (query: DocumentsQuery) =>
        invoke('mongo:get-collection-schema-summary', query),

    pickTlsCertificate: () =>
        invoke('dialog:pick-tls-certificate'),

    persistTlsCertificate: (path: string) =>
        invoke('dialog:persist-tls-certificate', path),

    setThemePreference: (themePreference: 'system' | 'light' | 'dark') =>
        invoke('window:set-theme-preference', themePreference),

};

contextBridge.exposeInMainWorld('mongoViewer', api);
