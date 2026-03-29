import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import Menu from '@/renderer/components/menu';

const useMenuCommandsMock = vi.fn();

vi.mock('@/renderer/components/ui/menubar', async () => {
    type ChildrenProps = { children?: ReactNode };
    type ItemProps = ChildrenProps & { onClick?: () => void; disabled?: boolean };
    type RadioItemProps = ChildrenProps & {
        value?: string;
        onClick?: () => void;
        disabled?: boolean;
    };
    type CheckboxItemProps = ChildrenProps & {
        checked?: boolean;
        disabled?: boolean;
        onCheckedChange?: () => void;
    };

    return {
        Menubar: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarContent: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarGroup: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarItem: ({ children, disabled, onClick }: ItemProps) => (
            <button type="button" disabled={disabled} onClick={onClick}>{children}</button>
        ),
        MenubarMenu: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarRadioGroup: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarRadioItem: ({
            children,
            disabled,
            onClick,
        }: RadioItemProps) => (
            <button
                type="button"
                role="menuitemradio"
                disabled={disabled}
                aria-label={typeof children === 'string' ? children : 'radio'}
                onClick={onClick}
            >
                {children}
            </button>
        ),
        MenubarCheckboxItem: ({
            children,
            disabled,
            onCheckedChange,
        }: CheckboxItemProps) => (
            <button type="button" disabled={disabled} onClick={() => onCheckedChange?.()}>
                {children}
            </button>
        ),
        MenubarSub: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarSubContent: ({ children }: ChildrenProps) => <div>{children}</div>,
        MenubarSubTrigger: ({ children }: ChildrenProps) => <button type="button">{children}</button>,
        MenubarSeparator: () => <hr />,
        MenubarShortcut: ({ children }: ChildrenProps) => <span>{children}</span>,
        MenubarTrigger: ({ children }: ChildrenProps) => <button type="button">{children}</button>,
    };
});

vi.mock('@/renderer/features/menu/use-menu-commands', () => ({
    useMenuCommands: () => useMenuCommandsMock(),
}));

describe('Menu', () => {
    it('renders command groups, respects disabled states, and runs commands', () => {
        const darkThemeRun = vi.fn();
        const openConnectionRun = vi.fn();

        useMenuCommandsMock.mockReturnValue([
            {
                id: 'file',
                label: 'File',
                entries: [
                    {
                        id: 'file.open-connection',
                        type: 'action',
                        label: 'Open Connection',
                        shortcut: 'Ctrl+O',
                        run: openConnectionRun,
                    },
                ],
            },
            {
                id: 'view',
                label: 'View',
                entries: [
                    {
                        id: 'view.theme',
                        type: 'submenu',
                        label: 'Theme',
                        items: [
                            {
                                id: 'theme.system',
                                type: 'action',
                                label: 'System',
                                checked: true,
                                run: vi.fn(),
                            },
                            {
                                id: 'theme.dark',
                                type: 'action',
                                label: 'Dark',
                                run: darkThemeRun,
                            },
                        ],
                    },
                ],
            },
            {
                id: 'connections',
                label: 'Connections',
                entries: [
                    {
                        id: 'connections.save-current',
                        type: 'action',
                        label: 'Save Current Connection',
                        enabled: false,
                        run: vi.fn(),
                    },
                ],
            },
        ]);

        render(<Menu />);

        expect(screen.getByText('Open Connection')).toBeInTheDocument();
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Current Connection' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: /Open Connection/ }));
        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

        expect(openConnectionRun).toHaveBeenCalledTimes(1);
        expect(darkThemeRun).toHaveBeenCalledTimes(1);
    });
});
