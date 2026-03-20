import { ChevronRight, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { formatEjsonScalar, getRecordId, isObjectLike } from "@/lib/document-format"

export function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {
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

type JsonValueInspectorProps = {
    fieldName: string
    onOpenChange: (open: boolean) => void
    open: boolean
    recordId?: string
    value: unknown
}

export function JsonValueInspector({ fieldName, onOpenChange, open, recordId, value }: JsonValueInspectorProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="border-b border-border pb-4 pr-16">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <DialogTitle className="truncate">Inspect {fieldName}</DialogTitle>
                            <DialogDescription>
                                {recordId ? `Record ${recordId}` : "Expanded structured value"}
                            </DialogDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void navigator.clipboard?.writeText(JSON.stringify(value, null, 2))}
                        >
                            <Copy className="size-4" />
                            Copy JSON
                        </Button>
                    </div>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto p-5">
                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b border-border px-4 py-3">
                            <CardTitle className="text-sm font-medium">{fieldName}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-4">
                            <JsonNode value={value} />
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
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
