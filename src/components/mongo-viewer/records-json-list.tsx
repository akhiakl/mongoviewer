import { ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatEjsonScalar, getRecordId, isObjectLike } from "@/lib/document-format"

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-muted-foreground">[]</span>
        }
        return (
            <Collapsible defaultOpen={depth < 1} className="pl-4">
                <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1 text-muted-foreground">
                    <ChevronRight className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
                    [{value.length}]
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 border-l border-border pl-3">
                    {value.map((item, index) => (
                        <div key={`${depth}-arr-${index}`} className="text-xs leading-5">
                            <span className="mr-2 text-muted-foreground">{index}:</span>
                            <JsonNode value={item} depth={depth + 1} />
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        )
    }

    if (isObjectLike(value)) {
        const scalar = formatEjsonScalar(value)
        if (scalar !== null) {
            return <span className="text-sky-700">{scalar}</span>
        }

        const entries = Object.entries(value)

        if (entries.length === 0) {
            return <span className="text-muted-foreground">{"{}"}</span>
        }

        return (
            <Collapsible defaultOpen={depth < 1} className="pl-4">
                <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1 text-muted-foreground">
                    <ChevronRight className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
                    {"{"} {entries.length} keys {"}"}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 border-l border-border pl-3">
                    {entries.map(([key, nestedValue]) => (
                        <div key={`${depth}-obj-${key}`} className="text-xs leading-5">
                            <span className="mr-2 text-sky-700">{key}:</span>
                            <JsonNode value={nestedValue} depth={depth + 1} />
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
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

    return <span className="text-foreground">{String(value)}</span>
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
                    <Collapsible key={idValue} defaultOpen={index < 3} className="overflow-hidden">
                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b border-border px-3 py-2">
                                <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left text-sm font-medium text-foreground">
                                    <ChevronRight className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                                    <CardTitle className="text-sm font-medium">{idValue}</CardTitle>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="px-3 py-2">
                                    <JsonNode value={record} />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )
            })}
        </div>
    )
}
