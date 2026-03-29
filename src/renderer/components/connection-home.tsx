import { type SubmitEvent, useState } from "react"

import { ConnectionCreateForm } from "@/renderer/components/connection-home/connection-create-form"
import { DeleteConnectionDialog } from "@/renderer/components/connection-home/delete-connection-dialog"
import { EditConnectionDialog } from "@/renderer/components/connection-home/edit-connection-dialog"
import { SavedConnectionsList } from "@/renderer/components/connection-home/saved-connections-list"
import type { ConnectionHomeProps } from "@/renderer/components/connection-home/types"
import {
    selectRecentConnectionIds,
    useConnectionSessionStore,
} from "@/renderer/features/connections/store/connection-session-store"
import { getMongoErrorGuidance } from "@/renderer/features/viewer/mongo-error-guidance"
import { mongoViewerService } from "@/renderer/services/mongo-viewer-service"
import type { ConnectionListItem } from "@/shared/mongo-types"

export function ConnectionHome({
    connectionsState,
    loadingConnections,
    connectionError,
    onSaveConnection,
    onUpdateConnection,
    onDeleteConnection,
    onPickTlsCertificate,
}: ConnectionHomeProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [editingConnection, setEditingConnection] = useState<ConnectionListItem | null>(null)
    const [connectionPendingDelete, setConnectionPendingDelete] = useState<ConnectionListItem | null>(null)
    const [name, setName] = useState("")
    const [connectionString, setConnectionString] = useState("")
    const [tlsCertificatePath, setTlsCertificatePath] = useState("")
    const [saving, setSaving] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)
    const recentConnectionIds = useConnectionSessionStore(selectRecentConnectionIds)
    const statusesByConnectionId = useConnectionSessionStore((state) => state.statusesByConnectionId)

    const handleAddConnection = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)
        setLocalError(null)

        try {
            let certPathToSave = tlsCertificatePath || undefined;
            if (tlsCertificatePath && !/storage[\\/]+certificates/.test(tlsCertificatePath)) {
                certPathToSave = (await mongoViewerService.persistTlsCertificate(tlsCertificatePath)) ?? undefined;
            }
            await onSaveConnection({
                name,
                connectionString,
                tlsCertificatePath: certPathToSave,
            })

            setName("")
            setConnectionString("")
            setTlsCertificatePath("")
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Unable to add connection"
            setLocalError(message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (connectionId: string) => {
        setLocalError(null)
        setDeleting(true)

        try {
            await onDeleteConnection(connectionId)
            setConnectionPendingDelete(null)
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Unable to delete connection"
            setLocalError(message)
        } finally {
            setDeleting(false)
        }
    }

    const handleCopy = async (uri: string, connectionId: string) => {
        setLocalError(null)

        try {
            await navigator.clipboard.writeText(uri)
            setCopiedId(connectionId)
            window.setTimeout(() => {
                setCopiedId((current) => (current === connectionId ? null : current))
            }, 1500)
        } catch (copyError) {
            const message = copyError instanceof Error ? copyError.message : "Unable to copy connection string"
            setLocalError(message)
        }
    }

    const error = localError ?? connectionError
    const errorGuidance = getMongoErrorGuidance(error, 'Unable to manage saved connections.')

    return (
        <div className="flex h-full w-full min-h-0 flex-col gap-4 bg-card">
            <div className="rounded-lg px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Connections</p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">Connection Workspace</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Save connection profiles locally and reopen them quickly whenever you want to inspect MongoDB data.
                </p>
                {recentConnectionIds.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Recently opened: {recentConnectionIds.length} saved connection
                        {recentConnectionIds.length !== 1 ? 's' : ''}
                    </p>
                ) : null}
            </div>
            <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(22rem,32rem)_minmax(0,1fr)]">
                <ConnectionCreateForm
                    name={name}
                    connectionString={connectionString}
                    tlsCertificatePath={tlsCertificatePath}
                    saving={saving}
                    error={error}
                    onNameChange={setName}
                    onConnectionStringChange={setConnectionString}
                    onTlsCertificatePathChange={setTlsCertificatePath}
                    onPickTlsCertificate={async () => {
                        const selectedPath = await onPickTlsCertificate()
                        if (selectedPath) {
                            setTlsCertificatePath(selectedPath)
                        }
                    }}
                    onSubmit={handleAddConnection}
                />
                <SavedConnectionsList
                    connectionsState={connectionsState}
                    loadingConnections={loadingConnections}
                    copiedId={copiedId}
                    recentConnectionIds={recentConnectionIds}
                    statusesByConnectionId={statusesByConnectionId}
                    onCopy={(uri, connectionId) => {
                        void handleCopy(uri, connectionId)
                    }}
                    onEdit={(connection) => {
                        setLocalError(null)
                        setEditingConnection(connection)
                    }}
                    onDelete={(connectionId) => {
                        const targetConnection = connectionsState.connections.find(
                            (connection) => connection.id === connectionId,
                        )
                        if (targetConnection) {
                            setConnectionPendingDelete(targetConnection)
                        }
                    }}
                />
            </div>
            <EditConnectionDialog
                connection={editingConnection}
                open={editingConnection !== null}
                error={localError}
                saving={updating}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingConnection(null)
                    }
                }}
                onPickTlsCertificate={onPickTlsCertificate}
                onSubmit={async (input) => {
                    setUpdating(true)
                    setLocalError(null)

                    try {
                        await onUpdateConnection(input)
                    } catch (submitError) {
                        const message =
                            submitError instanceof Error
                                ? submitError.message
                                : 'Unable to update connection'
                        setLocalError(message)
                        throw submitError
                    } finally {
                        setUpdating(false)
                    }
                }}
            />
            <DeleteConnectionDialog
                connectionName={connectionPendingDelete?.name ?? null}
                open={connectionPendingDelete !== null}
                deleting={deleting}
                error={localError ? `${errorGuidance.title}: ${errorGuidance.hint}` : null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConnectionPendingDelete(null)
                    }
                }}
                onConfirm={() => {
                    if (connectionPendingDelete) {
                        void handleDelete(connectionPendingDelete.id)
                    }
                }}
            />
        </div>

    )
}
