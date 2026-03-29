import { useCallback } from 'react';
import { useMatch } from 'react-router';

import { useAppUiStore } from '@/renderer/stores/app-ui-store';

export function useViewMenu() {
    const isConnectionRoute = useMatch('/connections/:connectionId') !== null;
    const toggleSidebarState = useAppUiStore((state) => state.toggleSidebar);
    const toggleQueryHistoryState = useAppUiStore((state) => state.toggleQueryHistory);
    const toggleSchemaPanelState = useAppUiStore((state) => state.toggleSchemaPanel);
    const sidebarOpen = useAppUiStore((state) => state.sidebarOpen);
    const queryHistoryOpen = useAppUiStore((state) => state.queryHistoryOpen);
    const schemaPanelOpen = useAppUiStore((state) => state.schemaPanelOpen);

    const reload = useCallback(() => window.location.reload(), []);
    const toggleSidebar = useCallback(() => {
        if (isConnectionRoute) {
            toggleSidebarState();
        }
    }, [isConnectionRoute, toggleSidebarState]);
    const showQueryHistory = useCallback(() => {
        toggleQueryHistoryState();
    }, [toggleQueryHistoryState]);
    const showSchemaPanel = useCallback(() => {
        if (isConnectionRoute) {
            toggleSchemaPanelState();
        }
    }, [isConnectionRoute, toggleSchemaPanelState]);

    return {
        reload,
        toggleSidebar,
        showQueryHistory,
        showSchemaPanel,
        isConnectionRoute,
        sidebarOpen,
        queryHistoryOpen,
        schemaPanelOpen,
    };
}
