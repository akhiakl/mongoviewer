import { useConnections } from '@/renderer/hooks/use-connections';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export function useConnectionMenu() {
    const {
        connectionsState,
        saveConnection,
        removeConnection,
        refreshConnections,
    } = useConnections();
    const navigate = useNavigate();

    const openConnection = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const saveCurrentConnection = useCallback(() => {
        alert('Save current connection (not yet implemented)');
    }, []);

    const openSavedConnection = useCallback(() => {
        navigate('/');
    }, [navigate]);

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
        removeConnection,
        refreshConnections,
    };
}
