import { useEffect, useMemo, useState } from 'react';

import { SidebarProvider } from '@/renderer/components/ui/sidebar';
import { DatabasesSidebar } from '@/renderer/components/mongo-viewer/databases-sidebar';
import { useDatabasesTree } from '@/renderer/components/mongo-viewer/hooks/use-databases-tree';
import { resetCollectionInsightsCache } from '@/renderer/components/mongo-viewer/hooks/use-collection-insights';
import { useQueryPresets } from '@/renderer/components/mongo-viewer/hooks/use-query-presets';
import { QueryHistoryPanel } from '@/renderer/components/mongo-viewer/query-history-panel';
import { ViewerErrorAlert } from '@/renderer/components/mongo-viewer/viewer-error-alert';
import { useViewerData } from '@/renderer/components/mongo-viewer/hooks/use-viewer-data';
import { useViewerPreferences } from '@/renderer/components/mongo-viewer/hooks/use-viewer-preferences';
import { useViewerQueryState } from '@/renderer/components/mongo-viewer/hooks/use-viewer-query-state';
import { useViewerSelectionState } from '@/renderer/components/mongo-viewer/hooks/use-viewer-selection-state';
import { ViewerContent } from '@/renderer/components/mongo-viewer/viewer-content';
import { ViewerFooter } from '@/renderer/components/mongo-viewer/viewer-footer';
import { ViewerHeader } from '@/renderer/components/mongo-viewer/viewer-header';
import { ViewerNavigation } from '@/renderer/components/mongo-viewer/viewer-navigation';
import {
    selectConnectionStatus,
    useConnectionSessionStore,
} from '@/renderer/features/connections/store/connection-session-store';
import { getMongoErrorGuidance } from '@/renderer/features/viewer/mongo-error-guidance';
import {
    selectConnectionQueryHistory,
    useQueryHistoryStore,
} from '@/renderer/features/viewer/store/query-history-store';
import { validateMongoQuery } from '@/lib/query-validation';

type MongoViewerClientProps = {
    connectionId: string;
    activeConnectionName: string | null;
    onBack?: () => void;
};

