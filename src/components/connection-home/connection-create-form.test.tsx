import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConnectionCreateForm } from '@/components/connection-home/connection-create-form';

describe('ConnectionCreateForm', () => {
    it('submits form and calls onSubmit', () => {
        const onSubmit = vi.fn(async () => undefined);

        render(
            <ConnectionCreateForm
                name="Prod"
                connectionString="mongodb://localhost:27017"
                tlsCertificatePath=""
                saving={false}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={vi.fn()}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={onSubmit}
            />,
        );

        const form = screen.getByRole('button', { name: 'Save Connection' }).closest('form');
        expect(form).not.toBeNull();
        if (form) {
            fireEvent.submit(form);
        }
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls file picker callback when Choose File is clicked', () => {
        const onPickTlsCertificate = vi.fn(async () => undefined);

        render(
            <ConnectionCreateForm
                name=""
                connectionString=""
                tlsCertificatePath=""
                saving={false}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={vi.fn()}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={onPickTlsCertificate}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Choose File' }));
        expect(onPickTlsCertificate).toHaveBeenCalledTimes(1);
    });

    it('shows clear button when cert path exists and clears it', () => {
        const onTlsCertificatePathChange = vi.fn();

        render(
            <ConnectionCreateForm
                name=""
                connectionString=""
                tlsCertificatePath="C:/certs/ca.pem"
                saving={false}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={vi.fn()}
                onTlsCertificatePathChange={onTlsCertificatePathChange}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(onTlsCertificatePathChange).toHaveBeenCalledWith('');
    });

    it('renders error message when provided', () => {
        render(
            <ConnectionCreateForm
                name=""
                connectionString=""
                tlsCertificatePath=""
                saving={false}
                error="Unable to save"
                onNameChange={vi.fn()}
                onConnectionStringChange={vi.fn()}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );

        expect(screen.getByText('Unable to save')).toBeInTheDocument();
    });

    it('forwards input and textarea changes', () => {
        const onNameChange = vi.fn();
        const onConnectionStringChange = vi.fn();

        render(
            <ConnectionCreateForm
                name=""
                connectionString=""
                tlsCertificatePath=""
                saving={false}
                error={null}
                onNameChange={onNameChange}
                onConnectionStringChange={onConnectionStringChange}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );

        fireEvent.change(screen.getByLabelText('Connection name'), { target: { value: 'Prod' } });
        fireEvent.change(screen.getByLabelText('Connection string'), {
            target: { value: 'mongodb://localhost:27017' },
        });

        expect(onNameChange).toHaveBeenCalledWith('Prod');
        expect(onConnectionStringChange).toHaveBeenCalledWith('mongodb://localhost:27017');
    });

    it('disables submit button while saving', () => {
        render(
            <ConnectionCreateForm
                name="Prod"
                connectionString="mongodb://localhost:27017"
                tlsCertificatePath=""
                saving={true}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={vi.fn()}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );

        const submitButton = screen.getByRole('button', { name: 'Saving...' });
        expect(submitButton).toBeDisabled();
    });
});
