import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/mongo-viewer/query-editor', () => ({
  QueryEditor: ({
    disabled,
    onChange,
    placeholder,
    value,
  }: {
    disabled?: boolean
    onChange: (value: string) => void
    placeholder?: string
    value: string
  }) => (
    <textarea
      aria-label="Mongo query editor"
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

import { ViewerHeader } from '@/components/mongo-viewer/viewer-header';

describe('ViewerHeader', () => {
  it('renders collection context and status badges', () => {
    render(
      <ViewerHeader
        activeConnectionName="Prod Cluster"
        appliedMongoQuery='{"status":"active"}'
        filteredRecordsCount={12}
        loadingDocs={false}
        onApplyQuery={vi.fn()}
        onDeletePreset={vi.fn()}
        onPresetNameChange={vi.fn()}
        onPresetSelect={vi.fn()}
        onQueryDraftChange={vi.fn()}
        onQuickFilterChange={vi.fn()}
        onResetQuery={vi.fn()}
        onSavePreset={vi.fn()}
        presetName="Active"
        presets={[{ name: 'Active', query: '{"status":"active"}' }]}
        queryDraft='{"status":"active"}'
        quickFilter="john"
        selection={{ db: 'app', collection: 'users' }}
      />,
    );

    expect(screen.getByText('app > users')).toBeInTheDocument();
    expect(screen.getByText('Active connection: Prod Cluster')).toBeInTheDocument();
    expect(screen.getByText('12 shown')).toBeInTheDocument();
    expect(screen.getByText('query active')).toBeInTheDocument();
  });

  it('forwards filter, query, preset, and action changes', () => {
    const onQuickFilterChange = vi.fn();
    const onQueryDraftChange = vi.fn();
    const onPresetNameChange = vi.fn();
    const onPresetSelect = vi.fn();
    const onApplyQuery = vi.fn();
    const onSavePreset = vi.fn();
    const onDeletePreset = vi.fn();
    const onResetQuery = vi.fn();

    render(
      <ViewerHeader
        activeConnectionName={null}
        appliedMongoQuery=""
        filteredRecordsCount={0}
        loadingDocs={false}
        onApplyQuery={onApplyQuery}
        onDeletePreset={onDeletePreset}
        onPresetNameChange={onPresetNameChange}
        onPresetSelect={onPresetSelect}
        onQueryDraftChange={onQueryDraftChange}
        onQuickFilterChange={onQuickFilterChange}
        onResetQuery={onResetQuery}
        onSavePreset={onSavePreset}
        presetName="Archived"
        presets={[{ name: 'Archived', query: '{"archived":true}' }]}
        queryDraft='{"status":"active"}'
        quickFilter=""
        selection={{ db: 'app', collection: 'users' }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), { target: { value: 'active' } });
    fireEvent.change(screen.getByLabelText('Mongo query editor'), {
      target: { value: '{"archived":true}' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. Active users'), { target: { value: 'Archived users' } });
    fireEvent.change(screen.getByLabelText('Saved presets'), { target: { value: 'Archived' } });

    fireEvent.click(screen.getByRole('button', { name: 'Apply Query' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Preset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Query' }));

    expect(onQuickFilterChange).toHaveBeenCalledWith('active');
    expect(onQueryDraftChange).toHaveBeenCalledWith('{"archived":true}');
    expect(onPresetNameChange).toHaveBeenCalledWith('Archived users');
    expect(onPresetSelect).toHaveBeenCalledWith('Archived');
    expect(onApplyQuery).toHaveBeenCalledTimes(1);
    expect(onSavePreset).toHaveBeenCalledTimes(1);
    expect(onDeletePreset).toHaveBeenCalledTimes(1);
    expect(onResetQuery).toHaveBeenCalledTimes(1);
  });

  it('disables preset actions when inputs are incomplete', () => {
    render(
      <ViewerHeader
        activeConnectionName={null}
        appliedMongoQuery=""
        filteredRecordsCount={0}
        loadingDocs={true}
        onApplyQuery={vi.fn()}
        onDeletePreset={vi.fn()}
        onPresetNameChange={vi.fn()}
        onPresetSelect={vi.fn()}
        onQueryDraftChange={vi.fn()}
        onQuickFilterChange={vi.fn()}
        onResetQuery={vi.fn()}
        onSavePreset={vi.fn()}
        presetName=""
        presets={[]}
        queryDraft=""
        quickFilter=""
        selection={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Apply Query' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Preset' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Preset' })).toBeDisabled();
    expect(screen.getByLabelText('Mongo query editor')).toBeDisabled();
    expect(screen.getByText('Filters only the records currently visible on this page. Use Mongo Query below to filter the full collection in the database.')).toBeInTheDocument();
  });
});
