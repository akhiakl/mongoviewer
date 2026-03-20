import { SubmitEvent, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ConnectionsState, SaveConnectionInput } from "@/lib/mongo-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

type ConnectionHomeProps = {
    connectionsState: ConnectionsState
    loadingConnections: boolean
    connectionError: string | null
    onSaveConnection: (input: SaveConnectionInput) => Promise<void>
    onActivateConnection: (connectionId: string) => Promise<void>
    onDeleteConnection: (connectionId: string) => Promise<void>
    onPickTlsCertificate: () => Promise<string | null>
}

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
    const { connections, activeConnectionId } = connectionsState

    return (
        <div className="flex w-full flex-col gap-6 lg:flex-row">
            <Card className="w-full lg:max-w-2xl">
                <CardHeader>
                    <CardTitle>Create New Connection</CardTitle>
                    <CardDescription>
                        Save connections and inspect live MongoDB collections.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddConnection} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="connection-name">
                                Connection name
                            </Label>
                            <Input
                                id="connection-name"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Prod cluster"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="connection-string">
                                Connection string
                            </Label>
                            <Textarea
                                id="connection-string"
                                required
                                value={connectionString}
                                onChange={(event) => setConnectionString(event.target.value)}
                                className="min-h-24"
                                placeholder="mongodb://user:password@host:27017/?replicaSet=rs0"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="tls-certificate-path">
                                    TLS certificate file (optional)
                                </Label>
                                <div className="flex items-center gap-2">
                                    {tlsCertificatePath ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setTlsCertificatePath("")}
                                        >
                                            Clear
                                        </Button>
                                    ) : null}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={async () => {
                                            const selectedPath = await onPickTlsCertificate()
                                            if (selectedPath) {
                                                setTlsCertificatePath(selectedPath)
                                            }
                                        }}
                                    >
                                        Choose File
                                    </Button>
                                </div>
                            </div>
                            <Input
                                id="tls-certificate-path"
                                value={tlsCertificatePath}
                                readOnly
                                placeholder="No file selected"
                            />
                            <p className="text-xs text-muted-foreground">
                                The selected certificate is copied into app storage with a unique file name.
                            </p>
                        </div>

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : null}

                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Connection"}
                        </Button>
                    </form>
                </CardContent>


            </Card>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Saved Connections</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingConnections ? <p className="text-sm text-muted-foreground">Loading connections...</p> : null}

                    {connections.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No saved connections yet.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-2">
                            {connections.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{connection.name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(connection.createdAt).toLocaleString()}</p>
                                        {activeConnectionId === connection.id ? (
                                            <Badge variant="secondary" className="mt-1">Active</Badge>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={connectingId === connection.id}
                                            onClick={() => void handleConnect(connection.id)}
                                        >
                                            {connectingId === connection.id ? "Connecting..." : "Connect"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={deletingId === connection.id}
                                            onClick={() => void handleDelete(connection.id)}
                                        >
                                            {deletingId === connection.id ? "Removing..." : "Remove"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    )
}
