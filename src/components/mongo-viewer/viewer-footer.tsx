import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Selection } from "@/components/mongo-viewer/types"

type ViewerFooterProps = {
    loadingDocs: boolean
    page: number
    pageSize: number
    selection: Selection | null
    total: number
    totalPages: number
    onPageChange: (updater: (current: number) => number) => void
    onPageSizeChange: (pageSize: number) => void
}

export function ViewerFooter({
    loadingDocs,
    onPageChange,
    onPageSizeChange,
    page,
    pageSize,
    selection,
    total,
    totalPages,
}: ViewerFooterProps) {
    return (
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
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
                    onClick={() => onPageChange((current) => Math.max(1, current - 1))}
                >
                    Prev
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loadingDocs || !selection}
                    onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
