import { contextBridge, ipcRenderer } from 'electron';

import type {
    ConnectionsState,
    DatabaseTreeItem,
    DocumentsQuery,
    DocumentsResult,
    SaveConnectionInput,
} from './lib/mongo-types';

contextBridge.exposeInMainWorld('mongoViewer', {
    platform: process.platform,
    listDatabases: (connectionString: string) =>
        ipcRenderer.invoke('mongo:list-databases', connectionString) as Promise<string[]>,
    listConnections: () => ipcRenderer.invoke('mongo:list-connections') as Promise<ConnectionsState>,
    saveConnection: (input: SaveConnectionInput) =>
        ipcRenderer.invoke('mongo:save-connection', input) as Promise<{ id: string; name: string }>,
    deleteConnection: (connectionId: string) =>
        ipcRenderer.invoke('mongo:delete-connection', connectionId) as Promise<{
            activeConnectionId: string | null;
        }>,
    setActiveConnection: (connectionId: string) =>
        ipcRenderer.invoke('mongo:set-active-connection', connectionId) as Promise<void>,
    clearActiveConnection: () =>
        ipcRenderer.invoke('mongo:clear-active-connection') as Promise<{
            activeConnectionId: string | null;
        }>,
    listDatabaseTree: () =>
        ipcRenderer.invoke('mongo:list-database-tree') as Promise<DatabaseTreeItem[]>,
    listDocuments: (query: DocumentsQuery) =>
        ipcRenderer.invoke('mongo:list-documents', query) as Promise<DocumentsResult>,
    pickTlsCertificate: () => ipcRenderer.invoke('dialog:pick-tls-certificate') as Promise<string | null>,
});
