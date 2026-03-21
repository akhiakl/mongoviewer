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

    it('shows tooltips for all help icons', async () => {
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
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );
        // There are three help icons (ⓘ)
        const helpIcons = screen.getAllByText('ⓘ');
        expect(helpIcons.length).toBeGreaterThanOrEqual(3);
    });


    it('shows connection string validation errors after change', () => {
        const onConnectionStringChange = vi.fn();
        render(
            <ConnectionCreateForm
                name=""
                connectionString=""
                tlsCertificatePath=""
                saving={false}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={onConnectionStringChange}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );
        const textarea = screen.getByLabelText('Connection string');
        fireEvent.change(textarea, { target: { value: 'not-a-mongo-uri' } });
        expect(screen.getByText(/Must start with mongodb/)).toBeInTheDocument();
    });


    it('disables submit button if connection string is invalid after change', () => {
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
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );
        const textarea = screen.getByLabelText('Connection string');
        fireEvent.change(textarea, { target: { value: 'not-a-mongo-uri' } });
        const submitButton = screen.getByRole('button', { name: 'Save Connection' });
        expect(submitButton).toBeDisabled();
    });

    it('shows and toggles password visibility in connection string', () => {
        const password = 'secret123';
        const uri = `mongodb://user:${password}@localhost:27017`;
        const onConnectionStringChange = vi.fn();
        render(
            <ConnectionCreateForm
                name=""
                connectionString={uri}
                tlsCertificatePath=""
                saving={false}
                error={null}
                onNameChange={vi.fn()}
                onConnectionStringChange={onConnectionStringChange}
                onTlsCertificatePathChange={vi.fn()}
                onPickTlsCertificate={vi.fn(async () => undefined)}
                onSubmit={vi.fn(async () => undefined)}
            />,
        );
        // Should show the toggle button
        const toggleBtn = screen.getByRole('button', { name: /Show Password/i });
        expect(toggleBtn).toBeInTheDocument();
        // Should mask password by default
        expect(screen.getByDisplayValue(/\*+/)).toBeInTheDocument();
        // Toggle to show password
        fireEvent.click(toggleBtn);
        expect(screen.getByDisplayValue(uri)).toBeInTheDocument();
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
