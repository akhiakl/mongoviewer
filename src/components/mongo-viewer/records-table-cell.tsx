import type { MouseEvent } from "react"
import { Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCellTooltip, formatCellValue, formatEjsonScalar } from "@/lib/document-format"

type RecordsTableCellProps = {
    column: string
    onInspect?: () => void
    value: unknown
}

function copyCellValue(event: MouseEvent<HTMLButtonElement>, value: unknown) {
    event.preventDefault()
    event.stopPropagation()

    const nextValue =
        value === null || value === undefined
            ? "-"
            : typeof value === "string"
              ? value
              : typeof value === "number" || typeof value === "boolean"
                ? String(value)
                : JSON.stringify(value, null, 2)

    void navigator.clipboard?.writeText(nextValue)
}

function isInspectableValue(value: unknown) {
    if (Array.isArray(value)) {
        return true
    }

    if (typeof value === "object" && value !== null) {
        return formatEjsonScalar(value as Record<string, unknown>) === null
    }

    return false
}

export function RecordsTableCell({ column, onInspect, value }: RecordsTableCellProps) {
    const sharedTitle = formatCellTooltip(value)
    const preview = formatCellValue(value)

    if (isInspectableValue(value) && onInspect) {
        return (
            <div
                role="cell"
                title={sharedTitle}
                className="group flex h-full min-w-0 items-start justify-between gap-2 self-stretch border-r border-border px-2 py-2 text-left text-xs text-foreground last:border-r-0"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Inspect ${column} value`}
                    className="h-auto min-w-0 flex-1 justify-start gap-2 rounded-sm px-1.5 py-1 text-left text-foreground hover:bg-muted/50"
                    onClick={onInspect}
                >
                    <div className="line-clamp-2 min-w-0 flex-1 break-words pr-1 text-[12px] leading-5">{preview}</div>
                    <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    >
                        Inspect
                    </Badge>
                </Button>
                <div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Copy ${column} value`}
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(event) => copyCellValue(event, value)}
                    >
                        <Copy className="size-3" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            role="cell"
            title={sharedTitle}
            className="group flex h-full min-w-0 items-start justify-between gap-2 self-stretch border-r border-border px-2 py-2 text-xs text-foreground last:border-r-0"
        >
            <div className="line-clamp-2 min-w-0 flex-1 break-words text-[12px] leading-5">{preview}</div>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Copy ${column} value`}
                className="shrink-0 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
                onClick={(event) => copyCellValue(event, value)}
            >
                <Copy className="size-3" />
            </Button>
        </div>
    )
}
