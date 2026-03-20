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
            await onSaveConnection({
                name,
                connectionString,
                tlsCertificatePath: tlsCertificatePath || undefined,
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
        <div className="flex w-full flex-col gap-6 lg:flex-row">
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

    )
}
