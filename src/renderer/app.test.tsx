import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter } from 'react-router';

const useConnectionsMock = vi.fn();

vi.mock('@/renderer/renderer-api', () => ({
  mongoViewer: {
    platform: 'win32',
  },
}));

vi.mock('@/renderer/hooks/use-connections', () => ({
  useConnections: () => useConnectionsMock(),
}));

vi.mock('@/renderer/components/title-bar', () => ({
  TitleBar: ({ platform }: { platform: string }) => <div>TitleBar:{platform}</div>,
}));

vi.mock('@/renderer/components/connection-home', () => ({
  ConnectionHome: () => (
    <Link to="/connections/conn-1">
      Open Connection
    </Link>
  ),
}));

vi.mock('@/renderer/components/mongo-viewer', () => ({
  MongoViewerClient: ({
    activeConnectionName,
    onBack,
  }: {
    activeConnectionName: string | null
    onBack?: () => void | Promise<void>
  }) => (
    <div>
      <span>Viewer:{activeConnectionName}</span>
      <button type="button" onClick={() => void onBack?.()}>
        Back To Connections
      </button>
    </div>
  ),
}));

describe('App', () => {
  it('routes into the viewer page and navigates back to connections', async () => {
    const state = {
      connections: [{ id: 'conn-1', name: 'Prod', createdAt: '2026-01-01T00:00:00.000Z', uri: 'mongodb://prod' }],
    };

    useConnectionsMock.mockReturnValue({
      connectionsState: state,
      loadingConnections: false,
      connectionError: null,
      saveConnection: vi.fn(async () => undefined),
      removeConnection: vi.fn(async () => undefined),
      pickTlsCertificate: vi.fn(async () => null),
    });

    const { default: App } = await import('@/renderer/app');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open Connection' }));

    await waitFor(() => {
      expect(screen.getByText('Viewer:Prod')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back To Connections' }));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Open Connection' })).toBeInTheDocument();
    });
  });
});
