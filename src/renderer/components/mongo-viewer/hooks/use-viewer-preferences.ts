import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { Selection, ViewMode } from '@/renderer/components/mongo-viewer/types';
import {
    selectQueryHistoryOpen,
    selectSchemaPanelOpen,
    selectSidebarOpen,
    useAppUiStore,
} from '@/renderer/stores/app-ui-store';
import {
    selectViewerPreferences,
    useViewerPreferencesStore,
} from '@/renderer/stores/viewer-preferences-store';

export function useViewerPreferences(connectionId: string) {
    const preferences = useViewerPreferencesStore(
        useShallow(selectViewerPreferences(connectionId)),
    );
    const setStoredPreferences = useViewerPreferencesStore((state) => state.setPreferences);

    const sidebarOpen = useAppUiStore(selectSidebarOpen);
    const schemaPanelOpen = useAppUiStore(selectSchemaPanelOpen);
    const queryHistoryOpen = useAppUiStore(selectQueryHistoryOpen);
    const setSidebarOpen = useAppUiStore((state) => state.setSidebarOpen);
    const setSchemaPanelOpen = useAppUiStore((state) => state.setSchemaPanelOpen);

    useEffect(() => {
        setSidebarOpen(preferences.sidebarOpen);
        setSchemaPanelOpen(preferences.showInsights);
    }, [connectionId, preferences.showInsights, preferences.sidebarOpen, setSchemaPanelOpen, setSidebarOpen]);

    useEffect(() => {
        setStoredPreferences(connectionId, {
            sidebarOpen,
            showInsights: schemaPanelOpen,
        });
    }, [connectionId, schemaPanelOpen, setStoredPreferences, sidebarOpen]);

    return {
        pageSize: preferences.pageSize,
        viewMode: preferences.viewMode,
        lastSelection: preferences.lastSelection,
        sidebarOpen,
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
        setSidebarOpen,
        setShowInsights: setSchemaPanelOpen,
    };
}
