import { useAppView } from '@/renderer/components/app-view'
import { useConnections } from '@/renderer/hooks/use-connections';
import { useCallback } from 'react';
export function useConnectionMenu() {
    const {
        connectionsState,
        saveConnection,
        activateConnection,
        clearActiveConnection,
        removeConnection,
        refreshConnections,
    } = useConnections();
    const { setView } = useAppView();

    const openConnection = useCallback(() => {
        setView('connections');
    }, [setView]);

    const saveCurrentConnection = useCallback(() => {
        alert('Save current connection (not yet implemented)');
    }, []);

    const openSavedConnection = useCallback(() => {
        setView('connections');
    }, [setView]);

    const renameConnection = useCallback(() => {
        alert('Rename connection (not yet implemented)');
    }, []);

    const deleteConnection = useCallback(() => {
        alert('Delete connection (not yet implemented)');
    }, []);

    return {
        openConnection,
        saveCurrentConnection,
        openSavedConnection,
        renameConnection,
        deleteConnection,
        connectionsState,
        saveConnection,
        activateConnection,
        clearActiveConnection,
        removeConnection,
        refreshConnections,
    };
}