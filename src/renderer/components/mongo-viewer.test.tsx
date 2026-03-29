import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoViewerClient } from '@/renderer/components/mongo-viewer';
import { useAppUiStore } from '@/renderer/stores/app-ui-store';
import { useViewerPreferencesStore } from '@/renderer/stores/viewer-preferences-store';

const useDatabasesTreeMock = vi.fn();
const useCollectionDocumentsMock = vi.fn();
const useCollectionInsightsMock = vi.fn();

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
      <span>Query fields:{fieldNames?.join(',') ?? ''}</span>
      <span>Query sample keys:{Object.keys(fieldSamples ?? {}).join(',')}</span>
    </div>
  ),
}));

vi.mock('@/renderer/components/mongo-viewer/hooks/use-databases-tree', () => ({
  useDatabasesTree: (...args: unknown[]) => useDatabasesTreeMock(...args),
}));

vi.mock('@/renderer/components/mongo-viewer/hooks/use-collection-documents', () => ({
  useCollectionDocuments: (...args: unknown[]) => useCollectionDocumentsMock(...args),
}));

vi.mock('@/renderer/components/mongo-viewer/hooks/use-collection-insights', () => ({
  useCollectionInsights: (...args: unknown[]) => useCollectionInsightsMock(...args),
}));

vi.mock('@/renderer/components/mongo-viewer/databases-sidebar', () => ({
  DatabasesSidebar: ({
    onRefresh,
    onSelectCollection,
    selection,
  }: {
    onRefresh: () => void
    onSelectCollection: (selection: { db: string; collection: string }) => void
    selection: { db: string; collection: string } | null
  }) => (
    <div>
      <button type="button" onClick={onRefresh}>
        Refresh Tree
      </button>
      <button type="button" onClick={() => onSelectCollection({ db: 'app', collection: 'orders' })}>
        Pick Orders
      </button>
      <span>Sidebar Selection:{selection ? `${selection.db}/${selection.collection}` : 'none'}</span>
    </div>
  ),
}));

vi.mock('@/renderer/components/mongo-viewer/records-table', () => ({
  RecordsTable: ({ records }: { records: Array<Record<string, unknown>> }) => (
    <div>Table Count:{records.length}</div>
  ),
}));

vi.mock('@/renderer/components/mongo-viewer/records-json-list', () => ({
  RecordsJsonList: ({ records }: { records: Array<Record<string, unknown>> }) => (
    <div>Json Count:{records.length}</div>
  ),
}));

