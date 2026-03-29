import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { SavedConnectionsList } from '@/renderer/components/connection-home/saved-connections-list';

describe('SavedConnectionsList', () => {
    it('renders loading state', () => {
        render(
            <MemoryRouter>
                <SavedConnectionsList
                    connectionsState={{ connections: [] }}
                    loadingConnections={true}
                    copiedId={null}
                    onCopy={vi.fn()}
                    onEdit={vi.fn()}
                    onDelete={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('Loading connections...')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        render(
            <MemoryRouter>
                <SavedConnectionsList
                    connectionsState={{ connections: [] }}
                    loadingConnections={false}
                    copiedId={null}
                    onCopy={vi.fn()}
                    onEdit={vi.fn()}
                    onDelete={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('No connections yet')).toBeInTheDocument();
    });

    it('renders connections and triggers card actions', () => {
        const onCopy = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <MemoryRouter>
                <SavedConnectionsList
                    connectionsState={{
                        connections: [
                            {
                                id: 'c1',
                                name: 'Prod',
                                createdAt: '2026-01-01T00:00:00.000Z',
                                uri: 'mongodb://localhost:27017',
                            },
                        ],
                    }}
                    loadingConnections={false}
                    copiedId={null}
                    onCopy={onCopy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('Prod')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Connect' })).toHaveAttribute('href', '/connections/c1');

        fireEvent.click(screen.getByRole('button', { name: 'Copy connection string' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit connection' }));
        fireEvent.click(screen.getByRole('button', { name: 'Delete connection' }));

        expect(onCopy).toHaveBeenCalledWith('mongodb://localhost:27017', 'c1');
        expect(onEdit).toHaveBeenCalledWith({
            id: 'c1',
            name: 'Prod',
            createdAt: '2026-01-01T00:00:00.000Z',
            uri: 'mongodb://localhost:27017',
        });
        expect(onDelete).toHaveBeenCalledWith('c1', 'Prod');
    });
});
