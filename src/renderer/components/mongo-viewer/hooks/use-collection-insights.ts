import { useEffect, useState } from 'react';

import type { CollectionIndexSummary, CollectionSchemaSummary, CollectionStats, Selection } from '@/renderer/components/mongo-viewer/types';
import { mongoViewerService } from '@/renderer/services/mongo-viewer-service';

const INSIGHTS_CACHE_TTL_MS = 60_000;

type CollectionInsights = {
  indexes: CollectionIndexSummary[];
  schemaSummary: CollectionSchemaSummary | null;
  stats: CollectionStats | null;
};

type CachedInsights = CollectionInsights & {
  cachedAt: number;
};

const insightsCache = new Map<string, CachedInsights>();

function getInsightsCacheKey(connectionId: string, selection: Selection) {
  return `${connectionId}:${selection.db}:${selection.collection}`;
}

export function resetCollectionInsightsCache() {
  insightsCache.clear();
}

export function useCollectionInsights(
  connectionId: string,
  selection: Selection | null,
  refreshKey = 0,
) {
  const [insights, setInsights] = useState<CollectionInsights>({
    indexes: [],
    schemaSummary: null,
    stats: null,
  });
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selection) {
      setInsights({ indexes: [], schemaSummary: null, stats: null });
      setLoadingInsights(false);
      setInsightsError(null);
      return;
    }

    let cancelled = false;
    const cacheKey = getInsightsCacheKey(connectionId, selection);
    const cachedInsights = insightsCache.get(cacheKey);

    if (cachedInsights && Date.now() - cachedInsights.cachedAt < INSIGHTS_CACHE_TTL_MS) {
      setInsights({
        indexes: cachedInsights.indexes,
        schemaSummary: cachedInsights.schemaSummary,
        stats: cachedInsights.stats,
      });
      setLoadingInsights(false);
      setInsightsError(null);
      return;
    }

    const run = async () => {
      setLoadingInsights(true);
      setInsightsError(null);

      try {
        const [indexes, schemaSummary, stats] = await Promise.all([
          mongoViewerService.getCollectionIndexes({ ...selection, connectionId }),
          mongoViewerService.getCollectionSchemaSummary({ ...selection, connectionId }),
          mongoViewerService.getCollectionStats({ ...selection, connectionId }),
        ]);

        if (!cancelled) {
          insightsCache.set(cacheKey, {
            indexes,
            schemaSummary,
            stats,
            cachedAt: Date.now(),
          });
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
  }, [connectionId, refreshKey, selection]);

  return {
    ...insights,
    loadingInsights,
    insightsError,
  };
}
