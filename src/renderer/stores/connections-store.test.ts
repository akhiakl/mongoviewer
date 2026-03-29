import { beforeEach, describe, expect, it, vi } from 'vitest';

const listConnectionsMock = vi.fn();
const saveConnectionMock = vi.fn();
const updateConnectionMock = vi.fn();
const deleteConnectionMock = vi.fn();
const pickTlsCertificateMock = vi.fn();
const persistTlsCertificateMock = vi.fn();

vi.mock('@/renderer/renderer-api', () => ({
    mongoViewer: {
        listConnections: () => listConnectionsMock(),
        saveConnection: (input: unknown) => saveConnectionMock(input),
        updateConnection: (input: unknown) => updateConnectionMock(input),
        deleteConnection: (connectionId: string) => deleteConnectionMock(connectionId),
        pickTlsCertificate: () => pickTlsCertificateMock(),
        persistTlsCertificate: (path: string) => persistTlsCertificateMock(path),
    },
}));

import { useConnectionsStore } from '@/renderer/stores/connections-store';

describe('useConnectionsStore', () => {
    beforeEach(() => {
        useConnectionsStore.setState({
            connections: [],
            loading: false,
            error: null,
            hasLoaded: false,
        });
        vi.clearAllMocks();
    });

    it('refreshes shared connections and resolves a connection by id', async () => {
        listConnectionsMock.mockResolvedValue({
            connections: [
                {
                    id: 'conn-1',
                    name: 'Prod',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    uri: 'mongodb://prod',
                },
            ],
        });

        await useConnectionsStore.getState().refresh();

        expect(useConnectionsStore.getState().connections).toHaveLength(1);
        expect(useConnectionsStore.getState().getById('conn-1')?.name).toBe('Prod');
        expect(useConnectionsStore.getState().getById('missing')).toBeNull();
        expect(useConnectionsStore.getState().hasLoaded).toBe(true);
    });

    it('saves, updates, removes, and picks certificates through shared actions', async () => {
        listConnectionsMock
            .mockResolvedValueOnce({
                connections: [],
            })
            .mockResolvedValueOnce({
                connections: [
                    {
                        id: 'conn-2',
                        name: 'Staging',
                        createdAt: '2026-01-02T00:00:00.000Z',
                        uri: 'mongodb://staging',
                    },
                ],
            })
            .mockResolvedValueOnce({
                connections: [
                    {
                        id: 'conn-2',
                        name: 'Staging Primary',
                        createdAt: '2026-01-02T00:00:00.000Z',
                        uri: 'mongodb://staging-primary',
                    },
                ],
            });
        pickTlsCertificateMock.mockResolvedValue('C:\\certs\\mongo.pem');

        await useConnectionsStore.getState().refresh();
        await useConnectionsStore.getState().save({
            name: 'Staging',
            connectionString: 'mongodb://staging',
        });

        expect(saveConnectionMock).toHaveBeenCalledWith({
            name: 'Staging',
            connectionString: 'mongodb://staging',
        });
        expect(useConnectionsStore.getState().connections[0]?.id).toBe('conn-2');

        await useConnectionsStore.getState().update({
            connectionId: 'conn-2',
            name: 'Staging Primary',
            connectionString: 'mongodb://staging-primary',
        });

        expect(updateConnectionMock).toHaveBeenCalledWith({
            connectionId: 'conn-2',
            name: 'Staging Primary',
            connectionString: 'mongodb://staging-primary',
        });
        expect(useConnectionsStore.getState().connections[0]?.name).toBe('Staging Primary');

        await useConnectionsStore.getState().remove('conn-2');
        expect(deleteConnectionMock).toHaveBeenCalledWith('conn-2');
        expect(useConnectionsStore.getState().connections).toEqual([]);

        await expect(useConnectionsStore.getState().pickTlsCertificate()).resolves.toBe(
            'C:\\certs\\mongo.pem',
        );
    });

    it('stores normalized errors for refresh, update, remove, and pick certificate failures', async () => {
        listConnectionsMock.mockRejectedValueOnce(new Error('refresh failed'));
        saveConnectionMock.mockRejectedValueOnce(new Error('save failed'));
        updateConnectionMock.mockRejectedValueOnce(new Error('update failed'));
        deleteConnectionMock.mockRejectedValueOnce(new Error('delete failed'));
        pickTlsCertificateMock.mockRejectedValueOnce(new Error('pick failed'));

        await useConnectionsStore.getState().refresh(true);
        expect(useConnectionsStore.getState().error).toBe('refresh failed');

        await expect(
            useConnectionsStore.getState().save({
                name: 'Broken',
                connectionString: 'mongodb://broken',
            }),
        ).rejects.toThrow('save failed');
        expect(useConnectionsStore.getState().error).toBe('save failed');

        await expect(
            useConnectionsStore.getState().update({
                connectionId: 'conn-2',
                name: 'Broken',
                connectionString: 'mongodb://broken',
            }),
        ).rejects.toThrow('update failed');
        expect(useConnectionsStore.getState().error).toBe('update failed');

        await expect(useConnectionsStore.getState().remove('conn-2')).rejects.toThrow(
            'delete failed',
        );
        expect(useConnectionsStore.getState().error).toBe('delete failed');

        await expect(useConnectionsStore.getState().pickTlsCertificate()).rejects.toThrow(
            'pick failed',
        );
        expect(useConnectionsStore.getState().error).toBe('pick failed');
    });

    it('reuses in-flight refresh work and skips refetch when already loaded', async () => {
        let resolveRefresh!: (value: { connections: never[] }) => void;
        listConnectionsMock.mockImplementation(
            () =>
                new Promise<{ connections: never[] }>((resolve) => {
                    resolveRefresh = resolve;
                }),
        );

        const firstRefresh = useConnectionsStore.getState().refresh();
        void useConnectionsStore.getState().refresh();

        expect(listConnectionsMock).toHaveBeenCalledTimes(1);

        resolveRefresh({ connections: [] });
        await firstRefresh;

        listConnectionsMock.mockClear();
        await useConnectionsStore.getState().refresh();
        expect(listConnectionsMock).not.toHaveBeenCalled();
    });
});
