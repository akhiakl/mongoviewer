import { RecordsJsonList } from "@/renderer/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/renderer/components/mongo-viewer/records-table"
import type {
    Selection,
    SortDirection,
    ViewMode,
    ViewerRecord,
} from "@/renderer/components/mongo-viewer/types"
import { Button } from "@/renderer/components/ui/button"
import { Skeleton } from "@/renderer/components/ui/skeleton"
import { ViewerToolbar } from "@/renderer/components/mongo-viewer/viewer-toolbar"

type ViewerContentProps = {
    hasActiveMongoQuery: boolean
    hasQuickFilter: boolean
    filteredRecords: ViewerRecord[]
    loadingDocs: boolean
    noResultsMessage: string
    queryFieldNames: string[]
    selection: Selection | null
    sortDirection: SortDirection
    sortField: string | null
    viewMode: ViewMode
    onClearQuickFilter: () => void
    onResetQuery: () => void
    onSortDirectionChange: (direction: SortDirection) => void
    onSortFieldChange: (field: string | null) => void
    onViewModeChange: (value: ViewMode) => void
}

export function ViewerContent({
    hasActiveMongoQuery,
    hasQuickFilter,
    filteredRecords,
    loadingDocs,
    noResultsMessage,
    onClearQuickFilter,
    onResetQuery,
    queryFieldNames,
    onViewModeChange,
    onSortDirectionChange,
    onSortFieldChange,
    selection,
    sortDirection,
    sortField,
    viewMode,
}: ViewerContentProps) {
    const showEmptySelectionState = !selection
    const showLoadingState = loadingDocs
    const showNoRecordsState = !loadingDocs && selection && filteredRecords.length === 0

    return (
        <div className="flex flex-col px-4 py-4 md:px-6">
            <div className="flex flex-col">
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
                    <ViewerLoadingState />
                ) : null}

                {showNoRecordsState ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center">
                        <div>
                            <p className="text-sm font-medium text-foreground">{noResultsMessage}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {hasQuickFilter || hasActiveMongoQuery
                                    ? "Try clearing the active filter or query to widen the result set."
                                    : "Try switching collections or refreshing the tree if you expected data here."}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {hasQuickFilter ? (
                                <Button variant="outline" size="sm" onClick={onClearQuickFilter}>
                                    Clear Quick Filter
                                </Button>
                            ) : null}
                            {hasActiveMongoQuery ? (
                                <Button variant="outline" size="sm" onClick={onResetQuery}>
                                    Reset Query
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {!showEmptySelectionState && !showLoadingState && filteredRecords.length > 0 ? (
                    viewMode === "table" ? (
                        <div className="min-h-80 flex-1 overflow-hidden">
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
                        <div className="min-h-80 flex-1 overflow-auto pr-1">
                            <RecordsJsonList records={filteredRecords} />
                        </div>
                    )
                ) : null}
            </div>
        </div>
    )
}

function ViewerLoadingState() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Loading records...</p>
            <div className="rounded-md border border-border">
                <div className="grid grid-cols-4 gap-0 border-b border-border bg-muted/30 p-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 p-2">
                    {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton key={index} className="h-11 w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}
