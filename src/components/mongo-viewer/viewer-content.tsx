import { CollectionInsightsPanel } from "@/components/mongo-viewer/collection-insights-panel"
import { RecordsJsonList } from "@/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/components/mongo-viewer/records-table"
import type {
    CollectionIndexSummary,
    CollectionSchemaSummary,
    CollectionStats,
    Selection,
    SortDirection,
    ViewMode,
    ViewerRecord,
} from "@/components/mongo-viewer/types"
import { ViewerToolbar } from "@/components/mongo-viewer/viewer-toolbar"

type ViewerContentProps = {
    filteredRecords: ViewerRecord[]
    indexes: CollectionIndexSummary[]
    loadingInsights: boolean
    loadingDocs: boolean
    noResultsMessage: string
    queryFieldNames: string[]
    schemaSummary: CollectionSchemaSummary | null
    selection: Selection | null
    sortDirection: SortDirection
    sortField: string | null
    stats: CollectionStats | null
    viewMode: ViewMode
    onSortDirectionChange: (direction: SortDirection) => void
    onSortFieldChange: (field: string | null) => void
    onViewModeChange: (value: ViewMode) => void
}

export function ViewerContent({
    filteredRecords,
    indexes,
    loadingInsights,
    loadingDocs,
    noResultsMessage,
    queryFieldNames,
    schemaSummary,
    onViewModeChange,
    onSortDirectionChange,
    onSortFieldChange,
    selection,
    sortDirection,
    sortField,
    stats,
    viewMode,
}: ViewerContentProps) {
    const showEmptySelectionState = !selection
    const showLoadingState = loadingDocs
    const showNoRecordsState = !loadingDocs && selection && filteredRecords.length === 0

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
            <ViewerToolbar
                loadingDocs={loadingDocs}
                onSortDirectionChange={onSortDirectionChange}
                onSortFieldChange={onSortFieldChange}
                onViewModeChange={onViewModeChange}
                queryFieldNames={queryFieldNames}
                selection={Boolean(selection)}
                sortDirection={sortDirection}
                sortField={sortField}
                viewMode={viewMode}
            />

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
                    {noResultsMessage}
                </div>
            ) : null}

            {!showEmptySelectionState && !showLoadingState ? (
                <CollectionInsightsPanel
                    indexes={indexes}
                    loadingInsights={loadingInsights}
                    schemaSummary={schemaSummary}
                    stats={stats}
                />
            ) : null}

            {!showEmptySelectionState && !showLoadingState && filteredRecords.length > 0 ? (
                viewMode === "table" ? (
                    <div className="min-h-0 flex-1">
                        <RecordsTable
                            records={filteredRecords}
                            sortDirection={sortDirection}
                            sortField={sortField}
                            onSortChange={(fieldName) => {
                                if (sortField === fieldName) {
                                    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
                                    return
                                }

                                onSortFieldChange(fieldName)
                                onSortDirectionChange("asc")
                            }}
                        />
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-auto pr-1">
                        <RecordsJsonList records={filteredRecords} />
                    </div>
                )
            ) : null}
        </div>
    )
}
