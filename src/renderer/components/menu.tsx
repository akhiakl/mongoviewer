import React from "react";
import {
    MenubarCheckboxItem,
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/renderer/components/ui/menubar"
import { useMenu } from "@/renderer/hooks/menu/use-menu";
import { useTheme } from "@/renderer/components/theme-provider";

const Menu: React.FC = () => {
    const {
        openConnection,
        openSavedConnection,
        reload, toggleSidebar, showQueryHistory, showSchemaPanel,
        undo, redo, cut, copy, paste, find,
        help, reportIssue, about,
        isConnectionRoute,
        sidebarOpen,
        queryHistoryOpen,
        schemaPanelOpen,
        canOpenSavedConnection,
        canSaveCurrentConnection,
        canShowQueryHistory,
    } = useMenu();
    const { setTheme, theme } = useTheme();
    return (
        <Menubar className="w-80">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={openConnection}>Open Connection
                            <MenubarShortcut>Ctrl+O</MenubarShortcut>
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
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
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem onClick={reload}>Reload
                            <MenubarShortcut>Ctrl+R</MenubarShortcut>
                        </MenubarItem>
                        <MenubarCheckboxItem
                            checked={sidebarOpen}
                            disabled={!isConnectionRoute}
                            onCheckedChange={() => toggleSidebar()}
                        >
                            Toggle Sidebar
                        </MenubarCheckboxItem>
                        <MenubarCheckboxItem
                            checked={queryHistoryOpen}
                            disabled={!canShowQueryHistory}
                            onCheckedChange={() => showQueryHistory()}
                        >
                            Show Query History
                        </MenubarCheckboxItem>
                        <MenubarCheckboxItem
                            checked={schemaPanelOpen}
                            disabled={!isConnectionRoute}
                            onCheckedChange={() => showSchemaPanel()}
                        >
                            Show Schema Panel
                        </MenubarCheckboxItem>
                        <MenubarSeparator />
                        <MenubarSub>
                            <MenubarSubTrigger>Theme</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarRadioGroup value={theme} onValueChange={(value) => {
                                    if (value === 'system' || value === 'light' || value === 'dark') {
                                        setTheme(value);
                                    }
                                }}>
                                    <MenubarRadioItem value="system">
                                        System
                                    </MenubarRadioItem>
                                    <MenubarRadioItem value="light">Light</MenubarRadioItem>
                                    <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                                </MenubarRadioGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Connections</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem disabled={!canOpenSavedConnection} onClick={openSavedConnection}>
                            Open Saved Connection
                        </MenubarItem>
                        <MenubarItem disabled={!canSaveCurrentConnection}>
                            Save Current Connection
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
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
