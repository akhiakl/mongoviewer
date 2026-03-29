import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditConnectionDialog } from '@/renderer/components/connection-home/edit-connection-dialog';

vi.mock('@/renderer/components/ui/dialog', () => ({
    Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/renderer/services/mongo-viewer-service', () => ({
    mongoViewerService: {
        persistTlsCertificate: vi.fn(async () => 'C:\\storage\\certificates\\mongo.pem'),
    },
}));

describe('EditConnectionDialog', () => {
    it('prefills the selected connection and submits updates', async () => {
        const onSubmit = vi.fn(async () => undefined);

        render(
            <EditConnectionDialog
                connection={{
                    id: 'conn-1',
                    name: 'Prod',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    uri: 'mongodb://localhost:27017/?tls=true&tlsCAFile=C%3A%5C%5Cstorage%5C%5Ccertificates%5C%5Cmongo.pem',
                }}
                open={true}
                error={null}
                saving={false}
                onOpenChange={vi.fn()}
                onSubmit={onSubmit}
                onPickTlsCertificate={vi.fn(async () => null)}
            />,
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Prod')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Connection name'), {
            target: { value: 'Prod Replica' },
        });
        fireEvent.submit(document.getElementById('connection-edit-form') as HTMLFormElement);

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    connectionId: 'conn-1',
                    name: 'Prod Replica',
                }),
            );
        });
    });
});
