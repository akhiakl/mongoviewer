import { useMemo } from 'react';

import { createFeatureLogger } from '@/renderer/services/logger';

export function useRendererLogger(scope: string) {
    return useMemo(() => createFeatureLogger(scope), [scope]);
}
