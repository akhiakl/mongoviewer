import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QueryToolbar } from '@/renderer/components/mongo-viewer/query-toolbar';

describe('QueryToolbar', () => {
  it('calls apply, save and reset callbacks', () => {
    const onApplyQuery = vi.fn();
    const onSavePreset = vi.fn();
    const onResetQuery = vi.fn();

    render(
      <QueryToolbar
        queryDraft='{"status":"active"}'
        quickFilter="alice"
        sortField="name"
        sortDirection="asc"
        availableSortFields={['_id', 'name']}
        onQueryDraftChange={vi.fn()}
        onQuickFilterChange={vi.fn()}
        onSortFieldChange={vi.fn()}
        onSortDirectionChange={vi.fn()}
        onApplyQuery={onApplyQuery}
        onSavePreset={onSavePreset}
        onResetQuery={onResetQuery}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply Query' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Query' }));

    expect(onApplyQuery).toHaveBeenCalledTimes(1);
    expect(onSavePreset).toHaveBeenCalledTimes(1);
    expect(onResetQuery).toHaveBeenCalledTimes(1);
  });

  it('propagates sort and filter changes', () => {
    const onQueryDraftChange = vi.fn();
    const onSortFieldChange = vi.fn();
    const onSortDirectionChange = vi.fn();
    const onQuickFilterChange = vi.fn();

    render(
      <QueryToolbar
        queryDraft=""
        quickFilter=""
        sortField=""
        sortDirection="asc"
        availableSortFields={['_id', 'name']}
        onQueryDraftChange={onQueryDraftChange}
        onQuickFilterChange={onQuickFilterChange}
        onSortFieldChange={onSortFieldChange}
        onSortDirectionChange={onSortDirectionChange}
        onApplyQuery={vi.fn()}
        onSavePreset={vi.fn()}
        onResetQuery={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Quick filter'), { target: { value: 'john' } });
    fireEvent.change(screen.getByLabelText('Mongo query'), { target: { value: '{"age":{"$gte":18}}' } });
    fireEvent.change(screen.getByLabelText('Sort field'), { target: { value: 'name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ascending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Descending' }));

    expect(onQuickFilterChange).toHaveBeenCalledWith('john');
    expect(onQueryDraftChange).toHaveBeenCalledWith('{"age":{"$gte":18}}');
    expect(onSortFieldChange).toHaveBeenCalledWith('name');
    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(onSortDirectionChange).toHaveBeenCalledWith('desc');
  });

  it('renders the descending state and still allows switching back to ascending', () => {
    const onSortDirectionChange = vi.fn();

    render(
      <QueryToolbar
        queryDraft=""
        quickFilter=""
        sortField="name"
        sortDirection="desc"
        availableSortFields={['_id', 'name']}
        onQueryDraftChange={vi.fn()}
        onQuickFilterChange={vi.fn()}
        onSortFieldChange={vi.fn()}
        onSortDirectionChange={onSortDirectionChange}
        onApplyQuery={vi.fn()}
        onSavePreset={vi.fn()}
        onResetQuery={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ascending' }));

    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
  });
});
