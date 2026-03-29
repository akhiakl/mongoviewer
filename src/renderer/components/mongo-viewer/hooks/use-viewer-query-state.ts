import { useEffect, useState } from 'react';

import type { Selection, SortDirection } from '@/renderer/components/mongo-viewer/types';

export function useViewerQueryState(selection: Selection | null) {
    const [page, setPage] = useState(1);
    const [quickFilter, setQuickFilter] = useState('');
    const [queryDraft, setQueryDraft] = useState('');
    const [appliedMongoQuery, setAppliedMongoQuery] = useState('');
    const [presetName, setPresetName] = useState('');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    useEffect(() => {
        setQuickFilter('');
        setQueryDraft('');
        setAppliedMongoQuery('');
        setPresetName('');
        setSortField(null);
        setSortDirection('asc');
        setPage(1);
    }, [selection?.collection, selection?.db]);

    return {
        page,
        quickFilter,
        queryDraft,
        appliedMongoQuery,
        presetName,
        sortField,
        sortDirection,
        setPage,
        setQuickFilter,
        setQueryDraft,
        setAppliedMongoQuery,
        setPresetName,
        setSortField,
        setSortDirection,
    };
}
