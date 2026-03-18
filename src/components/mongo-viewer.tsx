import { ArrowLeft, Braces, Table2 } from "lucide-react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { DatabasesSidebar } from "@/components/mongo-viewer/databases-sidebar"
import { useCollectionDocuments } from "@/components/mongo-viewer/hooks/use-collection-documents"
import { useDatabasesTree } from "@/components/mongo-viewer/hooks/use-databases-tree"
import { RecordsJsonList } from "@/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/components/mongo-viewer/records-table"
import type { DatabaseTreeItem, Selection, ViewMode } from "@/components/mongo-viewer/types"
import { SidebarInset, SidebarProvider } from "./ui/sidebar"

type MongoViewerClientProps = {
    activeConnectionId: string | null
    activeConnectionName: string | null
    onBack?: () => void
}

function pickSelection(tree: DatabaseTreeItem[], current: Selection | null) {
    if (current) {
        const matchingDatabase = tree.find((db) => db.name === current.db)
        if (matchingDatabase?.collections.includes(current.collection)) {
            return current
        }
    }

    for (const database of tree) {
        if (database.collections.length > 0) {
            return {
                db: database.name,
                collection: database.collections[0],
            }
        }
    }

    return null
}

export function MongoViewerClient({ activeConnectionId, activeConnectionName, onBack }: MongoViewerClientProps) {
    const [selection, setSelection] = useState<Selection | null>(null)
    const [page, setPage] = useState(1)
    const [viewMode, setViewMode] = useState<ViewMode>("table")

    const pageSize = 50

    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(activeConnectionId)
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        activeConnectionId,
        selection,
        page,
        pageSize,
    })

    React.useEffect(() => {
        setSelection((current) => pickSelection(tree, current))
        setPage(1)
    }, [tree])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const error = docsError ?? treeError

    return (
        <section className="overflow-hidden flex-1 flex flex-col">
            <SidebarProvider className="flex-1 flex">
                <DatabasesSidebar
                    tree={tree}
                    loadingTree={loadingTree}
                    treeError={treeError}
                    selection={selection}
                    onRefresh={() => void refreshTree()}
                    onSelectCollection={(nextSelection) => {
                        setSelection(nextSelection)
                        setPage(1)
                    }}
                />
                <SidebarInset>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 md:px-6">
                        <div>
                            {onBack ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mb-2"
                                    onClick={onBack}
                                >
                                    <ArrowLeft className="size-4" />
                                    Connections
                                </Button>
                            ) : null}
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Collection</p>
                            <h1 className="text-lg font-semibold text-slate-800 md:text-xl">
                                {selection ? `${selection.db} / ${selection.collection}` : "Pick a collection"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {activeConnectionName ? `Active connection: ${activeConnectionName}` : "Select a saved connection to start browsing."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("table")}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <Table2 className="size-3.5" />
                                    Table
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("json")}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition ${viewMode === "json" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <Braces className="size-3.5" />
                                    JSON
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Table2 className="size-4" />
                                <span>{selection ? `${total.toLocaleString()} records` : "No collection selected"}</span>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:mx-6">
                            {error}
                        </div>
                    ) : null}

                    <div className="overflow-auto px-4 py-4 md:px-6">
                        {!activeConnectionId ? (
                            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                                Save or activate a connection to start browsing.
                            </div>
                        ) : null}

                        {activeConnectionId && !selection ? (
                            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                                Select a collection from the sidebar to view records.
                            </div>
                        ) : null}

                        {loadingDocs ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-sm text-slate-500">
                                Loading records...
                            </div>
                        ) : null}

                        {!loadingDocs && selection && records.length === 0 ? (
                            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                                No records for this collection.
                            </div>
                        ) : null}

                        {!loadingDocs && selection && records.length > 0 ? (
                            viewMode === "table" ? <RecordsTable records={records} /> : <RecordsJsonList records={records} />
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 md:px-6">
                        <p className="text-xs text-slate-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || loadingDocs || !selection}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages || loadingDocs || !selection}
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </section>
    )
}
