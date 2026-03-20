import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { List, type ListImperativeAPI, type RowComponentProps } from "react-window"

import { RecordsTableCell } from "@/components/mongo-viewer/records-table-cell"
import { JsonValueInspector } from "@/components/mongo-viewer/json-value-viewer"
import type { SortDirection } from "@/components/mongo-viewer/types"
import { formatCellValue } from "@/lib/document-format"

type RecordsTableProps = {
    onSortChange?: (fieldName: string) => void
    records: Record<string, unknown>[]
    sortDirection?: SortDirection
    sortField?: string | null
}

const MIN_COLUMN_WIDTH = 140

type RecordRowProps = {
    columns: string[]
    columnWidths: Record<string, number>
    onInspectCell: (fieldName: string, rowIndex: number) => void
    records: Record<string, unknown>[]
    gridTemplateColumns: string
}

function describeValueType(value: unknown): string {
    if (value === null) {
        return "null"
    }

    if (value === undefined) {
        return "unknown"
    }

    if (Array.isArray(value)) {
        return "array"
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return typeof value
    }

    if (typeof value === "object") {
        if ("$oid" in value) {
            return "objectId"
        }

        if ("$date" in value) {
            return "date"
        }

        if ("$numberInt" in value || "$numberLong" in value || "$numberDouble" in value || "$numberDecimal" in value) {
            return "number"
        }

        return "object"
    }

    return typeof value
}

function getDefaultColumnWidth(column: string, type: string) {
    if (column === "_id") {
        return 220
    }

    if (type === "object" || type === "array") {
        return 240
    }

    if (type === "objectId" || type === "date") {
        return 200
    }

    return 180
}

function RecordRow({ columns, gridTemplateColumns, index, onInspectCell, records, style }: RowComponentProps<RecordRowProps>) {
    const record = records[index]

    return (
        <div
            role="row"
            aria-rowindex={index + 2}
            className="grid items-stretch border-b border-border bg-background transition-colors hover:bg-muted/30"
            style={{
                ...style,
                gridTemplateColumns,
            }}
        >
            {columns.map((column) => (
                <RecordsTableCell
                    key={`${index}-${column}`}
                    column={column}
                    onInspect={() => onInspectCell(column, index)}
                    value={record[column]}
                />
            ))}
        </div>
    )
}

