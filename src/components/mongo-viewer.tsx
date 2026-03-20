import React, { useMemo, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatabasesSidebar } from "@/components/mongo-viewer/databases-sidebar"
import { useCollectionDocuments } from "@/components/mongo-viewer/hooks/use-collection-documents"
import { useCollectionInsights } from "@/components/mongo-viewer/hooks/use-collection-insights"
import { useDatabasesTree } from "@/components/mongo-viewer/hooks/use-databases-tree"
import { useQueryPresets } from "@/components/mongo-viewer/hooks/use-query-presets"
import { getQueryFieldNames, getQueryFieldSamples } from "@/components/mongo-viewer/query-field-metadata"
import { ViewerHeader } from "@/components/mongo-viewer/viewer-header"
import { ViewerContent } from "@/components/mongo-viewer/viewer-content"
import { ViewerFooter } from "@/components/mongo-viewer/viewer-footer"
import { ViewerNavigation } from "@/components/mongo-viewer/viewer-navigation"
import type { DatabaseTreeItem, Selection, SortDirection, ViewMode } from "@/components/mongo-viewer/types"
import { SidebarInset, SidebarProvider } from "./ui/sidebar"

type MongoViewerClientProps = {
    activeConnectionId: string | null
    activeConnectionName: string | null
    onBack?: () => void
}

const MAX_AUTOCOMPLETE_RECORDS = 100
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
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    const { presets, deletePreset, getPresetByName, savePreset } = useQueryPresets(selection)

    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(activeConnectionId)
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        activeConnectionId,
        selection,
        page,
        pageSize,
        mongoQuery: appliedMongoQuery || undefined,
        sortDirection,
        sortField,
    })
    const { indexes, insightsError, loadingInsights, schemaSummary, stats } = useCollectionInsights(activeConnectionId, selection)

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
    const queryFieldNames = useMemo(() => getQueryFieldNames(records, MAX_AUTOCOMPLETE_RECORDS), [records])
    const queryFieldSamples = useMemo(() => getQueryFieldSamples(records, MAX_AUTOCOMPLETE_RECORDS), [records])

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
        setSortField(null)
        setSortDirection("asc")
    }, [selection?.collection, selection?.db])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const error = docsError ?? treeError ?? insightsError
    const showEmptyConnectionState = !activeConnectionId
    const noResultsMessage =
        records.length === 0 ? "No records for this collection." : "No records match the current quick filter."

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
            {onBack ? <ViewerNavigation activeConnectionName={activeConnectionName} onBack={onBack} /> : null}
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

                    {showEmptyConnectionState ? (
                        <div className="flex flex-1 items-center justify-center px-4 py-4 text-sm text-muted-foreground md:px-6">
                            Save or activate a connection to start browsing.
                        </div>
                    ) : (
                        <>
                            <ViewerContent
                                filteredRecords={filteredRecords}
                                indexes={indexes}
                                loadingInsights={loadingInsights}
                                loadingDocs={loadingDocs}
                                noResultsMessage={noResultsMessage}
                                onSortDirectionChange={(direction) => {
                                    setSortDirection(direction)
                                    setPage(1)
                                }}
                                onSortFieldChange={(field) => {
                                    setSortField(field)
                                    setPage(1)
                                }}
                                onViewModeChange={setViewMode}
                                queryFieldNames={queryFieldNames}
                                schemaSummary={schemaSummary}
                                selection={selection}
                                sortDirection={sortDirection}
                                sortField={sortField}
                                stats={stats}
                                viewMode={viewMode}
                            />
                            <ViewerFooter
                                loadingDocs={loadingDocs}
                                onPageChange={setPage}
                                onPageSizeChange={(nextPageSize) => {
                                    setPageSize(nextPageSize)
                                    setPage(1)
                                }}
                                page={page}
                                pageSize={pageSize}
                                selection={selection}
                                total={total}
                                totalPages={totalPages}
                            />
                        </>
                    )}
                </SidebarInset>
            </SidebarProvider>
        </section>
    )
}
