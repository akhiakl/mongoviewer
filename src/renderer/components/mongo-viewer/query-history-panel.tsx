import { History, Play, RotateCcw, Trash2 } from 'lucide-react';

import { Badge } from '@/renderer/components/ui/badge';
import { Button } from '@/renderer/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/renderer/components/ui/empty';
import { Separator } from '@/renderer/components/ui/separator';
import type { QueryHistoryEntry } from '@/renderer/features/viewer/store/query-history-store';
import type { Selection } from '@/renderer/components/mongo-viewer/types';

type QueryHistoryPanelProps = {
    entries: QueryHistoryEntry[];
    loading: boolean;
    selection: Selection | null;
    onApplyEntry: (entry: QueryHistoryEntry) => void;
    onRestoreEntry: (entry: QueryHistoryEntry) => void;
    onRemoveEntry: (entryId: string) => void;
    onClearEntries: () => void;
};

function formatExecutedAt(executedAt: string) {
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(executedAt));
}

export function QueryHistoryPanel({
    entries,
    loading,
    selection,
    onApplyEntry,
    onRestoreEntry,
    onRemoveEntry,
    onClearEntries,
}: QueryHistoryPanelProps) {
    if (!selection) {
        return null;
    }

    return (
        <div className="border-b border-border bg-muted/20 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Query History
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Reuse recent Mongo queries for {selection.db}.{selection.collection}.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearEntries}
                    disabled={entries.length === 0}
                >
                    <RotateCcw className="size-3.5" />
                    Clear History
                </Button>
            </div>

            {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading query history...</p>
            ) : null}

            {!loading && entries.length === 0 ? (
                <Empty className="mt-4 border border-dashed border-border/70 bg-background/50">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <History />
                        </EmptyMedia>
                        <EmptyTitle>No query history yet</EmptyTitle>
                        <EmptyDescription>
                            Applied Mongo queries for this collection will appear here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : null}

            {!loading && entries.length > 0 ? (
                <div className="mt-4 rounded-lg border border-border/70 bg-background">
                    {entries.map((entry, index) => (
                        <div key={`${entry.id}:${entry.executedAt}`}>
                            <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {entry.resultCount.toLocaleString()} result
                                            {entry.resultCount === 1 ? '' : 's'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatExecutedAt(entry.executedAt)}
                                        </span>
                                    </div>
                                    <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                                        {entry.query}
                                    </code>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRestoreEntry(entry)}
                                    >
                                        Restore
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onApplyEntry(entry)}
                                    >
                                        <Play className="size-3.5" />
                                        Run Again
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveEntry(entry.id)}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                            {index < entries.length - 1 ? <Separator /> : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
