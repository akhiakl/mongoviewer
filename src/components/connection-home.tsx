import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import type { ConnectionsState, SaveConnectionInput } from "@/lib/mongo-types"

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

    const handleAddConnection = async (event: FormEvent<HTMLFormElement>) => {
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
        <section className="rounded-[2rem] border border-black/10 bg-white/78 p-5 shadow-[0_24px_80px_rgba(24,24,27,0.08)] backdrop-blur md:p-6">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Mongo Viewer</p>
                <h1 className="font-['Space_Grotesk'] text-4xl leading-none tracking-[-0.06em] text-stone-900 md:text-5xl">
                    Save connections and inspect live MongoDB collections.
                </h1>
                <p className="max-w-md text-sm leading-6 text-stone-600">
                    The Electron app keeps the Next app workflow, but uses local IPC calls and a JSON store instead of browser navigation and Prisma.
                </p>
            </div>

            <section className="mt-6">
                <h1 className="text-xl font-semibold text-slate-800">Connections</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Save multiple MongoDB or DocumentDB connections and choose one to open in the viewer.
                </p>

                <form onSubmit={handleAddConnection} className="mt-5 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="connection-name" className="text-sm font-medium text-slate-700">
                            Connection name
                        </label>
                        <input
                            id="connection-name"
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                            placeholder="Prod cluster"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="connection-string" className="text-sm font-medium text-slate-700">
                            Connection string
                        </label>
                        <textarea
                            id="connection-string"
                            required
                            value={connectionString}
                            onChange={(event) => setConnectionString(event.target.value)}
                            className="min-h-24 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                            placeholder="mongodb://user:password@host:27017/?replicaSet=rs0"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor="tls-certificate-path" className="text-sm font-medium text-slate-700">
                                TLS certificate path (optional)
                            </label>
                            <button
                                type="button"
                                onClick={async () => {
                                    const selectedPath = await onPickTlsCertificate()
                                    if (selectedPath) {
                                        setTlsCertificatePath(selectedPath)
                                    }
                                }}
                                className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 transition hover:text-stone-900"
                            >
                                Browse
                            </button>
                        </div>
                        <input
                            id="tls-certificate-path"
                            value={tlsCertificatePath}
                            onChange={(event) => setTlsCertificatePath(event.target.value)}
                            className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                            placeholder="/absolute/path/to/rds-combined-ca-bundle.pem"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Connection"}
                    </Button>
                </form>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
                <h2 className="text-lg font-semibold text-slate-800">Saved Connections</h2>
                {loadingConnections ? <p className="mt-2 text-sm text-slate-500">Loading connections...</p> : null}

                {connections.length === 0 ? (
                    <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                        No saved connections yet.
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        {connections.map((connection) => (
                            <div
                                key={connection.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{connection.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(connection.createdAt).toLocaleString()}</p>
                                    {activeConnectionId === connection.id ? (
                                        <p className="text-xs text-emerald-700">Active</p>
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
            </section>
        </section>
    )
}
