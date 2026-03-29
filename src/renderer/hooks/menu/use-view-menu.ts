import { useCallback } from 'react';
import { useMatch } from 'react-router';

import { useAppUiStore } from '@/renderer/stores/app-ui-store';

export function useViewMenu() {
    const isConnectionRoute = useMatch('/connections/:connectionId') !== null;
    const toggleQueryHistoryState = useAppUiStore((state) => state.toggleQueryHistory);
    const toggleSchemaPanelState = useAppUiStore((state) => state.toggleSchemaPanel);
    const queryHistoryOpen = useAppUiStore((state) => state.queryHistoryOpen);
    const schemaPanelOpen = useAppUiStore((state) => state.schemaPanelOpen);

    const reload = useCallback(() => window.location.reload(), []);
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
        showQueryHistory,
        showSchemaPanel,
        isConnectionRoute,
        queryHistoryOpen,
        schemaPanelOpen,
    };
}
