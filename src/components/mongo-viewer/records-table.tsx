import { useMemo } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCellValue } from "@/lib/document-format"

type RecordsTableProps = {
    records: Record<string, unknown>[]
}

export function RecordsTable({ records }: RecordsTableProps) {
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

    return (
        <Table className="min-w-180 border-collapse">
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead
                            key={column}
                            className="sticky top-0 border-b border-border bg-background/95 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                            {column}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record, rowIndex) => (
                    <TableRow key={String(record._id ?? rowIndex)} className="align-top">
                        {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column}`} className="max-w-85 text-xs text-foreground">
                                <div className="line-clamp-3 break-all">{formatCellValue(record[column])}</div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
