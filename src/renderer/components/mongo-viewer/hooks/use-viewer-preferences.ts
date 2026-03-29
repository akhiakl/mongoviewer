import { useEffect } from 'react';

import type { Selection, ViewMode } from '@/renderer/components/mongo-viewer/types';
import {
    selectQueryHistoryOpen,
    selectSchemaPanelOpen,
    useAppUiStore,
} from '@/renderer/stores/app-ui-store';
import {
    selectViewerPreferences,
    useViewerPreferencesStore,
} from '@/renderer/stores/viewer-preferences-store';

export function useViewerPreferences(connectionId: string) {
    const preferences = useViewerPreferencesStore(selectViewerPreferences(connectionId));
    const setStoredPreferences = useViewerPreferencesStore((state) => state.setPreferences);

    const schemaPanelOpen = useAppUiStore(selectSchemaPanelOpen);
    const queryHistoryOpen = useAppUiStore(selectQueryHistoryOpen);
    const setSchemaPanelOpen = useAppUiStore((state) => state.setSchemaPanelOpen);

    useEffect(() => {
        setSchemaPanelOpen(preferences.showInsights);
    }, [connectionId, preferences.showInsights, setSchemaPanelOpen]);

    return {
        pageSize: preferences.pageSize,
        viewMode: preferences.viewMode,
        lastSelection: preferences.lastSelection,
        showInsights: schemaPanelOpen,
        queryHistoryOpen,
        setPageSize: (pageSize: number) => {
            setStoredPreferences(connectionId, { pageSize });
        },
        setViewMode: (viewMode: ViewMode) => {
            setStoredPreferences(connectionId, { viewMode });
        },
        setLastSelection: (lastSelection: Selection | null) => {
            setStoredPreferences(connectionId, { lastSelection });
        },
        setShowInsights: (showInsights: boolean) => {
            setSchemaPanelOpen(showInsights);
            setStoredPreferences(connectionId, { showInsights });
        },
    };
}
