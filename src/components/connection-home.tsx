import { SubmitEvent, useState } from "react"

import { ConnectionCreateForm } from "@/components/connection-home/connection-create-form"
import { SavedConnectionsList } from "@/components/connection-home/saved-connections-list"
import type { ConnectionHomeProps } from "@/components/connection-home/types"

export function ConnectionHome({
    connectionsState,
    loadingConnections,
    connectionError,
    onSaveConnection,
    onActivateConnection,
    onDeleteConnection,
    onPickTlsCertificate,
}: ConnectionHomeProps) {
    const [name, setName] = useState("")
    const [connectionString, setConnectionString] = useState("")
    const [tlsCertificatePath, setTlsCertificatePath] = useState("")
    const [saving, setSaving] = useState(false)
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [localError, setLocalError] = useState<string | null>(null)

    const handleAddConnection = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)
        setLocalError(null)

        try {
            let certPathToSave = tlsCertificatePath || undefined;
            // Only upload if certPath is set and not already in app storage
            if (tlsCertificatePath && !/storage[\\/]+certificates/.test(tlsCertificatePath)) {
                certPathToSave = await window.mongoViewer.persistTlsCertificate(tlsCertificatePath);
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

    const handleConnect = async (connectionId: string) => {
        setConnectingId(connectionId)
        setLocalError(null)

        try {
            await onActivateConnection(connectionId)
        } catch (connectError) {
            const message = connectError instanceof Error ? connectError.message : "Unable to connect"
            setLocalError(message)
        } finally {
            setConnectingId(null)
        }
    }

    const handleDelete = async (connectionId: string) => {
        setDeletingId(connectionId)
        setLocalError(null)

        try {
            await onDeleteConnection(connectionId)
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Unable to delete connection"
            setLocalError(message)
        } finally {
            setDeletingId(null)
        }
    }

    const error = localError ?? connectionError

    return (
        <div className="flex h-full w-full min-h-0 flex-col gap-4">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Connections</p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">Connection Workspace</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Save connection profiles locally and reopen them quickly whenever you want to inspect MongoDB data.
                </p>
            </div>
            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(22rem,32rem)_minmax(0,1fr)]">
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
                    connectingId={connectingId}
                    deletingId={deletingId}
                    onConnect={handleConnect}
                    onDelete={handleDelete}
                />
            </div>
        </div>

    )
}
