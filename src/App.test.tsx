import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useConnectionsMock = vi.fn();

vi.mock('@/lib/renderer-api', () => ({
  mongoViewer: {
    platform: 'win32',
  },
}));

vi.mock('@/hooks/use-connections', () => ({
  useConnections: () => useConnectionsMock(),
}));

vi.mock('@/components/title-bar', () => ({
  TitleBar: ({ platform }: { platform: string }) => <div>TitleBar:{platform}</div>,
}));

vi.mock('@/components/connection-home', () => ({
  ConnectionHome: ({
    onActivateConnection,
  }: {
    onActivateConnection: (connectionId: string) => Promise<void>
  }) => (
    <button type="button" onClick={() => void onActivateConnection('conn-1')}>
      Open Connection
    </button>
  ),
}));

vi.mock('@/components/mongo-viewer', () => ({
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
  it('moves into the viewer after activation and clears the active connection when going back', async () => {
    const activateConnection = vi.fn(async (connectionId: string) => {
      expect(connectionId).toBe('conn-1');
    });
    const clearActiveConnection = vi.fn(async () => undefined);
    const state = {
      connections: [{ id: 'conn-1', name: 'Prod', createdAt: '2026-01-01T00:00:00.000Z' }],
      activeConnectionId: null as string | null,
    };

    useConnectionsMock.mockImplementation(() => ({
      connectionsState: state,
      loadingConnections: false,
      connectionError: null,
      saveConnection: vi.fn(async () => undefined),
      activateConnection: vi.fn(async (connectionId: string) => {
        await activateConnection(connectionId);
        state.activeConnectionId = connectionId;
      }),
      clearActiveConnection: vi.fn(async () => {
        await clearActiveConnection();
        state.activeConnectionId = null;
      }),
      removeConnection: vi.fn(async () => undefined),
      pickTlsCertificate: vi.fn(async () => null),
    }));

    const { default: App } = await import('@/App');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Connection' }));

    await waitFor(() => {
      expect(activateConnection).toHaveBeenCalledWith('conn-1');
      expect(screen.getByText('Viewer:Prod')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back To Connections' }));

    await waitFor(() => {
      expect(clearActiveConnection).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Open Connection' })).toBeInTheDocument();
    });
  });
});
