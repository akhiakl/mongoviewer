import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QueryHistoryPanel } from '@/renderer/components/mongo-viewer/query-history-panel';

describe('QueryHistoryPanel', () => {
    it('renders nothing when no collection is selected', () => {
        const { container } = render(
            <QueryHistoryPanel
                entries={[]}
                loading={false}
                selection={null}
                onApplyEntry={vi.fn()}
                onRestoreEntry={vi.fn()}
                onRemoveEntry={vi.fn()}
                onClearEntries={vi.fn()}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders loading and empty states', () => {
        const { rerender } = render(
            <QueryHistoryPanel
                entries={[]}
                loading={true}
                selection={{ db: 'app', collection: 'users' }}
                onApplyEntry={vi.fn()}
                onRestoreEntry={vi.fn()}
                onRemoveEntry={vi.fn()}
                onClearEntries={vi.fn()}
            />,
        );

        expect(screen.getByText('Loading query history...')).toBeInTheDocument();

        rerender(
            <QueryHistoryPanel
                entries={[]}
                loading={false}
                selection={{ db: 'app', collection: 'users' }}
                onApplyEntry={vi.fn()}
                onRestoreEntry={vi.fn()}
                onRemoveEntry={vi.fn()}
                onClearEntries={vi.fn()}
            />,
        );

        expect(screen.getByText('No query history yet')).toBeInTheDocument();
    });

    it('renders history entries and forwards actions', () => {
        const onApplyEntry = vi.fn();
        const onRestoreEntry = vi.fn();
        const onRemoveEntry = vi.fn();
        const onClearEntries = vi.fn();

        render(
            <QueryHistoryPanel
                entries={[
                    {
                        id: 'entry-1',
                        connectionId: 'conn-1',
                        db: 'app',
                        collection: 'users',
                        query: '{"status":"active"}',
                        executedAt: '2026-01-01T10:00:00.000Z',
                        resultCount: 4,
                    },
                ]}
                loading={false}
                selection={{ db: 'app', collection: 'users' }}
                onApplyEntry={onApplyEntry}
                onRestoreEntry={onRestoreEntry}
                onRemoveEntry={onRemoveEntry}
                onClearEntries={onClearEntries}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
        fireEvent.click(screen.getByRole('button', { name: /Run Again/i }));
        fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
        fireEvent.click(screen.getByRole('button', { name: /Clear History/i }));

        expect(onRestoreEntry).toHaveBeenCalledTimes(1);
        expect(onApplyEntry).toHaveBeenCalledTimes(1);
        expect(onRemoveEntry).toHaveBeenCalledWith('entry-1');
        expect(onClearEntries).toHaveBeenCalledTimes(1);
    });
});
