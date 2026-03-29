import { useCallback } from 'react';
import { useConnectionMenu } from './use-connection-menu';
import { useViewMenu } from './use-view-menu';
import { useEditMenu } from './use-edit-menu';
import { useHelpMenu } from './use-help-menu';

export const useMenu = () => {
    const {
        openConnection,
        saveCurrentConnection,
        openSavedConnection,
        renameConnection,
        deleteConnection,

    } = useConnectionMenu();
    const { reload, toggleSidebar, showQueryHistory, showSchemaPanel } = useViewMenu();
    const { undo, redo, cut, copy, paste, find } = useEditMenu();
    const { help, reportIssue, about } = useHelpMenu();

    const saveConnection = useCallback(() => {/* TODO: Save connection from menu */ }, []);
    const closeTab = useCallback(() => {/* TODO: Close tab logic */ }, []);
    const exportCollection = useCallback(() => {/* TODO: Export collection logic */ }, []);
    const importCollection = useCallback(() => {/* TODO: Import collection logic */ }, []);
    const preferences = useCallback(() => {/* TODO: Preferences logic */ }, []);
    return {
        openConnection,
        saveConnection,
        closeTab,
        exportCollection,
        importCollection,
        preferences,
        undo,
        redo,
        cut,
        copy,
        paste,
        find,
        reload,
        toggleSidebar,
        showQueryHistory,
        showSchemaPanel,
        openSavedConnection,
        saveCurrentConnection,
        renameConnection,
        deleteConnection,
        help,
        reportIssue,
        about,
    };
};
