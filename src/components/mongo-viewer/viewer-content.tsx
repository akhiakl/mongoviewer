import { RecordsJsonList } from "@/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/components/mongo-viewer/records-table"
import type {
    Selection,
    SortDirection,
    ViewMode,
    ViewerRecord,
} from "@/components/mongo-viewer/types"
import { ViewerToolbar } from "@/components/mongo-viewer/viewer-toolbar"

type ViewerContentProps = {
    filteredRecords: ViewerRecord[]
    loadingDocs: boolean
    noResultsMessage: string
    queryFieldNames: string[]
    selection: Selection | null
    sortDirection: SortDirection
    sortField: string | null
    viewMode: ViewMode
    onSortDirectionChange: (direction: SortDirection) => void
    onSortFieldChange: (field: string | null) => void
    onViewModeChange: (value: ViewMode) => void
}

export function ViewerContent({
    filteredRecords,
    loadingDocs,
    noResultsMessage,
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
                    <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                        Loading records...
                    </div>
                ) : null}

                {showNoRecordsState ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        {noResultsMessage}
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
