import { type SubmitEvent, useState } from "react"

import { ConnectionCreateForm } from "@/renderer/components/connection-home/connection-create-form"
import { SavedConnectionsList } from "@/renderer/components/connection-home/saved-connections-list"
import type { ConnectionHomeProps } from "@/renderer/components/connection-home/types"
import { mongoViewer } from "../renderer-api"

export function ConnectionHome({
    connectionsState,
    loadingConnections,
    connectionError,
    onSaveConnection,
    onDeleteConnection,
    onPickTlsCertificate,
}: ConnectionHomeProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [connectionString, setConnectionString] = useState("")
    const [tlsCertificatePath, setTlsCertificatePath] = useState("")
    const [saving, setSaving] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    const handleAddConnection = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)
        setLocalError(null)

        try {
            let certPathToSave = tlsCertificatePath || undefined;
            // Only upload if certPath is set and not already in app storage
            if (tlsCertificatePath && !/storage[\\/]+certificates/.test(tlsCertificatePath)) {
                certPathToSave = (await mongoViewer.persistTlsCertificate(tlsCertificatePath)) ?? undefined;
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

        try {
            await onDeleteConnection(connectionId)
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Unable to delete connection"
            setLocalError(message)
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

    return (
        <div className="flex h-full w-full min-h-0 flex-col gap-4 bg-card">
            <div className="rounded-lg px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Connections</p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">Connection Workspace</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Save connection profiles locally and reopen them quickly whenever you want to inspect MongoDB data.
                </p>
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
                    onCopy={(uri, connectionId) => {
                        void handleCopy(uri, connectionId)
                    }}
                    onEdit={() => {
                        setLocalError("Editing saved connections is not implemented yet.")
                    }}
                    onDelete={(connectionId) => {
                        void handleDelete(connectionId)
                    }}
                />
            </div>
        </div>

    )
}
