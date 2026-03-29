import { useMemo } from 'react';

import { useTheme } from '@/renderer/components/theme-provider';
import { useRendererLogger } from '@/renderer/hooks/use-renderer-logger';
import { useConnectionMenu } from '@/renderer/hooks/menu/use-connection-menu';
import { useEditMenu } from '@/renderer/hooks/menu/use-edit-menu';
import { useHelpMenu } from '@/renderer/hooks/menu/use-help-menu';
import { useViewMenu } from '@/renderer/hooks/menu/use-view-menu';

export type MenuActionCommand = {
    id: string;
    type: 'action' | 'checkbox';
    label: string;
    shortcut?: string;
    enabled?: boolean;
    visible?: boolean;
    checked?: boolean;
    run: () => void;
};

export type MenuRadioOption = {
    id: string;
    label: string;
    value: string;
    enabled?: boolean;
    run: () => void;
};

export type MenuSeparator = {
    id: string;
    type: 'separator';
};

export type MenuSubmenu = {
    id: string;
    type: 'submenu';
    label: string;
    items: MenuEntry[];
};

export type MenuEntry = MenuActionCommand | MenuSeparator | MenuSubmenu;

export type MenuGroup = {
    id: string;
    label: string;
    entries: MenuEntry[];
};

function createSeparator(id: string): MenuSeparator {
    return {
        id,
        type: 'separator',
    };
}

export function useMenuCommands() {
    const logger = useRendererLogger('menu');
    const { setTheme, theme } = useTheme();
    const {
        openConnection,
        openSavedConnection,
        canOpenSavedConnection,
    } = useConnectionMenu();
    const {
        reload,
        showQueryHistory,
        showSchemaPanel,
        isConnectionRoute,
        queryHistoryOpen,
        schemaPanelOpen,
    } = useViewMenu();
    const { undo, redo, cut, copy, paste, find } = useEditMenu();
    const { help, reportIssue, about } = useHelpMenu();

    return useMemo<MenuGroup[]>(
        () => [
            {
                id: 'file',
                label: 'File',
                entries: [
                    {
                        id: 'file.open-connection',
                        type: 'action',
                        label: 'Open Connection',
                        shortcut: 'Ctrl+O',
                        run: () => {
                            logger.info('openConnection');
                            openConnection();
                        },
                    },
                ],
            },
            {
                id: 'edit',
                label: 'Edit',
                entries: [
                    {
                        id: 'edit.undo',
                        type: 'action',
                        label: 'Undo',
                        shortcut: 'Ctrl+Z',
                        run: undo,
                    },
                    {
                        id: 'edit.redo',
                        type: 'action',
                        label: 'Redo',
                        shortcut: 'Ctrl+Y',
                        run: redo,
                    },
                    createSeparator('edit.separator.1'),
                    {
                        id: 'edit.cut',
                        type: 'action',
                        label: 'Cut',
                        shortcut: 'Ctrl+X',
                        run: cut,
                    },
                    {
                        id: 'edit.copy',
                        type: 'action',
                        label: 'Copy',
                        shortcut: 'Ctrl+C',
                        run: copy,
                    },
                    {
                        id: 'edit.paste',
                        type: 'action',
                        label: 'Paste',
                        shortcut: 'Ctrl+V',
                        run: paste,
                    },
                    createSeparator('edit.separator.2'),
                    {
                        id: 'edit.find',
                        type: 'action',
                        label: 'Find in Collection',
                        shortcut: 'Ctrl+F',
                        run: find,
                    },
                ],
            },
            {
                id: 'view',
                label: 'View',
                entries: [
                    {
                        id: 'view.reload',
                        type: 'action',
                        label: 'Reload',
                        shortcut: 'Ctrl+R',
                        run: reload,
                    },
                    {
                        id: 'view.query-history',
                        type: 'checkbox',
                        label: 'Show Query History',
                        checked: queryHistoryOpen,
                        enabled: false,
                        run: showQueryHistory,
                    },
                    {
                        id: 'view.schema-panel',
                        type: 'checkbox',
                        label: 'Show Schema Panel',
                        checked: schemaPanelOpen,
                        enabled: isConnectionRoute,
                        run: () => {
                            logger.info('toggleSchemaPanel', { checked: !schemaPanelOpen });
                            showSchemaPanel();
                        },
                    },
                    createSeparator('view.separator.1'),
                    {
                        id: 'view.theme',
                        type: 'submenu',
                        label: 'Theme',
                        items: ([
                            { id: 'theme.system', label: 'System', value: 'system' },
                            { id: 'theme.light', label: 'Light', value: 'light' },
                            { id: 'theme.dark', label: 'Dark', value: 'dark' },
                        ] as MenuRadioOption[]).map((option) => ({
                            ...option,
                            type: 'action' as const,
                            checked: theme === option.value,
                            run: () => {
                                logger.info('setThemePreference', { themePreference: option.value });
                                if (
                                    option.value === 'system' ||
                                    option.value === 'light' ||
                                    option.value === 'dark'
                                ) {
                                    setTheme(option.value);
                                }
                            },
                        })),
                    },
                ],
            },
            {
                id: 'connections',
                label: 'Connections',
                entries: [
                    {
                        id: 'connections.open-saved',
                        type: 'action',
                        label: 'Open Saved Connection',
                        enabled: canOpenSavedConnection,
                        run: openSavedConnection,
                    },
                    {
                        id: 'connections.save-current',
                        type: 'action',
                        label: 'Save Current Connection',
                        enabled: false,
                        run: () => undefined,
                    },
                ],
            },
            {
                id: 'help',
                label: 'Help',
                entries: [
                    {
                        id: 'help.documentation',
                        type: 'action',
                        label: 'Documentation',
                        run: help,
                    },
                    {
                        id: 'help.report-issue',
                        type: 'action',
                        label: 'Report Issue',
                        run: reportIssue,
                    },
                    {
                        id: 'help.about',
                        type: 'action',
                        label: 'About',
                        run: about,
                    },
                ],
            },
        ],
        [
            about,
            canOpenSavedConnection,
            copy,
            cut,
            find,
            help,
            isConnectionRoute,
            logger,
            openConnection,
            openSavedConnection,
            paste,
            queryHistoryOpen,
            redo,
            reload,
            reportIssue,
            schemaPanelOpen,
            setTheme,
            showQueryHistory,
            showSchemaPanel,
            theme,
            undo,
        ],
    );
}
