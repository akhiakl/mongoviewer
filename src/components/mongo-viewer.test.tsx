import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoViewerClient } from '@/components/mongo-viewer';

const useDatabasesTreeMock = vi.fn();
const useCollectionDocumentsMock = vi.fn();

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

vi.mock('@/components/mongo-viewer/hooks/use-databases-tree', () => ({
  useDatabasesTree: (...args: unknown[]) => useDatabasesTreeMock(...args),
}));

vi.mock('@/components/mongo-viewer/hooks/use-collection-documents', () => ({
  useCollectionDocuments: (...args: unknown[]) => useCollectionDocumentsMock(...args),
}));

vi.mock('@/components/mongo-viewer/databases-sidebar', () => ({
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

vi.mock('@/components/mongo-viewer/records-table', () => ({
  RecordsTable: ({ records }: { records: Array<Record<string, unknown>> }) => (
    <div>Table Count:{records.length}</div>
  ),
}));

vi.mock('@/components/mongo-viewer/records-json-list', () => ({
  RecordsJsonList: ({ records }: { records: Array<Record<string, unknown>> }) => (
    <div>Json Count:{records.length}</div>
  ),
}));

describe('MongoViewerClient', () => {
  beforeEach(() => {
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
        selection,
      }: {
        page: number
        pageSize: number
        mongoQuery?: string
        selection: { db: string; collection: string } | null
      }) => ({
        records:
          selection?.collection === 'orders'
            ? [{ _id: 3, name: 'Order 3' }]
            : [
                { _id: 1, name: 'Alice' },
                { _id: 2, name: 'Bob' },
              ],
        total: mongoQuery ? 1 : 2,
        currentPage: page,
        loadingDocs: false,
        docsError: null,
        lastArgs: { page, pageSize, mongoQuery, selection },
      }),
    );
    window.localStorage.clear();
  });

  it('supports quick filtering, query apply, page sizing, and view switching', async () => {
    render(
      <MongoViewerClient
        activeConnectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Table Count:2')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Selection:app/users')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'alice' },
    });

    await new Promise((resolve) => window.setTimeout(resolve, 200));

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
        selection,
      }: {
        page: number
        selection: { db: string; collection: string } | null
      }) => ({
        records: selection ? [{ _id: page, name: `Row ${page}` }] : [],
        total: 120,
        currentPage: page,
        loadingDocs: false,
        docsError: null,
      }),
    );

    render(
      <MongoViewerClient
        activeConnectionId="conn-1"
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

  it('shows empty and loading states for disconnected, loading, empty, and unmatched views', async () => {
    useDatabasesTreeMock.mockReturnValue({
      tree: [],
      loadingTree: false,
      treeError: null,
      refreshTree: vi.fn(),
    });
    useCollectionDocumentsMock.mockReturnValue({
      records: [],
      total: 0,
      currentPage: 1,
      loadingDocs: false,
      docsError: null,
    });

    const { rerender } = render(
      <MongoViewerClient
        activeConnectionId={null}
        activeConnectionName={null}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Save or activate a connection to start browsing.')).toBeInTheDocument();

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

    rerender(
      <MongoViewerClient
        activeConnectionId="conn-1"
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
        activeConnectionId="conn-1"
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
        activeConnectionId="conn-1"
        activeConnectionName="Prod Cluster"
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Filter records already loaded on this page'), {
      target: { value: 'missing' },
    });

    await new Promise((resolve) => window.setTimeout(resolve, 200));

    await waitFor(() => {
      expect(screen.getByText('No records match the current quick filter.')).toBeInTheDocument();
    });
  });
});
