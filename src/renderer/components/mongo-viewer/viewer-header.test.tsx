import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/renderer/components/mongo-viewer/query-editor', () => ({
  QueryEditor: ({
    disabled,
    fieldNames,
    fieldSamples,
    onChange,
    placeholder,
    value,
  }: {
    disabled?: boolean
    fieldNames?: string[]
    fieldSamples?: Record<string, Array<string | number | boolean | null>>
    onChange: (value: string) => void
    placeholder?: string
    value: string
  }) => (
    <div>
      <textarea
        aria-label="Mongo query editor"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span>Editor fields:{fieldNames?.join(',') ?? ''}</span>
      <span>Editor sample keys:{Object.keys(fieldSamples ?? {}).join(',')}</span>
    </div>
  ),
}));

import { ViewerHeader } from '@/renderer/components/mongo-viewer/viewer-header';

describe('ViewerHeader', () => {
  it('renders collection context and status badges', () => {
    render(
      <ViewerHeader
        activeConnectionName="Prod Cluster"
        appliedMongoQuery='{"status":"active"}'
        filteredRecordsCount={12}
        indexes={[
          {
            name: "_id_",
            fields: ["_id (1)"],
            unique: true,
            sparse: false,
            partial: false,
            ttlSeconds: null,
          },
        ]}
        loadingInsights={false}
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
        queryFieldNames={['_id', 'status', 'profile.city']}
        queryFieldSamples={{ status: ['active', 'disabled'], 'profile.city': ['Bengaluru'] }}
        queryDraft='{"status":"active"}'
        queryValidationError={null}
        quickFilter="john"
        schemaSummary={{
          sampleSize: 2,
          fields: [
            { path: "status", types: ["string"], presenceRate: 1, exampleValues: ["active"] },
          ],
        }}
        selection={{ db: 'app', collection: 'users' }}
        showInsights={false}
        onShowInsightsChange={vi.fn()}
        stats={{
          documentCount: 2,
          avgDocumentSize: 128,
          storageSize: 2048,
          totalIndexSize: 512,
          totalIndexes: 1,
        }}
      />,
    );

    expect(screen.getByText('app > users')).toBeInTheDocument();
    expect(screen.getByText('Active connection: Prod Cluster')).toBeInTheDocument();
    expect(screen.getByText('12 shown')).toBeInTheDocument();
    expect(screen.getByText('query active')).toBeInTheDocument();
    expect(screen.getByText('Editor fields:_id,status,profile.city')).toBeInTheDocument();
    expect(screen.getByText('Editor sample keys:status,profile.city')).toBeInTheDocument();
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
        indexes={[]}
        loadingInsights={false}
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
        queryFieldNames={['_id', 'archived']}
        queryFieldSamples={{ archived: [true] }}
        queryDraft='{"status":"active"}'
        queryValidationError={null}
        quickFilter=""
        schemaSummary={null}
        selection={{ db: 'app', collection: 'users' }}
        showInsights={false}
        onShowInsightsChange={vi.fn()}
        stats={null}
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

  it('shows insights only when the header toggle is opened', () => {
    function ControlledHeader() {
      const [showInsights, setShowInsights] = React.useState(false)

      return (
        <ViewerHeader
          activeConnectionName="Prod Cluster"
          appliedMongoQuery=""
          filteredRecordsCount={2}
          indexes={[
            {
              name: "_id_",
              fields: ["_id (1)"],
              unique: true,
              sparse: false,
              partial: false,
              ttlSeconds: null,
            },
          ]}
          loadingInsights={false}
          loadingDocs={false}
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
          queryFieldNames={['_id', 'status']}
          queryFieldSamples={{ status: ['active'] }}
          queryDraft=""
          queryValidationError={null}
          quickFilter=""
          schemaSummary={{
            sampleSize: 2,
            fields: [
              { path: "status", types: ["string"], presenceRate: 1, exampleValues: ["active"] },
            ],
          }}
          selection={{ db: 'app', collection: 'users' }}
          showInsights={showInsights}
          onShowInsightsChange={setShowInsights}
          stats={{
            documentCount: 2,
            avgDocumentSize: 128,
            storageSize: 2048,
            totalIndexSize: 512,
            totalIndexes: 1,
          }}
        />
      )
    }

    render(<ControlledHeader />);

    expect(screen.queryByText('Collection Stats')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /collection insights/i }));

    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(screen.getByText('Schema Summary')).toBeInTheDocument();
  });

  it('shows inline query validation feedback and disables apply for invalid syntax', () => {
    render(
      <ViewerHeader
        activeConnectionName="Prod Cluster"
        appliedMongoQuery=""
        filteredRecordsCount={0}
        indexes={[]}
        loadingInsights={false}
        loadingDocs={false}
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
        queryFieldNames={['_id']}
        queryFieldSamples={{}}
        queryDraft='{"status":'
        queryValidationError="Unexpected end of input"
        quickFilter=""
        schemaSummary={null}
        selection={{ db: 'app', collection: 'users' }}
        showInsights={false}
        onShowInsightsChange={vi.fn()}
        stats={null}
      />,
    );

    expect(screen.getByText(/query issue: unexpected end of input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply Query' })).toBeDisabled();
  });

  it('disables preset actions when inputs are incomplete', () => {
    render(
      <ViewerHeader
        activeConnectionName={null}
        appliedMongoQuery=""
        filteredRecordsCount={0}
        indexes={[]}
        loadingInsights={false}
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
        queryFieldNames={[]}
        queryFieldSamples={{}}
        queryDraft=""
        queryValidationError={null}
        quickFilter=""
        schemaSummary={null}
        selection={null}
        showInsights={false}
        onShowInsightsChange={vi.fn()}
        stats={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Apply Query' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Preset' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Preset' })).toBeDisabled();
    expect(screen.getByLabelText('Mongo query editor')).toBeDisabled();
    expect(screen.getByText('Filters only the records currently visible on this page. Use Mongo Query below to filter the full collection in the database.')).toBeInTheDocument();
    expect(screen.getByText(/suggests field names while typing keys, and offers sampled values/i)).toBeInTheDocument();
  });
});
