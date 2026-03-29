import React, { useMemo, useState } from "react"

import { Alert, AlertDescription } from "@/renderer/components/ui/alert"
import { DatabasesSidebar } from "@/renderer/components/mongo-viewer/databases-sidebar"
import { useCollectionDocuments } from "@/renderer/components/mongo-viewer/hooks/use-collection-documents"
import { useCollectionInsights } from "@/renderer/components/mongo-viewer/hooks/use-collection-insights"
import { useDatabasesTree } from "@/renderer/components/mongo-viewer/hooks/use-databases-tree"
import { useQueryPresets } from "@/renderer/components/mongo-viewer/hooks/use-query-presets"
import { getQueryFieldNames, getQueryFieldSamples } from "@/renderer/components/mongo-viewer/query-field-metadata"
import { ViewerHeader } from "@/renderer/components/mongo-viewer/viewer-header"
import { ViewerContent } from "@/renderer/components/mongo-viewer/viewer-content"
import { ViewerFooter } from "@/renderer/components/mongo-viewer/viewer-footer"
import { ViewerNavigation } from "@/renderer/components/mongo-viewer/viewer-navigation"
import type { DatabaseTreeItem, Selection, SortDirection, ViewMode } from "@/renderer/components/mongo-viewer/types"
import { SidebarProvider } from "./ui/sidebar"
import { validateMongoQuery } from "@/lib/query-validation"
import { useDebouncedValue } from "@/renderer/hooks/use-debounced-value"

type MongoViewerClientProps = {
    connectionId: string
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

export function MongoViewerClient({ connectionId, activeConnectionName, onBack }: MongoViewerClientProps) {
    const [selection, setSelection] = useState<Selection | null>(null)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [viewMode, setViewMode] = useState<ViewMode>("table")
    const [quickFilter, setQuickFilter] = useState("")
    const [queryDraft, setQueryDraft] = useState("")
    const [appliedMongoQuery, setAppliedMongoQuery] = useState("")
    const [presetName, setPresetName] = useState("")
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    const { presets, deletePreset, getPresetByName, savePreset } = useQueryPresets(selection)

    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(connectionId)
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        connectionId,
        selection,
        page,
        pageSize,
        mongoQuery: appliedMongoQuery || undefined,
        sortDirection,
        sortField,
    })
    const { indexes, insightsError, loadingInsights, schemaSummary, stats } = useCollectionInsights(connectionId, selection)

    const debouncedQuickFilter = useDebouncedValue(quickFilter, 220)

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
        setQueryDraft("")
        setAppliedMongoQuery("")
        setPresetName("")
        setPageSize(50)
        setSortField(null)
        setSortDirection("asc")
    }, [selection?.collection, selection?.db])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const error = docsError ?? treeError ?? insightsError
    const queryValidationError = useMemo(() => validateMongoQuery(queryDraft), [queryDraft])
    const hasQuickFilter = debouncedQuickFilter.trim().length > 0
    const hasActiveMongoQuery = appliedMongoQuery.trim().length > 0
    const noResultsMessage = useMemo(() => {
        if (records.length === 0 && hasActiveMongoQuery) {
            return "No records match the current Mongo query."
        }

        if (records.length === 0) {
            return "No records for this collection."
        }

        return "No records match the current quick filter."
    }, [hasActiveMongoQuery, records.length])

    const handleApplyQuery = () => {
        if (queryValidationError) {
            return
        }

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
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ViewerHeader
                        activeConnectionName={activeConnectionName}
                        appliedMongoQuery={appliedMongoQuery}
                        filteredRecordsCount={filteredRecords.length}
                        indexes={indexes}
                        loadingInsights={loadingInsights}
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
                        queryValidationError={queryValidationError}
                        quickFilter={quickFilter}
                        schemaSummary={schemaSummary}
                        selection={selection}
                        stats={stats}
                    />

                    {error ? (
                        <Alert variant="destructive" className="mx-4 mt-4 md:mx-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <ViewerContent
                        hasActiveMongoQuery={hasActiveMongoQuery}
                        hasQuickFilter={hasQuickFilter}
                        filteredRecords={filteredRecords}
                        loadingDocs={loadingDocs}
                        noResultsMessage={noResultsMessage}
                        onClearQuickFilter={() => setQuickFilter("")}
                        onResetQuery={handleResetQuery}
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
                        selection={selection}
                        sortDirection={sortDirection}
                        sortField={sortField}
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
                </div>
            </SidebarProvider>
        </section>
    )
}
