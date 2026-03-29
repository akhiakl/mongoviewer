import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useConnectionsStore } from '@/renderer/stores/connections-store';

export function useConnectionMenu() {
    const navigate = useNavigate();
    const connections = useConnectionsStore((state) => state.connections);

    const openConnection = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const saveCurrentConnection = useCallback(() => undefined, []);

    const openSavedConnection = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return {
        openConnection,
        openSavedConnection,
        canOpenSavedConnection: connections.length > 0,
        saveCurrentConnection,
    };
}
