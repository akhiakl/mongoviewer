import React, { useCallback } from "react";
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/renderer/components/ui/menubar"
import { useMenu } from "@/renderer/hooks/menu/use-menu";

const Menu: React.FC = () => {
    // Handler hooks
    const {
        openConnection,
        saveCurrentConnection,
        openSavedConnection,
        renameConnection,
        deleteConnection,
        reload, toggleSidebar, showQueryHistory, showSchemaPanel,
        undo, redo, cut, copy, paste, find,
        help, reportIssue, about,
        darkTheme, toggleDarkTheme,
    } = useMenu();
    // Local stubs for menu actions
    const saveConnection = useCallback(() => {/* TODO: Save connection from menu */ }, []);
    const closeTab = useCallback(() => {/* TODO: Close tab logic */ }, []);
    const exportCollection = useCallback(() => {/* TODO: Export collection logic */ }, []);
    const importCollection = useCallback(() => {/* TODO: Import collection logic */ }, []);
    const preferences = useCallback(() => {/* TODO: Preferences logic */ }, []);
    return (
        <Menubar className="w-80">
            {/* File Menu */}
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={openConnection}>Open Connection
                            <MenubarShortcut>Ctrl+O</MenubarShortcut>

                        </MenubarItem>
                        <MenubarItem onClick={saveConnection}>Save Connection
                            <MenubarShortcut>Ctrl+S</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={closeTab}>Close Tab
                            <MenubarShortcut>Ctrl+W</MenubarShortcut>
                        </MenubarItem>
                    </MenubarGroup>
                    <MenubarSeparator />
                    <MenubarGroup>
                        <MenubarItem onClick={exportCollection}>Export Collection (CSV/JSON)</MenubarItem>
                        <MenubarItem onClick={importCollection}>Import Collection (CSV/JSON)</MenubarItem>
                    </MenubarGroup>
                    <MenubarSeparator />
                    <MenubarGroup>
                        <MenubarItem onClick={preferences}>Preferences</MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            {/* Edit Menu */}
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={undo}>Undo
                            <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={redo}>Redo
                            <MenubarShortcut>Ctrl+Y</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={cut}>Cut
                            <MenubarShortcut>Ctrl+X</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={copy}>Copy
                            <MenubarShortcut>Ctrl+C</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={paste}>Paste
                            <MenubarShortcut>Ctrl+V</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={find}>Find in Collection
                            <MenubarShortcut>Ctrl+F</MenubarShortcut>
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            {/* View Menu */}
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={reload}>Reload
                            <MenubarShortcut>Ctrl+R</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={toggleSidebar}>Toggle Sidebar</MenubarItem>
                        <MenubarItem onClick={showQueryHistory}>Show Query History</MenubarItem>
                        <MenubarItem onClick={showSchemaPanel}>Show Schema Panel</MenubarItem>
                        <MenubarSeparator />
                        <MenubarCheckboxItem checked={darkTheme} onCheckedChange={toggleDarkTheme}>Dark Theme</MenubarCheckboxItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            {/* Saved Connections Menu */}
            <MenubarMenu>
                <MenubarTrigger>Connections</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={openSavedConnection}>Open Saved Connection</MenubarItem>
                        <MenubarItem onClick={saveCurrentConnection}>Save Current Connection</MenubarItem>
                        <MenubarItem onClick={renameConnection}>Rename Connection</MenubarItem>
                        <MenubarItem onClick={deleteConnection}>Delete Connection</MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            {/* Help Menu */}
            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={help}>Documentation</MenubarItem>
                        <MenubarItem onClick={reportIssue}>Report Issue</MenubarItem>
                        <MenubarItem onClick={about}>About</MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
};

export default Menu