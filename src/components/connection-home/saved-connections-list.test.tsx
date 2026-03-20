import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedConnectionsList } from '@/components/connection-home/saved-connections-list';

describe('SavedConnectionsList', () => {
    it('renders loading state', () => {
        render(
            <SavedConnectionsList
                connectionsState={{ connections: [], activeConnectionId: null }}
                loadingConnections={true}
                connectingId={null}
                deletingId={null}
                onConnect={vi.fn(async () => undefined)}
                onDelete={vi.fn(async () => undefined)}
            />,
        );

        expect(screen.getByText('Loading connections...')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        render(
            <SavedConnectionsList
                connectionsState={{ connections: [], activeConnectionId: null }}
                loadingConnections={false}
                connectingId={null}
                deletingId={null}
                onConnect={vi.fn(async () => undefined)}
                onDelete={vi.fn(async () => undefined)}
            />,
        );

        expect(screen.getByText('No saved connections yet.')).toBeInTheDocument();
    });

    it('renders connections and triggers connect/delete actions', () => {
        const onConnect = vi.fn(async () => undefined);
        const onDelete = vi.fn(async () => undefined);

        render(
            <SavedConnectionsList
                connectionsState={{
                    connections: [
                        {
                            id: 'c1',
                            name: 'Prod',
                            createdAt: '2026-01-01T00:00:00.000Z',
                        },
                    ],
                    activeConnectionId: 'c1',
                }}
                loadingConnections={false}
                connectingId={null}
                deletingId={null}
                onConnect={onConnect}
                onDelete={onDelete}
            />,
        );

        expect(screen.getByText('Prod')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onConnect).toHaveBeenCalledWith('c1');
        expect(onDelete).toHaveBeenCalledWith('c1');
    });

    it('shows in-progress labels when connect/delete are in progress', () => {
        render(
            <SavedConnectionsList
                connectionsState={{
                    connections: [
                        {
                            id: 'c1',
                            name: 'Prod',
                            createdAt: '2026-01-01T00:00:00.000Z',
                        },
                    ],
                    activeConnectionId: null,
                }}
                loadingConnections={false}
                connectingId="c1"
                deletingId="c1"
                onConnect={vi.fn(async () => undefined)}
                onDelete={vi.fn(async () => undefined)}
            />,
        );

        expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Removing...' })).toBeDisabled();
        expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });
});
