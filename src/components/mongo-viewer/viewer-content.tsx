import { Braces, Table2 } from "lucide-react"

import { RecordsJsonList } from "@/components/mongo-viewer/records-json-list"
import { RecordsTable } from "@/components/mongo-viewer/records-table"
import type { Selection, ViewMode, ViewerRecord } from "@/components/mongo-viewer/types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ViewerContentProps = {
    filteredRecords: ViewerRecord[]
    loadingDocs: boolean
    noResultsMessage: string
    selection: Selection | null
    viewMode: ViewMode
    onViewModeChange: (value: ViewMode) => void
}

export function ViewerContent({
    filteredRecords,
    loadingDocs,
    noResultsMessage,
    onViewModeChange,
    selection,
    viewMode,
}: ViewerContentProps) {
    const showEmptySelectionState = !selection
    const showLoadingState = loadingDocs
    const showNoRecordsState = !loadingDocs && selection && filteredRecords.length === 0

    return (
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
                                onViewModeChange(value)
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
    )
}
