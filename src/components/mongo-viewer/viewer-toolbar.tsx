import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"

import type { SortDirection, ViewMode } from "@/components/mongo-viewer/types"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Braces, Table2 } from "lucide-react"

type ViewerToolbarProps = {
    loadingDocs: boolean
    queryFieldNames: string[]
    selection: boolean
    sortDirection: SortDirection
    sortField: string | null
    viewMode: ViewMode
    onSortDirectionChange: (direction: SortDirection) => void
    onSortFieldChange: (field: string | null) => void
    onViewModeChange: (value: ViewMode) => void
}

export function ViewerToolbar({
    loadingDocs,
    onSortDirectionChange,
    onSortFieldChange,
    onViewModeChange,
    queryFieldNames,
    selection,
    sortDirection,
    sortField,
    viewMode,
}: ViewerToolbarProps) {
    if (!selection) {
        return null
    }

    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="sort-field" className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Sort
                </label>
                <select
                    id="sort-field"
                    aria-label="Sort field"
                    value={sortField ?? ""}
                    onChange={(event) => onSortFieldChange(event.target.value || null)}
                    className="h-8 min-w-40 rounded-md border border-input bg-background px-2 text-sm"
                >
                    <option value="">Newest/default order</option>
                    {queryFieldNames.map((fieldName) => (
                        <option key={fieldName} value={fieldName}>
                            {fieldName}
                        </option>
                    ))}
                </select>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!sortField || loadingDocs}
                    onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
                >
                    {sortDirection === "asc" ? <ArrowUpAZ className="size-4" /> : <ArrowDownAZ className="size-4" />}
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                </Button>
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
    )
}
