import { useEffect, useState } from 'react';

import type { DocumentsResponse, Selection, SortDirection } from '@/renderer/components/mongo-viewer/types';
import { mongoViewer } from '@/renderer/renderer-api';

type UseCollectionDocumentsArgs = {
  connectionId: string;
  selection: Selection | null;
  page: number;
  pageSize: number;
  mongoQuery?: string;
  sortField?: string | null;
  sortDirection: SortDirection;
};

export function useCollectionDocuments({
  connectionId,
  selection,
  page,
  pageSize,
  mongoQuery,
  sortField,
  sortDirection,
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
        const result = await mongoViewer.listDocuments({
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
  }, [connectionId, mongoQuery, page, pageSize, selection, sortDirection, sortField]);

  return {
    records: response?.records ?? [],
    total: response?.total ?? 0,
    currentPage: response?.page ?? page,
    loadingDocs,
    docsError,
  };
}