describe('MongoViewerClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAppUiStore.setState({
      themePreference: 'system',
      queryHistoryOpen: false,
      schemaPanelOpen: false,
    });
    useViewerPreferencesStore.setState({
      preferencesByConnection: {},
    });
    useDatabasesTreeMock.mockReturnValue({
      tree: [{ name: 'app', collections: ['users', 'orders'] }],
      loadingTree: false,
      treeError: null,
      refreshTree: vi.fn(),
    });
    useCollectionDocumentsMock.mockImplementation(
      ({
        page,
        pageSize,
        mongoQuery,
        sortDirection,
        sortField,
        selection,
      }: {
        page: number
        pageSize: number
        mongoQuery?: string
        sortDirection: 'asc' | 'desc'
        sortField?: string | null
        selection: { db: string; collection: string } | null
      }) => ({
        records:
          selection?.collection === 'orders'
            ? [{ _id: 3, name: 'Order 3', shipping: { city: 'Delhi' } }]
            : [
              { _id: 1, name: 'Alice', profile: { city: 'Bengaluru' } },
              { _id: 2, name: 'Bob', status: 'active' },
            ],
        total: mongoQuery ? 1 : 2,
        currentPage: page,
        loadingDocs: false,
        docsError: null,
        lastArgs: { page, pageSize, mongoQuery, selection, sortDirection, sortField },
      }),
    );
    useCollectionInsightsMock.mockReturnValue({
      indexes: [
        {
          name: '_id_',
          fields: ['_id (1)'],
          unique: true,
          sparse: false,
          partial: false,
          ttlSeconds: null,
        },
      ],
      schemaSummary: {
        sampleSize: 2,
        fields: [
          {
            path: 'status',
            types: ['string'],
            presenceRate: 1,
            exampleValues: ['active'],
          },
        ],
      },
      stats: {
        documentCount: 2,
        avgDocumentSize: 120,
        storageSize: 2048,
        totalIndexSize: 1024,
        totalIndexes: 1,
      },
      loadingInsights: false,
      insightsError: null,
    });
    window.localStorage.clear();
  });

  it('supports quick filtering, query apply, server sorting, page sizing, and view switching', async () => {
    render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Table Count:2')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Selection:app/users')).toBeInTheDocument();
      expect(screen.getByText('Query fields:_id,name,profile,profile.city,status')).toBeInTheDocument();
      expect(screen.getByText('Query sample keys:_id,name,profile.city,status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /collection insights/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /collection insights/i }));

    await waitFor(() => {
      expect(screen.getByText('Collection Stats')).toBeInTheDocument();
      expect(screen.getByText('Schema Summary')).toBeInTheDocument();
      expect(screen.getAllByText('Indexes').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'alice' },
    });

    await new Promise((resolve) => window.setTimeout(resolve, 260));

    await waitFor(() => {
      expect(screen.getByText('Table Count:1')).toBeInTheDocument();
      expect(screen.getByText('1 shown')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Mongo query editor'), {
      target: { value: '{"status":"active"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Query' }));

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        mongoQuery?: string
      };
      expect(latestArgs.mongoQuery).toBe('{"status":"active"}');
      expect(screen.getByText('query active')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Sort field'), { target: { value: 'status' } });

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        sortDirection: 'asc' | 'desc'
        sortField?: string | null
      };
      expect(latestArgs.sortField).toBe('status');
      expect(latestArgs.sortDirection).toBe('asc');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Ascending' }));

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        sortDirection: 'asc' | 'desc'
      };
      expect(latestArgs.sortDirection).toBe('desc');
    });

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '100' } });

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        pageSize: number
      };
      expect(latestArgs.pageSize).toBe(100);
    });

    fireEvent.click(screen.getByRole('radio', { name: 'JSON view' }));

    await waitFor(() => {
      expect(screen.getByText('Json Count:1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pick Orders' }));

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        selection: { db: string; collection: string } | null
      };
      expect(latestArgs.selection).toEqual({ db: 'app', collection: 'orders' });
      expect(screen.getByText('Sidebar Selection:app/orders')).toBeInTheDocument();
      expect(screen.getByText('Query fields:_id,name,shipping,shipping.city')).toBeInTheDocument();
      expect(screen.getByText('Query sample keys:_id,name,shipping.city')).toBeInTheDocument();
    });
  }, 15000);

  it('shows inline recovery actions for invalid query and empty result states', async () => {
    render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Mongo query editor'), {
      target: { value: '{"status":' },
    });

    expect(screen.getByText(/query issue:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply Query' })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'missing' },
    });

    await new Promise((resolve) => window.setTimeout(resolve, 260));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear Quick Filter' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Quick Filter' }));

    await waitFor(() => {
      expect(screen.getByText('Table Count:2')).toBeInTheDocument();
    });
  });

  it('supports navigating back, refreshing the tree, and moving between pages', async () => {
    const onBack = vi.fn();
    const refreshTree = vi.fn();

    useDatabasesTreeMock.mockReturnValue({
      tree: [{ name: 'app', collections: ['users', 'orders'] }],
      loadingTree: false,
      treeError: null,
      refreshTree,
    });
    useCollectionDocumentsMock.mockImplementation(
      ({
        page,
        sortDirection,
        sortField,
        selection,
      }: {
        page: number
        sortDirection: 'asc' | 'desc'
        sortField?: string | null
        selection: { db: string; collection: string } | null
      }) => ({
        records: selection ? [{ _id: page, name: `Row ${page}` }] : [],
        total: 120,
        currentPage: page,
        loadingDocs: false,
        docsError: null,
        lastArgs: { sortDirection, sortField },
      }),
    );

    render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={onBack}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Prod Cluster')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh Tree' }));
    expect(refreshTree).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        page: number
      };
      expect(latestArgs.page).toBe(2);
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));

    await waitFor(() => {
      const latestArgs = useCollectionDocumentsMock.mock.calls.at(-1)?.[0] as {
        page: number
      };
      expect(latestArgs.page).toBe(1);
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back To Connections' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows loading, empty, and unmatched views', async () => {
    useDatabasesTreeMock.mockReturnValue({
      tree: [{ name: 'app', collections: ['users'] }],
      loadingTree: false,
      treeError: null,
      refreshTree: vi.fn(),
    });
    useCollectionDocumentsMock.mockReturnValue({
      records: [],
      total: 0,
      currentPage: 1,
      loadingDocs: true,
      docsError: null,
    });
    useCollectionInsightsMock.mockReturnValue({
      indexes: [],
      schemaSummary: null,
      stats: null,
      loadingInsights: false,
      insightsError: null,
    });

    const { rerender } = render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Loading records...')).toBeInTheDocument();
    });

    useCollectionDocumentsMock.mockReturnValue({
      records: [],
      total: 0,
      currentPage: 1,
      loadingDocs: false,
      docsError: null,
    });

    rerender(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('No records for this collection.')).toBeInTheDocument();
    });

    useCollectionDocumentsMock.mockReturnValue({
      records: [{ _id: 1, name: 'Alice' }],
      total: 1,
      currentPage: 1,
      loadingDocs: false,
      docsError: null,
    });

    rerender(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'missing' },
    });

    await new Promise((resolve) => window.setTimeout(resolve, 260));

    await waitFor(() => {
      expect(screen.getByText('No records match the current quick filter.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear Quick Filter' })).toBeInTheDocument();
    });
  });

  it('persists key viewer preferences per connection but resets query drafts and quick filters', async () => {
    const { unmount } = render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Sidebar Selection:app/users')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('radio', { name: 'JSON view' }));
    fireEvent.click(screen.getByRole('button', { name: /collection insights/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Pick Orders' }));
    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'order' },
    });
    fireEvent.change(screen.getByLabelText('Mongo query editor'), {
      target: { value: '{"status":"active"}' },
    });

    unmount();

    render(
      <MongoViewerClient
        connectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Sidebar Selection:app/orders')).toBeInTheDocument();
      expect(screen.getByText('Collection Stats')).toBeInTheDocument();
      expect(screen.getByText('Json Count:1')).toBeInTheDocument();
      expect(screen.getByLabelText('Rows per page')).toHaveValue('100');
      expect(screen.getByPlaceholderText('Filter records already loaded on this page')).toHaveValue('');
      expect(screen.getByLabelText('Mongo query editor')).toHaveValue('');
    });
  });
});
