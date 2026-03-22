import { useCallback } from 'react';

export function useViewMenu() {
    const reload = useCallback(() => window.location.reload(), []);
    const toggleSidebar = useCallback(() => {
        alert('Toggle sidebar (not yet implemented)');
    }, []);
    const showQueryHistory = useCallback(() => {
        alert('Show query history (not yet implemented)');
    }, []);
    const showSchemaPanel = useCallback(() => {
        alert('Show schema panel (not yet implemented)');
    }, []);

    return {
        reload,
        toggleSidebar,
        showQueryHistory,
        showSchemaPanel,
    };
}