export function RecordsTable({ onSortChange, records, sortDirection = "asc", sortField = null }: RecordsTableProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const listRef = useRef<ListImperativeAPI | null>(null)
    const resizeStateRef = useRef<{ column: string; startWidth: number; startX: number } | null>(null)
    const [inspectedCell, setInspectedCell] = useState<{ column: string; rowIndex: number } | null>(null)
    const columns = useMemo(() => {
        const keys = new Set<string>()
        for (const record of records) {
            Object.keys(record).forEach((key) => keys.add(key))
        }
        const ordered = Array.from(keys).sort((a, b) => a.localeCompare(b))
        if (ordered.includes("_id")) {
            return ["_id", ...ordered.filter((key) => key !== "_id")]
        }
        return ordered
    }, [records])
    const columnTypes = useMemo(() => {
        const nextTypes: Record<string, string> = {}

        for (const column of columns) {
            const sample = records.find((record) => record[column] !== undefined)?.[column]
            nextTypes[column] = describeValueType(sample)
        }

        return nextTypes
    }, [columns, records])
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

    const rowHeight = 52
    const [listHeight, setListHeight] = useState(320)
    const [scrollbarWidth, setScrollbarWidth] = useState(0)
    const gridTemplateColumns = useMemo(
        () => columns.map((column) => `${columnWidths[column] ?? getDefaultColumnWidth(column, columnTypes[column])}px`).join(" "),
        [columnTypes, columnWidths, columns],
    )
    const listStyle = useMemo<CSSProperties>(() => ({ height: listHeight }), [listHeight])

    const minTableWidth = useMemo(
        () =>
            columns.reduce(
                (totalWidth, column) => totalWidth + (columnWidths[column] ?? getDefaultColumnWidth(column, columnTypes[column])),
                0,
            ),
        [columnTypes, columnWidths, columns],
    )

    useEffect(() => {
        setColumnWidths((current) => {
            const nextWidths: Record<string, number> = {}

            for (const column of columns) {
                nextWidths[column] = current[column] ?? getDefaultColumnWidth(column, columnTypes[column])
            }

            return nextWidths
        })
    }, [columnTypes, columns])

    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) {
            return
        }

        const updateHeight = () => {
            setListHeight(Math.max(rowHeight, viewport.clientHeight))
        }

        updateHeight()

        const observer = new ResizeObserver(updateHeight)
        observer.observe(viewport)

        return () => observer.disconnect()
    }, [rowHeight])

    useEffect(() => {
        const updateScrollbarWidth = () => {
            const element = listRef.current?.element
            if (!element) {
                return
            }

            setScrollbarWidth(element.offsetWidth - element.clientWidth)
        }

        updateScrollbarWidth()

        const element = listRef.current?.element
        if (!element) {
            return
        }

        const observer = new ResizeObserver(updateScrollbarWidth)
        observer.observe(element)

        return () => observer.disconnect()
    }, [listHeight, records.length])

    const startResize = (event: React.PointerEvent<HTMLDivElement>, column: string) => {
        event.preventDefault()
        event.stopPropagation()

        resizeStateRef.current = {
            column,
            startWidth: columnWidths[column] ?? getDefaultColumnWidth(column, columnTypes[column]),
            startX: event.clientX,
        }

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const resizeState = resizeStateRef.current
            if (!resizeState) {
                return
            }

            const nextWidth = Math.max(MIN_COLUMN_WIDTH, resizeState.startWidth + moveEvent.clientX - resizeState.startX)

            setColumnWidths((current) => ({
                ...current,
                [resizeState.column]: nextWidth,
            }))
        }

        const handlePointerUp = () => {
            resizeStateRef.current = null
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerup", handlePointerUp)
        }

        window.addEventListener("pointermove", handlePointerMove)
        window.addEventListener("pointerup", handlePointerUp)
    }

    const inspectedRecord = inspectedCell ? records[inspectedCell.rowIndex] : null
    const inspectedValue = inspectedCell && inspectedRecord ? inspectedRecord[inspectedCell.column] : null
    const inspectedRecordId =
        inspectedCell && inspectedRecord && "_id" in inspectedRecord ? formatCellValue(inspectedRecord._id) : undefined

    return (
        <>
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border">
                <div className="h-full overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full flex-col" style={{ minWidth: minTableWidth }}>
                        <div
                            role="row"
                            className="grid border-b border-border bg-muted/40"
                            style={{ gridTemplateColumns, paddingRight: scrollbarWidth }}
                        >
                            {columns.map((column) => (
                                <div
                                    key={column}
                                    role="columnheader"
                                    className="relative min-w-0 border-r border-border px-2 py-2 last:border-r-0"
                                >
                                    <button
                                        type="button"
                                        className="flex w-[calc(100%-0.5rem)] items-start justify-between gap-2 text-left"
                                        onClick={() => onSortChange?.(column)}
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate text-xs font-semibold tracking-wide text-foreground">{column}</div>
                                            <div className="mt-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                                                {columnTypes[column]}
                                            </div>
                                        </div>
                                        <span className="mt-0.5 shrink-0 text-muted-foreground">
                                            {sortField === column ? (
                                                sortDirection === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                                            ) : (
                                                <ArrowUpDown className="size-3.5 opacity-70" />
                                            )}
                                        </span>
                                    </button>
                                    <div
                                        role="separator"
                                        aria-orientation="vertical"
                                        aria-label={`Resize ${column} column`}
                                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none select-none"
                                        onPointerDown={(event) => startResize(event, column)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div ref={viewportRef} className="min-h-0 flex-1">
                            <List
                                listRef={listRef}
                                rowComponent={RecordRow}
                                rowCount={records.length}
                                rowHeight={rowHeight}
                                rowProps={{
                                    columnWidths,
                                    columns,
                                    gridTemplateColumns,
                                    onInspectCell: (column, rowIndex) => setInspectedCell({ column, rowIndex }),
                                    records,
                                }}
                                overscanCount={8}
                                className="overflow-x-hidden bg-background"
                                style={listStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {inspectedCell && inspectedValue !== null ? (
                <JsonValueInspector
                    fieldName={inspectedCell.column}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) {
                            setInspectedCell(null)
                        }
                    }}
                    recordId={inspectedRecordId}
                    recordValue={inspectedRecord}
                    value={inspectedValue}
                />
            ) : null}
        </>
    )
}
