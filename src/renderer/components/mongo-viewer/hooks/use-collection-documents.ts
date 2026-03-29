import { useEffect, useState } from 'react';

import type { DocumentsResponse, Selection, SortDirection } from '@/renderer/components/mongo-viewer/types';
import { mongoViewerService } from '@/renderer/services/mongo-viewer-service';

type UseCollectionDocumentsArgs = {
  connectionId: string;
  selection: Selection | null;
  page: number;
  pageSize: number;
  mongoQuery?: string;
  sortField?: string | null;
  sortDirection: SortDirection;
  refreshKey?: number;
};

export function useCollectionDocuments({
  connectionId,
  selection,
  page,
  pageSize,
  mongoQuery,
  sortField,
  sortDirection,
  refreshKey = 0,
}: UseCollectionDocumentsArgs) {
  const [response, setResponse] = useState<DocumentsResponse | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selection) {
      setResponse(null);
      setDocsError(null);
      setLoadingDocs(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoadingDocs(true);
      setDocsError(null);

      try {
        const result = await mongoViewerService.listDocuments({
          connectionId,
          db: selection.db,
          collection: selection.collection,
          page,
          pageSize,
          mongoQuery,
          sortField: sortField ?? undefined,
          sortDirection,
        });

        if (!cancelled) {
          setResponse(result);
        }
      } catch (error) {
        if (!cancelled) {
          setResponse(null);
          setDocsError(error instanceof Error ? error.message : 'Unable to load documents.');
        }
      } finally {
        if (!cancelled) {
          setLoadingDocs(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [connectionId, mongoQuery, page, pageSize, refreshKey, selection, sortDirection, sortField]);

  return {
    records: response?.records ?? [],
    total: response?.total ?? 0,
    currentPage: response?.page ?? page,
    loadingDocs,
    docsError,
  };
}
