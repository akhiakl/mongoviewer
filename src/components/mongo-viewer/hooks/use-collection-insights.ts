import { useEffect, useState } from 'react';

import type { CollectionIndexSummary, CollectionSchemaSummary, CollectionStats, Selection } from '@/components/mongo-viewer/types';
import { mongoViewer } from '@/lib/renderer-api';

type CollectionInsights = {
  indexes: CollectionIndexSummary[];
  schemaSummary: CollectionSchemaSummary | null;
  stats: CollectionStats | null;
};

export function useCollectionInsights(activeConnectionId: string | null, selection: Selection | null) {
  const [insights, setInsights] = useState<CollectionInsights>({
    indexes: [],
    schemaSummary: null,
    stats: null,
  });
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeConnectionId || !selection) {
      setInsights({ indexes: [], schemaSummary: null, stats: null });
      setLoadingInsights(false);
      setInsightsError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoadingInsights(true);
      setInsightsError(null);

      try {
        const [stats, indexes, schemaSummary] = await Promise.all([
          mongoViewer.getCollectionStats(selection),
          mongoViewer.getCollectionIndexes(selection),
          mongoViewer.getCollectionSchemaSummary(selection),
        ]);

        if (!cancelled) {
          setInsights({ indexes, schemaSummary, stats });
        }
      } catch (error) {
        if (!cancelled) {
          setInsights({ indexes: [], schemaSummary: null, stats: null });
          setInsightsError(error instanceof Error ? error.message : 'Unable to load collection insights.');
        }
      } finally {
        if (!cancelled) {
          setLoadingInsights(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [activeConnectionId, selection]);

  return {
    ...insights,
    loadingInsights,
    insightsError,
  };
}
