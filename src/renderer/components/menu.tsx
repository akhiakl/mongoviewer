import React from 'react';

import {
    Menubar,
    MenubarCheckboxItem,
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
} from '@/renderer/components/ui/menubar';
import {
    type MenuActionCommand,
    type MenuEntry,
    useMenuCommands,
} from '@/renderer/features/menu/use-menu-commands';

function isVisible(entry: MenuEntry) {
    if (entry.type === 'separator' || entry.type === 'submenu') {
        return true;
    }

    return entry.visible !== false;
}

function renderAction(entry: MenuActionCommand) {
    if (entry.type === 'checkbox') {
        return (
            <MenubarCheckboxItem
                key={entry.id}
                checked={entry.checked}
                disabled={entry.enabled === false}
                onCheckedChange={entry.run}
            >
                {entry.label}
            </MenubarCheckboxItem>
        );
    }

    return (
        <MenubarItem key={entry.id} disabled={entry.enabled === false} onClick={entry.run}>
            {entry.label}
            {entry.shortcut ? <MenubarShortcut>{entry.shortcut}</MenubarShortcut> : null}
        </MenubarItem>
    );
}

function renderEntry(entry: MenuEntry) {
    if (!isVisible(entry)) {
        return null;
    }

    if (entry.type === 'separator') {
        return <MenubarSeparator key={entry.id} />;
    }

    if (entry.type === 'submenu') {
        const visibleItems = entry.items.filter(isVisible);
        const selectedValue =
            visibleItems.find(
                (item): item is MenuActionCommand =>
                    item.type !== 'separator' && item.type !== 'submenu' && item.checked === true,
            )?.id ?? '';

        return (
            <MenubarSub key={entry.id}>
                <MenubarSubTrigger>{entry.label}</MenubarSubTrigger>
                <MenubarSubContent>
                    <MenubarRadioGroup value={selectedValue}>
                        {visibleItems.map((item) => {
                            if (item.type === 'separator' || item.type === 'submenu') {
                                return null;
                            }

                            return (
                                <MenubarRadioItem
                                    key={item.id}
                                    value={item.id}
                                    disabled={item.enabled === false}
                                    onClick={item.run}
                                >
                                    {item.label}
                                </MenubarRadioItem>
                            );
                        })}
                    </MenubarRadioGroup>
                </MenubarSubContent>
            </MenubarSub>
        );
    }

    return renderAction(entry);
}

const Menu: React.FC = () => {
    const menuGroups = useMenuCommands();

    return (
        <Menubar className="w-80">
            {menuGroups.map((group) => (
                <MenubarMenu key={group.id}>
                    <MenubarTrigger>{group.label}</MenubarTrigger>
                    <MenubarContent>
                        <MenubarGroup>{group.entries.map(renderEntry)}</MenubarGroup>
                    </MenubarContent>
                </MenubarMenu>
            ))}
        </Menubar>
    );
};

export default Menu;
