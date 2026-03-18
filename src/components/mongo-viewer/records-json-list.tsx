import { formatEjsonScalar, getRecordId, isObjectLike } from "@/lib/document-format"

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-slate-500">[]</span>
        }
        return (
            <details open={depth < 1} className="pl-4">
                <summary className="cursor-pointer text-slate-600">[{value.length}]</summary>
                <div className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {value.map((item, index) => (
                        <div key={`${depth}-arr-${index}`} className="text-xs leading-5">
                            <span className="mr-2 text-slate-400">{index}:</span>
                            <JsonNode value={item} depth={depth + 1} />
                        </div>
                    ))}
                </div>
            </details>
        )
    }

    if (isObjectLike(value)) {
        const scalar = formatEjsonScalar(value)
        if (scalar !== null) {
            return <span className="text-sky-700">{scalar}</span>
        }

        const entries = Object.entries(value)

        if (entries.length === 0) {
            return <span className="text-slate-500">{"{}"}</span>
        }

        return (
            <details open={depth < 1} className="pl-4">
                <summary className="cursor-pointer text-slate-600">{"{"} {entries.length} keys {"}"}</summary>
                <div className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {entries.map(([key, nestedValue]) => (
                        <div key={`${depth}-obj-${key}`} className="text-xs leading-5">
                            <span className="mr-2 text-sky-700">{key}:</span>
                            <JsonNode value={nestedValue} depth={depth + 1} />
                        </div>
                    ))}
                </div>
            </details>
        )
    }

    if (typeof value === "string") {
        return <span className="text-emerald-700">&quot;{value}&quot;</span>
    }

    if (typeof value === "number") {
        return <span className="text-blue-700">{String(value)}</span>
    }

    if (typeof value === "boolean") {
        return <span className="text-purple-700">{String(value)}</span>
    }

    if (value === null) {
        return <span className="text-rose-700">null</span>
    }

    return <span className="text-slate-700">{String(value)}</span>
}

type RecordsJsonListProps = {
    records: Record<string, unknown>[]
}

export function RecordsJsonList({ records }: RecordsJsonListProps) {
    return (
        <div className="space-y-2">
            {records.map((record, index) => {
                const idValue = getRecordId(record, index)

                return (
                    <details key={idValue} open={index < 3} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <summary className="cursor-pointer border-b border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                            {idValue}
                        </summary>
                        <div className="px-3 py-2">
                            <JsonNode value={record} />
                        </div>
                    </details>
                )
            })}
        </div>
    )
}
