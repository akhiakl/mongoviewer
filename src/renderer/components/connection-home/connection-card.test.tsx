import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import ConnectionCard from '@/renderer/components/connection-home/connection-card';

describe('ConnectionCard', () => {
    it('renders connection details and actions', () => {
        const onCopy = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <MemoryRouter>
                <ConnectionCard
                    connection={{
                        id: 'conn-1',
                        name: 'Prod',
                        createdAt: new Date(Date.now() - 30_000).toISOString(),
                        uri: 'mongodb://localhost:27017',
                    }}
                    isCopied={false}
                    onCopy={onCopy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('localhost:27017')).toBeInTheDocument();
        expect(screen.getByText(/seconds ago/)).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Copy connection string'));
        fireEvent.click(screen.getByTitle('Edit connection'));
        fireEvent.click(screen.getByTitle('Delete connection'));

        expect(onCopy).toHaveBeenCalledWith('mongodb://localhost:27017', 'conn-1');
        expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'conn-1' }));
        expect(onDelete).toHaveBeenCalledWith('conn-1', 'Prod');
        expect(screen.getByRole('link', { name: 'Connect' })).toHaveAttribute('href', '/connections/conn-1');
    });

    it('shows copied state, invalid uri fallback, and day-based age formatting', () => {
        render(
            <MemoryRouter>
                <ConnectionCard
                    connection={{
                        id: 'conn-2',
                        name: 'Broken',
                        createdAt: new Date(Date.now() - 172_800_000).toISOString(),
                        uri: 'not-a-uri',
                    }}
                    isCopied={true}
                    onCopy={vi.fn()}
                    onEdit={vi.fn()}
                    onDelete={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('Invalid URI')).toBeInTheDocument();
        expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
    });
});
