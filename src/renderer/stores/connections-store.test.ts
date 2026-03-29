import { beforeEach, describe, expect, it, vi } from 'vitest';

const listConnectionsMock = vi.fn();
const saveConnectionMock = vi.fn();
const deleteConnectionMock = vi.fn();
const pickTlsCertificateMock = vi.fn();

vi.mock('@/renderer/renderer-api', () => ({
    mongoViewer: {
        listConnections: () => listConnectionsMock(),
        saveConnection: (input: unknown) => saveConnectionMock(input),
        deleteConnection: (connectionId: string) => deleteConnectionMock(connectionId),
        pickTlsCertificate: () => pickTlsCertificateMock(),
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
        expect(useConnectionsStore.getState().hasLoaded).toBe(true);
    });

    it('saves, removes, and picks certificates through shared actions', async () => {
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

        await useConnectionsStore.getState().remove('conn-2');
        expect(deleteConnectionMock).toHaveBeenCalledWith('conn-2');
        expect(useConnectionsStore.getState().connections).toEqual([]);

        await expect(useConnectionsStore.getState().pickTlsCertificate()).resolves.toBe(
            'C:\\certs\\mongo.pem',
        );
    });
});
