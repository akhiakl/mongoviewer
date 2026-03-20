import { ArrowLeft, Braces, Search, Table2 } from "lucide-react"
import React, { useMemo, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    const [quickFilter, setQuickFilter] = useState("")
    const [queryDraft, setQueryDraft] = useState("")
    const [appliedMongoQuery, setAppliedMongoQuery] = useState("")

    const pageSize = 50

    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(activeConnectionId)
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        activeConnectionId,
        selection,
        page,
        pageSize,
        mongoQuery: appliedMongoQuery || undefined,
    })

    const filteredRecords = useMemo(() => {
        const normalizedFilter = quickFilter.trim().toLowerCase()
        if (!normalizedFilter) {
            return records
        }

        return records.filter((record) => JSON.stringify(record).toLowerCase().includes(normalizedFilter))
    }, [quickFilter, records])

    React.useEffect(() => {
        setSelection((current) => pickSelection(tree, current))
        setPage(1)
    }, [tree])

    React.useEffect(() => {
        setQuickFilter("")
        setQueryDraft("")
        setAppliedMongoQuery("")
    }, [selection?.collection, selection?.db])

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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
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
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Collection</p>
                            <h1 className="text-lg font-semibold text-foreground md:text-xl">
                                {selection ? `${selection.db} / ${selection.collection}` : "Pick a collection"}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activeConnectionName ? `Active connection: ${activeConnectionName}` : "Select a saved connection to start browsing."}
                            </p>
                            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-start">
                                <div className="relative w-full md:max-w-sm">
                                    <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={quickFilter}
                                        onChange={(event) => setQuickFilter(event.target.value)}
                                        placeholder="Quick filter current page records"
                                        className="pl-8"
                                    />
                                </div>
                                <div className="w-full md:max-w-lg">
                                    <Textarea
                                        value={queryDraft}
                                        onChange={(event) => setQueryDraft(event.target.value)}
                                        className="min-h-16"
                                        placeholder='Mongo query JSON, e.g. { "status": "active" }'
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setAppliedMongoQuery(queryDraft.trim())
                                                setPage(1)
                                            }}
                                            disabled={!selection || loadingDocs}
                                        >
                                            Apply Query
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setQueryDraft("")
                                                setAppliedMongoQuery("")
                                                setPage(1)
                                            }}
                                            disabled={!queryDraft && !appliedMongoQuery}
                                        >
                                            Reset Query
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ToggleGroup
                                type="single"
                                value={viewMode}
                                onValueChange={(value) => {
                                    if (value === "table" || value === "json") {
                                        setViewMode(value)
                                    }
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <ToggleGroupItem value="table" aria-label="Table view">
                                    <Table2 className="size-3.5" />
                                    Table
                                </ToggleGroupItem>
                                <ToggleGroupItem value="json" aria-label="JSON view">
                                    <Braces className="size-3.5" />
                                    JSON
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Table2 className="size-4" />
                                {selection ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{total.toLocaleString()} records</Badge>
                                        {quickFilter ? (
                                            <Badge variant="outline">{filteredRecords.length.toLocaleString()} shown</Badge>
                                        ) : null}
                                        {appliedMongoQuery ? <Badge variant="outline">query active</Badge> : null}
                                    </div>
                                ) : (
                                    <span>No collection selected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <Alert variant="destructive" className="mx-4 mt-4 md:mx-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="overflow-auto px-4 py-4 md:px-6">
                        {!activeConnectionId ? (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                Save or activate a connection to start browsing.
                            </div>
                        ) : null}

                        {activeConnectionId && !selection ? (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                Select a collection from the sidebar to view records.
                            </div>
                        ) : null}

                        {loadingDocs ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                                Loading records...
                            </div>
                        ) : null}

                        {!loadingDocs && selection && records.length === 0 ? (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                No records for this collection.
                            </div>
                        ) : null}

                        {!loadingDocs && selection && records.length > 0 && filteredRecords.length === 0 ? (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                No records match the current quick filter.
                            </div>
                        ) : null}

                        {!loadingDocs && selection && filteredRecords.length > 0 ? (
                            viewMode === "table" ? <RecordsTable records={filteredRecords} /> : <RecordsJsonList records={filteredRecords} />
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-border px-4 py-3 md:px-6">
                        <p className="text-xs text-muted-foreground">
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
