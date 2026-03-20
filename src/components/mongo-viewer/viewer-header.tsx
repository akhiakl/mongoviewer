import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QueryEditor } from "@/components/mongo-viewer/query-editor"
import type { QueryPreset } from "@/components/mongo-viewer/query-presets"
import type { Selection } from "@/components/mongo-viewer/types"

type ViewerHeaderProps = {
    activeConnectionName: string | null
    appliedMongoQuery: string
    filteredRecordsCount: number
    loadingDocs: boolean
    onApplyQuery: () => void
    onDeletePreset: () => void
    onPresetNameChange: (value: string) => void
    onPresetSelect: (value: string) => void
    onQueryDraftChange: (value: string) => void
    onQuickFilterChange: (value: string) => void
    onResetQuery: () => void
    onSavePreset: () => void
    presetName: string
    presets: QueryPreset[]
    queryDraft: string
    quickFilter: string
    selection: Selection | null
}

export function ViewerHeader({
    activeConnectionName,
    appliedMongoQuery,
    filteredRecordsCount,
    loadingDocs,
    onApplyQuery,
    onDeletePreset,
    onPresetNameChange,
    onPresetSelect,
    onQueryDraftChange,
    onQuickFilterChange,
    onResetQuery,
    onSavePreset,
    presetName,
    presets,
    queryDraft,
    quickFilter,
    selection,
}: ViewerHeaderProps) {
    return (
        <div className="border-b border-border px-4 py-4 md:px-6">
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Collection</p>
                <h1 className="text-lg font-semibold text-foreground md:text-xl">
                    {selection ? `${selection.db} > ${selection.collection}` : "Pick a collection"}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        {activeConnectionName ? `Active connection: ${activeConnectionName}` : "Select a saved connection to start browsing."}
                    </span>
                    {quickFilter ? <Badge variant="outline">{filteredRecordsCount.toLocaleString()} shown</Badge> : null}
                    {appliedMongoQuery ? <Badge variant="outline">query active</Badge> : null}
                </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Quick Filter
                    </label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                        <Input
                            value={quickFilter}
                            onChange={(event) => onQuickFilterChange(event.target.value)}
                            placeholder="Filter records already loaded on this page"
                            className="pl-8"
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Filters only the records currently visible on this page. Use Mongo Query below to filter the full collection in the database.
                    </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Mongo Query
                            </label>
                            <QueryEditor
                                value={queryDraft}
                                onChange={onQueryDraftChange}
                                onApplyQuery={onApplyQuery}
                                disabled={loadingDocs || !selection}
                                placeholder='Mongo query JSON, e.g. { "status": "active" }'
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Auto-closes quotes and braces. Use <kbd className="rounded border border-border px-1 py-0.5 text-[11px]">Ctrl</kbd> + <kbd className="rounded border border-border px-1 py-0.5 text-[11px]">Enter</kbd> to run.
                            </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Preset Name
                                </label>
                                <Input
                                    value={presetName}
                                    onChange={(event) => onPresetNameChange(event.target.value)}
                                    placeholder="e.g. Active users"
                                />
                            </div>
                            <div>
                                <label htmlFor="saved-query-preset" className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Saved Presets
                                </label>
                                <select
                                    id="saved-query-preset"
                                    aria-label="Saved presets"
                                    value={presetName && presets.some((preset) => preset.name === presetName) ? presetName : ''}
                                    onChange={(event) => onPresetSelect(event.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none"
                                >
                                    <option value="">Select saved preset</option>
                                    {presets.map((preset) => (
                                        <option key={preset.name} value={preset.name}>
                                            {preset.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="outline" onClick={onApplyQuery} disabled={!selection || loadingDocs}>
                                Apply Query
                            </Button>
                            <Button size="sm" variant="outline" onClick={onSavePreset} disabled={!presetName.trim() || !queryDraft.trim()}>
                                Save Preset
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onResetQuery} disabled={!queryDraft && !appliedMongoQuery}>
                                Reset Query
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onDeletePreset}
                                disabled={!presetName.trim() || !presets.some((preset) => preset.name === presetName.trim())}
                            >
                                Delete Preset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