export function MongoViewerClient({
    connectionId,
    activeConnectionName,
    onBack,
}: MongoViewerClientProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const viewerPreferences = useViewerPreferences(connectionId);
    const connectionStatus = useConnectionSessionStore(selectConnectionStatus(connectionId));
    const markConnectionOpened = useConnectionSessionStore((state) => state.markOpened);
    const markConnectionConnecting = useConnectionSessionStore((state) => state.markConnecting);
    const markConnectionHealthy = useConnectionSessionStore((state) => state.markHealthy);
    const markConnectionError = useConnectionSessionStore((state) => state.markError);
    const addQueryHistoryEntry = useQueryHistoryStore((state) => state.addEntry);
    const removeQueryHistoryEntry = useQueryHistoryStore((state) => state.removeEntry);
    const clearQueryHistoryEntries = useQueryHistoryStore((state) => state.clearEntries);
    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(connectionId, refreshKey);
    const { selection, setSelection } = useViewerSelectionState({
        connectionId,
        initialSelection: viewerPreferences.lastSelection,
        tree,
        onSelectionPersist: viewerPreferences.setLastSelection,
    });
    const queryState = useViewerQueryState(selection);
    const viewerData = useViewerData({
        connectionId,
        selection,
        page: queryState.page,
        pageSize: viewerPreferences.pageSize,
        quickFilter: queryState.quickFilter,
        appliedMongoQuery: queryState.appliedMongoQuery,
        sortDirection: queryState.sortDirection,
        sortField: queryState.sortField,
        refreshKey,
    });
    const { presets, deletePreset, getPresetByName, savePreset } = useQueryPresets(selection);

    const queryValidationError = useMemo(
        () => validateMongoQuery(queryState.queryDraft),
        [queryState.queryDraft],
    );
    const totalPages = Math.max(1, Math.ceil(viewerData.total / viewerPreferences.pageSize));
    const error = viewerData.docsError ?? treeError ?? viewerData.insightsError;
    const errorGuidance = getMongoErrorGuidance(error, 'Unable to load the current MongoDB session.');
    const hasQuickFilter = queryState.quickFilter.trim().length > 0;
    const hasActiveMongoQuery = queryState.appliedMongoQuery.trim().length > 0;
    const connectionQueryHistory = useQueryHistoryStore(
        useMemo(() => selectConnectionQueryHistory(connectionId), [connectionId]),
    );
    const queryHistoryEntriesForSelection = useMemo(
        () =>
            selection
                ? connectionQueryHistory.filter(
                      (entry) =>
                          entry.db === selection.db && entry.collection === selection.collection,
                  )
                : [],
        [connectionQueryHistory, selection],
    );
    const noResultsMessage = useMemo(() => {
        if (viewerData.records.length === 0 && hasActiveMongoQuery) {
            return 'No records match the current Mongo query.';
        }

        if (viewerData.records.length === 0) {
            return 'No records for this collection.';
        }

        return 'No records match the current quick filter.';
    }, [hasActiveMongoQuery, viewerData.records.length]);

    const handleApplyQuery = () => {
        if (queryValidationError) {
            return;
        }

        const trimmedQuery = queryState.queryDraft.trim();
        queryState.setAppliedMongoQuery(trimmedQuery);
        queryState.setPage(1);

        if (selection && trimmedQuery) {
            addQueryHistoryEntry({
                connectionId,
                db: selection.db,
                collection: selection.collection,
                query: trimmedQuery,
                resultCount: viewerData.filteredRecords.length,
            });
        }
    };

    const handleResetQuery = () => {
        queryState.setQueryDraft('');
        queryState.setAppliedMongoQuery('');
        queryState.setPresetName('');
        queryState.setPage(1);
    };

    const handleSavePreset = () => {
        if (savePreset(queryState.presetName, queryState.queryDraft)) {
            queryState.setPresetName(queryState.presetName.trim());
        }
    };

    const handleDeletePreset = () => {
        if (deletePreset(queryState.presetName)) {
            queryState.setPresetName('');
        }
    };

    const handlePresetSelect = (name: string) => {
        queryState.setPresetName(name);

        const preset = getPresetByName(name);
        if (preset) {
            queryState.setQueryDraft(preset.query);
        }
    };

    const handleReconnect = () => {
        markConnectionConnecting(connectionId);
        resetCollectionInsightsCache();
        setRefreshKey((current) => current + 1);
        void refreshTree();
    };

    useEffect(() => {
        markConnectionOpened(connectionId);
    }, [connectionId, markConnectionOpened]);

    useEffect(() => {
        if (loadingTree || viewerData.loadingDocs || viewerData.loadingInsights) {
            markConnectionConnecting(connectionId);
            return;
        }

        if (error) {
            markConnectionError(connectionId, error);
            return;
        }

        if (tree.length > 0 || selection) {
            markConnectionHealthy(connectionId);
        }
    }, [
        connectionId,
        error,
        loadingTree,
        markConnectionConnecting,
        markConnectionError,
        markConnectionHealthy,
        selection,
        tree.length,
        viewerData.loadingDocs,
        viewerData.loadingInsights,
    ]);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {onBack ? (
                <ViewerNavigation
                    activeConnectionName={activeConnectionName}
                    onBack={onBack}
                />
            ) : null}
            <SidebarProvider
                className="flex min-h-0 flex-1"
            >
                <DatabasesSidebar
                    tree={tree}
                    loadingTree={loadingTree}
                    treeError={treeError}
                    selection={selection}
                    onRefresh={() => void refreshTree()}
                    onSelectCollection={(nextSelection) => {
                        setSelection(nextSelection);
                        queryState.setPage(1);
                    }}
                />
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ViewerHeader
                        activeConnectionName={activeConnectionName}
                        connectionStatus={connectionStatus}
                        appliedMongoQuery={queryState.appliedMongoQuery}
                        filteredRecordsCount={viewerData.filteredRecords.length}
                        indexes={viewerData.indexes}
                        loadingInsights={viewerData.loadingInsights}
                        loadingDocs={viewerData.loadingDocs}
                        onApplyQuery={handleApplyQuery}
                        onDeletePreset={handleDeletePreset}
                        onPresetNameChange={queryState.setPresetName}
                        onPresetSelect={handlePresetSelect}
                        onQueryDraftChange={queryState.setQueryDraft}
                        onQuickFilterChange={queryState.setQuickFilter}
                        onResetQuery={handleResetQuery}
                        onSavePreset={handleSavePreset}
                        presetName={queryState.presetName}
                        presets={presets}
                        queryFieldNames={viewerData.queryFieldNames}
                        queryFieldSamples={viewerData.queryFieldSamples}
                        queryDraft={queryState.queryDraft}
                        queryValidationError={queryValidationError}
                        quickFilter={queryState.quickFilter}
                        onReconnect={handleReconnect}
                        schemaSummary={viewerData.schemaSummary}
                        selection={selection}
                        showInsights={viewerPreferences.showInsights}
                        onShowInsightsChange={viewerPreferences.setShowInsights}
                        stats={viewerData.stats}
                    />

                    {viewerPreferences.queryHistoryOpen ? (
                        <QueryHistoryPanel
                            entries={queryHistoryEntriesForSelection}
                            loading={false}
                            selection={selection}
                            onApplyEntry={(entry) => {
                                queryState.setPresetName('');
                                queryState.setQueryDraft(entry.query);
                                queryState.setAppliedMongoQuery(entry.query);
                                queryState.setPage(1);
                            }}
                            onRestoreEntry={(entry) => {
                                queryState.setPresetName('');
                                queryState.setQueryDraft(entry.query);
                            }}
                            onRemoveEntry={(entryId) => {
                                removeQueryHistoryEntry(connectionId, entryId);
                            }}
                            onClearEntries={() => {
                                if (selection) {
                                    clearQueryHistoryEntries(connectionId, selection);
                                }
                            }}
                        />
                    ) : null}

                    {error ? (
                        <ViewerErrorAlert
                            title={errorGuidance.title}
                            detail={errorGuidance.detail}
                            hint={errorGuidance.hint}
                            hasActiveMongoQuery={hasActiveMongoQuery}
                            onReconnect={handleReconnect}
                            onResetQuery={handleResetQuery}
                        />
                    ) : null}

                    <ViewerContent
                        hasActiveMongoQuery={hasActiveMongoQuery}
                        hasQuickFilter={hasQuickFilter}
                        filteredRecords={viewerData.filteredRecords}
                        loadingDocs={viewerData.loadingDocs}
                        noResultsMessage={noResultsMessage}
                        onClearQuickFilter={() => queryState.setQuickFilter('')}
                        onResetQuery={handleResetQuery}
                        onSortDirectionChange={(direction) => {
                            queryState.setSortDirection(direction);
                            queryState.setPage(1);
                        }}
                        onSortFieldChange={(field) => {
                            queryState.setSortField(field);
                            queryState.setPage(1);
                        }}
                        onViewModeChange={viewerPreferences.setViewMode}
                        queryFieldNames={viewerData.queryFieldNames}
                        selection={selection}
                        sortDirection={queryState.sortDirection}
                        sortField={queryState.sortField}
                        viewMode={viewerPreferences.viewMode}
                    />
                    <ViewerFooter
                        loadingDocs={viewerData.loadingDocs}
                        onPageChange={queryState.setPage}
                        onPageSizeChange={(nextPageSize) => {
                            viewerPreferences.setPageSize(nextPageSize);
                            queryState.setPage(1);
                        }}
                        page={queryState.page}
                        pageSize={viewerPreferences.pageSize}
                        selection={selection}
                        total={viewerData.total}
                        totalPages={totalPages}
                    />
                </div>
            </SidebarProvider>
        </section>
    );
}
