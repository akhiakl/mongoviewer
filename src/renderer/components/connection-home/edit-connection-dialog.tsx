import { useEffect, useMemo, useState } from 'react';

import { ConnectionCreateForm } from '@/renderer/components/connection-home/connection-create-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/renderer/components/ui/dialog';
import type { ConnectionListItem, UpdateConnectionInput } from '@/shared/mongo-types';
import {
    extractTlsCertificatePath,
    isPersistedTlsCertificatePath,
} from '@/renderer/features/connections/connection-form-utils';
import { mongoViewerService } from '@/renderer/services/mongo-viewer-service';

type EditConnectionDialogProps = {
    connection: ConnectionListItem | null;
    open: boolean;
    error: string | null;
    saving: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: UpdateConnectionInput) => Promise<void>;
    onPickTlsCertificate: () => Promise<string | null>;
};

export function EditConnectionDialog({
    connection,
    open,
    error,
    saving,
    onOpenChange,
    onSubmit,
    onPickTlsCertificate,
}: EditConnectionDialogProps) {
    const [name, setName] = useState('');
    const [connectionString, setConnectionString] = useState('');
    const [tlsCertificatePath, setTlsCertificatePath] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (!connection || !open) {
            return;
        }

        setName(connection.name);
        setConnectionString(connection.uri);
        setTlsCertificatePath(extractTlsCertificatePath(connection.uri));
        setLocalError(null);
    }, [connection, open]);

    const dialogError = localError ?? error;
    const canRenderForm = open && connection !== null;

    const title = useMemo(
        () => (connection ? `Edit ${connection.name}` : 'Edit connection'),
        [connection],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[min(92vw,48rem)] p-0">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Update the saved profile without leaving the connections workspace.
                    </DialogDescription>
                </DialogHeader>
                {canRenderForm ? (
                    <div className="p-6 pt-4">
                        <ConnectionCreateForm
                            name={name}
                            connectionString={connectionString}
                            tlsCertificatePath={tlsCertificatePath}
                            saving={saving}
                            error={dialogError}
                            title={null}
                            description={null}
                            submitLabel="Save Changes"
                            formId="connection-edit-form"
                            onNameChange={setName}
                            onConnectionStringChange={setConnectionString}
                            onTlsCertificatePathChange={setTlsCertificatePath}
                            onPickTlsCertificate={async () => {
                                const selectedPath = await onPickTlsCertificate();
                                if (selectedPath) {
                                    setTlsCertificatePath(selectedPath);
                                }
                            }}
                            onSubmit={async (event) => {
                                event.preventDefault();
                                if (!connection) {
                                    return;
                                }

                                setLocalError(null);

                                try {
                                    let certPathToSave = tlsCertificatePath || undefined;
                                    if (
                                        tlsCertificatePath &&
                                        !isPersistedTlsCertificatePath(tlsCertificatePath)
                                    ) {
                                        certPathToSave =
                                            (await mongoViewerService.persistTlsCertificate(
                                                tlsCertificatePath,
                                            )) ?? undefined;
                                    }

                                    await onSubmit({
                                        connectionId: connection.id,
                                        name,
                                        connectionString,
                                        tlsCertificatePath: certPathToSave,
                                    });

                                    onOpenChange(false);
                                } catch (submitError) {
                                    const message =
                                        submitError instanceof Error
                                            ? submitError.message
                                            : 'Unable to update connection';
                                    setLocalError(message);
                                }
                            }}
                        />
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
