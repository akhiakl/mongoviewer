import { useMemo } from 'react';

import { useCollectionDocuments } from '@/renderer/components/mongo-viewer/hooks/use-collection-documents';
import { useCollectionInsights } from '@/renderer/components/mongo-viewer/hooks/use-collection-insights';
import { getQueryFieldNames, getQueryFieldSamples } from '@/renderer/components/mongo-viewer/query-field-metadata';
import type { Selection, SortDirection } from '@/renderer/components/mongo-viewer/types';
import { useDebouncedValue } from '@/renderer/hooks/use-debounced-value';

const MAX_AUTOCOMPLETE_RECORDS = 100;

type UseViewerDataOptions = {
    connectionId: string;
    selection: Selection | null;
    page: number;
    pageSize: number;
    quickFilter: string;
    appliedMongoQuery: string;
    sortDirection: SortDirection;
    sortField: string | null;
};

export function useViewerData({
    connectionId,
    selection,
    page,
    pageSize,
    quickFilter,
    appliedMongoQuery,
    sortDirection,
    sortField,
}: UseViewerDataOptions) {
    const { records, total, loadingDocs, docsError } = useCollectionDocuments({
        connectionId,
        selection,
        page,
        pageSize,
        mongoQuery: appliedMongoQuery || undefined,
        sortDirection,
        sortField,
    });
    const { indexes, insightsError, loadingInsights, schemaSummary, stats } =
        useCollectionInsights(connectionId, selection);

    const debouncedQuickFilter = useDebouncedValue(quickFilter, 220);

    const filteredRecords = useMemo(() => {
        const normalizedFilter = debouncedQuickFilter.trim().toLowerCase();
        if (!normalizedFilter) {
            return records;
        }

        return records.filter((record) =>
            JSON.stringify(record).toLowerCase().includes(normalizedFilter),
        );
    }, [debouncedQuickFilter, records]);

    const queryFieldNames = useMemo(
        () => getQueryFieldNames(records, MAX_AUTOCOMPLETE_RECORDS),
        [records],
    );
    const queryFieldSamples = useMemo(
        () => getQueryFieldSamples(records, MAX_AUTOCOMPLETE_RECORDS),
        [records],
    );

    return {
        records,
        filteredRecords,
        total,
        loadingDocs,
        docsError,
        indexes,
        insightsError,
        loadingInsights,
        schemaSummary,
        stats,
        queryFieldNames,
        queryFieldSamples,
    };
}
