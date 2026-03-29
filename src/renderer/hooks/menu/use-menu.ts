import { useConnectionMenu } from './use-connection-menu';
import { useViewMenu } from './use-view-menu';
import { useEditMenu } from './use-edit-menu';
import { useHelpMenu } from './use-help-menu';

export const useMenu = () => {
    const {
        openConnection,
        saveCurrentConnection,
        openSavedConnection,
        canOpenSavedConnection,
    } = useConnectionMenu();
    const {
        reload,
        toggleSidebar,
        showQueryHistory,
        showSchemaPanel,
        isConnectionRoute,
        sidebarOpen,
        queryHistoryOpen,
        schemaPanelOpen,
    } = useViewMenu();
    const { undo, redo, cut, copy, paste, find } = useEditMenu();
    const { help, reportIssue, about } = useHelpMenu();
    return {
        openConnection,
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
        help,
        reportIssue,
        about,
        isConnectionRoute,
        sidebarOpen,
        queryHistoryOpen,
        schemaPanelOpen,
        canOpenSavedConnection,
        canSaveCurrentConnection: false,
        canShowQueryHistory: false,
    };
};
