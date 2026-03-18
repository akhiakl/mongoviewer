import { useMemo } from "react"

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
        <table className="w-full min-w-180 border-collapse">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            key={column}
                            className="sticky top-0 border-b border-slate-200 bg-white/95 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {records.map((record, rowIndex) => (
                    <tr key={String(record._id ?? rowIndex)} className="border-b border-slate-100 align-top">
                        {columns.map((column) => (
                            <td key={`${rowIndex}-${column}`} className="max-w-85 px-2 py-2 text-xs text-slate-700">
                                <div className="line-clamp-3 break-all">{formatCellValue(record[column])}</div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
