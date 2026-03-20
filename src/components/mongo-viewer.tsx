import React, { useMemo, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatabasesSidebar } from "@/components/mongo-viewer/databases-sidebar"
import { useCollectionDocuments } from "@/components/mongo-viewer/hooks/use-collection-documents"
import { useDatabasesTree } from "@/components/mongo-viewer/hooks/use-databases-tree"
import { useQueryPresets } from "@/components/mongo-viewer/hooks/use-query-presets"
import { RecordsJsonList } from "@/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/components/mongo-viewer/records-table"
import { ViewerHeader } from "@/components/mongo-viewer/viewer-header"
import type { DatabaseTreeItem, Selection, ViewMode } from "@/components/mongo-viewer/types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ArrowLeft, Braces, Database, Table2 } from "lucide-react"
import { SidebarInset, SidebarProvider } from "./ui/sidebar"

type MongoViewerClientProps = {
    activeConnectionId: string | null
    activeConnectionName: string | null
    onBack?: () => void
}

const MAX_AUTOCOMPLETE_RECORDS = 100
const MAX_AUTOCOMPLETE_DEPTH = 2
type QuerySampleValue = string | number | boolean | null

function isNestedDocument(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isExtendedJsonScalar(value: Record<string, unknown>) {
    const keys = Object.keys(value)
    return keys.length > 0 && keys.every((key) => key.startsWith("$"))
}

function collectFieldPaths(value: unknown, fieldNames: Set<string>, prefix = "", depth = 0) {
    if (!isNestedDocument(value) || isExtendedJsonScalar(value)) {
        return
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = prefix ? `${prefix}.${key}` : key
        fieldNames.add(nextPath)

        if (depth < MAX_AUTOCOMPLETE_DEPTH) {
            collectFieldPaths(nestedValue, fieldNames, nextPath, depth + 1)
        }
    }
}

function isSampleValue(value: unknown): value is QuerySampleValue {
    return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}

function collectFieldSamples(
    value: unknown,
    fieldSamples: Map<string, Set<QuerySampleValue>>,
    prefix = "",
    depth = 0,
) {
    if (!isNestedDocument(value) || isExtendedJsonScalar(value)) {
        return
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = prefix ? `${prefix}.${key}` : key

        if (isSampleValue(nestedValue)) {
            const samples = fieldSamples.get(nextPath) ?? new Set<QuerySampleValue>()
            if (samples.size < 12) {
                samples.add(nestedValue)
            }
            fieldSamples.set(nextPath, samples)
        }

        if (depth < MAX_AUTOCOMPLETE_DEPTH) {
            collectFieldSamples(nestedValue, fieldSamples, nextPath, depth + 1)
        }
    }
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
    const [pageSize, setPageSize] = useState(50)
    const [viewMode, setViewMode] = useState<ViewMode>("table")
    const [quickFilter, setQuickFilter] = useState("")
    const [debouncedQuickFilter, setDebouncedQuickFilter] = useState("")
    const [queryDraft, setQueryDraft] = useState("")
    const [appliedMongoQuery, setAppliedMongoQuery] = useState("")
    const [presetName, setPresetName] = useState("")

    const { presets, deletePreset, getPresetByName, savePreset } = useQueryPresets(selection)

    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(activeConnectionId)
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        activeConnectionId,
        selection,
        page,
        pageSize,
        mongoQuery: appliedMongoQuery || undefined,
    })

    React.useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedQuickFilter(quickFilter)
        }, 150)

        return () => window.clearTimeout(timeoutId)
    }, [quickFilter])

    const filteredRecords = useMemo(() => {
        const normalizedFilter = debouncedQuickFilter.trim().toLowerCase()
        if (!normalizedFilter) {
            return records
        }

        return records.filter((record) => JSON.stringify(record).toLowerCase().includes(normalizedFilter))
    }, [debouncedQuickFilter, records])
    const queryFieldNames = useMemo(() => {
        const nextFieldNames = new Set<string>()

        for (const record of records.slice(0, MAX_AUTOCOMPLETE_RECORDS)) {
            collectFieldPaths(record, nextFieldNames)
        }

        const ordered = Array.from(nextFieldNames).sort((left, right) => left.localeCompare(right))
        if (ordered.includes("_id")) {
            return ["_id", ...ordered.filter((fieldName) => fieldName !== "_id")]
        }

        return ordered
    }, [records])
    const queryFieldSamples = useMemo(() => {
        const samplesByField = new Map<string, Set<QuerySampleValue>>()

        for (const record of records.slice(0, MAX_AUTOCOMPLETE_RECORDS)) {
            collectFieldSamples(record, samplesByField)
        }

        return Object.fromEntries(
            Array.from(samplesByField.entries()).map(([fieldName, samples]) => [fieldName, Array.from(samples)]),
        )
    }, [records])

    React.useEffect(() => {
        setSelection((current) => pickSelection(tree, current))
        setPage(1)
    }, [tree])

    React.useEffect(() => {
        setQuickFilter("")
        setDebouncedQuickFilter("")
        setQueryDraft("")
        setAppliedMongoQuery("")
        setPresetName("")
        setPageSize(50)
    }, [selection?.collection, selection?.db])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const error = docsError ?? treeError
    const showEmptyConnectionState = !activeConnectionId
    const showEmptySelectionState = activeConnectionId && !selection
    const showLoadingState = loadingDocs
    const showNoRecordsState = !loadingDocs && selection && records.length === 0
    const showNoMatchesState = !loadingDocs && selection && records.length > 0 && filteredRecords.length === 0
    const showRecords = !loadingDocs && selection && filteredRecords.length > 0

    const handleApplyQuery = () => {
        setAppliedMongoQuery(queryDraft.trim())
        setPage(1)
    }

    const handleResetQuery = () => {
        setQueryDraft("")
        setAppliedMongoQuery("")
        setPresetName("")
        setPage(1)
    }

    const handleSavePreset = () => {
        if (savePreset(presetName, queryDraft)) {
            setPresetName(presetName.trim())
        }
    }

    const handleDeletePreset = () => {
        if (deletePreset(presetName)) {
            setPresetName("")
        }
    }

    const handlePresetSelect = (name: string) => {
        setPresetName(name)

        const preset = getPresetByName(name)
        if (preset) {
            setQueryDraft(preset.query)
        }
    }

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {onBack ? (
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                    <div className="min-w-0 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Database className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Navigation</p>
                            <p className="truncate text-sm font-medium text-foreground">
                                {activeConnectionName ?? "Connected session"}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0" onClick={onBack}>
                        <ArrowLeft className="size-4" />
                        Back To Connections
                    </Button>
                </div>
            ) : null}
            <SidebarProvider className="flex min-h-0 flex-1">
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
                <SidebarInset className="min-h-0 overflow-hidden">
                    <ViewerHeader
                        activeConnectionName={activeConnectionName}
                        appliedMongoQuery={appliedMongoQuery}
                        filteredRecordsCount={filteredRecords.length}
                        loadingDocs={loadingDocs}
                        onApplyQuery={handleApplyQuery}
                        onDeletePreset={handleDeletePreset}
                        onPresetNameChange={setPresetName}
                        onPresetSelect={handlePresetSelect}
                        onQueryDraftChange={setQueryDraft}
                        onQuickFilterChange={setQuickFilter}
                        onResetQuery={handleResetQuery}
                        onSavePreset={handleSavePreset}
                        presetName={presetName}
                        presets={presets}
                        queryFieldNames={queryFieldNames}
                        queryFieldSamples={queryFieldSamples}
                        queryDraft={queryDraft}
                        quickFilter={quickFilter}
                        selection={selection}
                    />

                    {error ? (
                        <Alert variant="destructive" className="mx-4 mt-4 md:mx-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
                        {selection ? (
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span>View</span>
                                </div>
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
                            </div>
                        ) : null}

                        {showEmptyConnectionState ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                Save or activate a connection to start browsing.
                            </div>
                        ) : null}

                        {showEmptySelectionState ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                Select a collection from the sidebar to view records.
                            </div>
                        ) : null}

                        {showLoadingState ? (
                            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                                Loading records...
                            </div>
                        ) : null}

                        {showNoRecordsState ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                No records for this collection.
                            </div>
                        ) : null}

                        {showNoMatchesState ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                No records match the current quick filter.
                            </div>
                        ) : null}

                        {showRecords ? (
                            viewMode === "table" ? (
                                <div className="min-h-0 flex-1">
                                    <RecordsTable records={filteredRecords} />
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 overflow-auto pr-1">
                                    <RecordsJsonList records={filteredRecords} />
                                </div>
                            )
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-border px-4 py-3 md:px-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            {selection ? <Badge variant="secondary">{total.toLocaleString()} records</Badge> : null}
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="page-size" className="text-xs text-muted-foreground">
                                Rows
                            </label>
                            <select
                                id="page-size"
                                aria-label="Rows per page"
                                value={String(pageSize)}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value))
                                    setPage(1)
                                }}
                                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                            >
                                {[50, 100, 150, 200].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
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
