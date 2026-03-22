import { Copy } from "lucide-react"

import type { CollectionIndexSummary, CollectionSchemaSummary, CollectionStats } from "@/renderer/components/mongo-viewer/types"
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card"
import { Skeleton } from "@/renderer/components/ui/skeleton"

type CollectionInsightsPanelProps = {
    indexes: CollectionIndexSummary[]
    loadingInsights: boolean
    schemaSummary: CollectionSchemaSummary | null
    stats: CollectionStats | null
}

function formatBytes(value: number | null) {
    if (value === null) {
        return "Unavailable"
    }

    if (value < 1024) {
        return `${value.toFixed(0)} B`
    }

    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`
    }

    return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function copyIndex(index: CollectionIndexSummary) {
    void navigator.clipboard?.writeText(JSON.stringify(index, null, 2))
}

export function CollectionInsightsPanel({
    indexes,
    loadingInsights,
    schemaSummary,
    stats,
}: CollectionInsightsPanelProps) {
    const topFields = schemaSummary?.fields.slice(0, 6) ?? []

    return (
        <div className="mb-4 grid shrink-0 gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]">
            <Card size="sm">
                <CardHeader>
                    <CardTitle>Collection Stats</CardTitle>
                    <CardDescription>Quick storage and index signals for this collection.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                    {loadingInsights ? (
                        Array.from({ length: 5 }, (_, index) => (
                            <InsightRowSkeleton key={index} />
                        ))
                    ) : (
                        <>
                            <InsightRow
                                label="Documents"
                                value={stats ? stats.documentCount.toLocaleString() : "Unavailable"}
                            />
                            <InsightRow
                                label="Average size"
                                value={stats ? formatBytes(stats.avgDocumentSize) : "Unavailable"}
                            />
                            <InsightRow
                                label="Storage size"
                                value={stats ? formatBytes(stats.storageSize) : "Unavailable"}
                            />
                            <InsightRow
                                label="Index storage"
                                value={stats ? formatBytes(stats.totalIndexSize) : "Unavailable"}
                            />
                            <InsightRow
                                label="Indexes"
                                value={stats ? String(stats.totalIndexes) : "Unavailable"}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            <Card size="sm">
                <CardHeader>
                    <CardTitle>Schema Summary</CardTitle>
                    <CardDescription>
                        Based on a sample of {schemaSummary?.sampleSize ?? 0} documents from the selected collection.
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-h-72 space-y-2 overflow-auto pr-1">
                    {loadingInsights ? (
                        Array.from({ length: 3 }, (_, index) => (
                            <InsightCardSkeleton key={index} />
                        ))
                    ) : topFields.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No schema sample available.</p>
                    ) : (
                        topFields.map((field) => (
                            <div key={field.path} className="rounded-md border border-border/60 p-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-foreground">{field.path}</p>
                                    <Badge variant="outline">{Math.round(field.presenceRate * 100)}% seen</Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Types: {field.types.join(", ")}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Examples: {field.exampleValues.join(" | ")}
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card size="sm">
                <CardHeader>
                    <CardTitle>Indexes</CardTitle>
                    <CardDescription>Field order, uniqueness, sparse rules, and TTL at a glance.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-72 space-y-2 overflow-auto pr-1">
                    {loadingInsights ? (
                        Array.from({ length: 3 }, (_, index) => (
                            <InsightCardSkeleton key={index} compact />
                        ))
                    ) : indexes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No indexes reported.</p>
                    ) : (
                        indexes.map((index) => (
                            <div key={index.name} className="rounded-md border border-border/60 p-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{index.name}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{index.fields.join(", ")}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label={`Copy ${index.name} index definition`}
                                        onClick={() => copyIndex(index)}
                                    >
                                        <Copy className="size-3" />
                                    </Button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {index.unique ? <Badge variant="secondary">unique</Badge> : null}
                                    {index.sparse ? <Badge variant="outline">sparse</Badge> : null}
                                    {index.partial ? <Badge variant="outline">partial</Badge> : null}
                                    {index.ttlSeconds !== null ? <Badge variant="outline">ttl {index.ttlSeconds}s</Badge> : null}
                                    {!index.unique && !index.sparse && !index.partial && index.ttlSeconds === null ? (
                                        <Badge variant="outline">standard</Badge>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function InsightRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    )
}

function InsightRowSkeleton() {
    return (
        <div data-testid="insight-row-skeleton" className="rounded-md border border-border/60 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    )
}

function InsightCardSkeleton({ compact = false }: { compact?: boolean }) {
    return (
        <div data-testid="insight-card-skeleton" className="rounded-md border border-border/60 p-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-2 h-3 w-full" />
            {!compact ? <Skeleton className="mt-2 h-3 w-3/4" /> : null}
        </div>
    )
}
