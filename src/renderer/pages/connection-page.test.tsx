import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

const useConnectionsMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('@/renderer/hooks/use-connections', () => ({
    useConnections: () => useConnectionsMock(),
}));

vi.mock('@/renderer/components/mongo-viewer', () => ({
    MongoViewerClient: ({
        activeConnectionName,
        connectionId,
        onBack,
    }: {
        activeConnectionName: string | null;
        connectionId: string;
        onBack?: () => void;
    }) => (
        <div>
            <span>Viewer:{activeConnectionName}</span>
            <span>Connection:{connectionId}</span>
            <button type="button" onClick={onBack}>Back</button>
        </div>
    ),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');

    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('ConnectionPage', () => {
    it('renders the viewer for the routed connection id', async () => {
        useConnectionsMock.mockReturnValue({
            connectionError: null,
            connectionsState: {
                connections: [
                    { id: 'conn-1', name: 'Prod', createdAt: '2026-01-01T00:00:00.000Z', uri: 'mongodb://prod' },
                ],
            },
            loadingConnections: false,
        });

        const { ConnectionPage } = await import('@/renderer/pages/connection-page');

        render(
            <MemoryRouter initialEntries={['/connections/conn-1']}>
                <Routes>
                    <Route path="/connections/:connectionId" element={<ConnectionPage />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Viewer:Prod')).toBeInTheDocument();
        expect(screen.getByText('Connection:conn-1')).toBeInTheDocument();
    });

    it('shows a missing-connection state when the url does not match saved connections', async () => {
        useConnectionsMock.mockReturnValue({
            connectionError: null,
            connectionsState: { connections: [] },
            loadingConnections: false,
        });

        const { ConnectionPage } = await import('@/renderer/pages/connection-page');

        render(
            <MemoryRouter initialEntries={['/connections/missing']}>
                <Routes>
                    <Route path="/connections/:connectionId" element={<ConnectionPage />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('That saved connection could not be found.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back To Connections' })).toHaveAttribute('href', '/');
    });

    it('shows connection loading and error states', async () => {
        useConnectionsMock
            .mockReturnValueOnce({
                connectionError: null,
                connectionsState: { connections: [] },
                loadingConnections: true,
            })
            .mockReturnValueOnce({
                connectionError: 'Unable to load saved connections.',
                connectionsState: { connections: [] },
                loadingConnections: false,
            });

        const { ConnectionPage } = await import('@/renderer/pages/connection-page');

        const { rerender } = render(
            <MemoryRouter initialEntries={['/connections/conn-1']}>
                <Routes>
                    <Route path="/connections/:connectionId" element={<ConnectionPage />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Loading connection...')).toBeInTheDocument();

        rerender(
            <MemoryRouter initialEntries={['/connections/conn-1']}>
                <Routes>
                    <Route path="/connections/:connectionId" element={<ConnectionPage />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Unable to load saved connections.')).toBeInTheDocument();
    });
});
