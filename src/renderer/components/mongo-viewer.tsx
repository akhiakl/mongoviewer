import { useMemo } from 'react';

import { Alert, AlertDescription } from '@/renderer/components/ui/alert';
import { SidebarProvider } from '@/renderer/components/ui/sidebar';
import { DatabasesSidebar } from '@/renderer/components/mongo-viewer/databases-sidebar';
import { useDatabasesTree } from '@/renderer/components/mongo-viewer/hooks/use-databases-tree';
import { useQueryPresets } from '@/renderer/components/mongo-viewer/hooks/use-query-presets';
import { useViewerData } from '@/renderer/components/mongo-viewer/hooks/use-viewer-data';
import { useViewerPreferences } from '@/renderer/components/mongo-viewer/hooks/use-viewer-preferences';
import { useViewerQueryState } from '@/renderer/components/mongo-viewer/hooks/use-viewer-query-state';
import { useViewerSelectionState } from '@/renderer/components/mongo-viewer/hooks/use-viewer-selection-state';
import { ViewerContent } from '@/renderer/components/mongo-viewer/viewer-content';
import { ViewerFooter } from '@/renderer/components/mongo-viewer/viewer-footer';
import { ViewerHeader } from '@/renderer/components/mongo-viewer/viewer-header';
import { ViewerNavigation } from '@/renderer/components/mongo-viewer/viewer-navigation';
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
    const viewerPreferences = useViewerPreferences(connectionId);
    const { tree, loadingTree, treeError, refreshTree } = useDatabasesTree(connectionId);
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
    });
    const { presets, deletePreset, getPresetByName, savePreset } = useQueryPresets(selection);

    const queryValidationError = useMemo(
        () => validateMongoQuery(queryState.queryDraft),
        [queryState.queryDraft],
    );
    const totalPages = Math.max(1, Math.ceil(viewerData.total / viewerPreferences.pageSize));
    const error = viewerData.docsError ?? treeError ?? viewerData.insightsError;
    const hasQuickFilter = queryState.quickFilter.trim().length > 0;
    const hasActiveMongoQuery = queryState.appliedMongoQuery.trim().length > 0;
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

        queryState.setAppliedMongoQuery(queryState.queryDraft.trim());
        queryState.setPage(1);
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

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {onBack ? (
                <ViewerNavigation
                    activeConnectionName={activeConnectionName}
                    onBack={onBack}
                />
            ) : null}
            <SidebarProvider
                open={viewerPreferences.sidebarOpen}
                onOpenChange={viewerPreferences.setSidebarOpen}
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
                        schemaSummary={viewerData.schemaSummary}
                        selection={selection}
                        showInsights={viewerPreferences.showInsights}
                        onShowInsightsChange={viewerPreferences.setShowInsights}
                        stats={viewerData.stats}
                    />

                    {error ? (
                        <div className="px-4 md:px-6">
                            <Alert variant="destructive" className="mt-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
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
