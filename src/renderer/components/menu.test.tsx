import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Menu from '@/renderer/components/menu';

const useMenuMock = vi.fn();
const useThemeMock = vi.fn();

vi.mock('@/renderer/components/ui/menubar', async () => {
    const React = await import('react');
    const RadioGroupContext = React.createContext<((value: string) => void) | null>(null);
    type ChildrenProps = { children?: ReactNode };
    type ItemProps = ChildrenProps & { onClick?: () => void; disabled?: boolean };
    type RadioGroupProps = ChildrenProps & { onValueChange: (value: string) => void };
    type RadioItemProps = ChildrenProps & { value: string };
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
        MenubarRadioGroup: ({
            children,
            onValueChange,
        }: RadioGroupProps) => (
            <RadioGroupContext.Provider value={onValueChange}>
                <div>{children}</div>
            </RadioGroupContext.Provider>
        ),
        MenubarRadioItem: ({
            children,
            value,
        }: RadioItemProps) => {
            const onValueChange = React.useContext(RadioGroupContext);
            return (
                <button
                    type="button"
                    role="menuitemradio"
                    aria-label={typeof children === 'string' ? children : value}
                    onClick={() => onValueChange?.(value)}
                >
                    {children}
                </button>
            );
        },
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

vi.mock('@/renderer/hooks/menu/use-menu', () => ({
    useMenu: () => useMenuMock(),
}));

vi.mock('@/renderer/components/theme-provider', () => ({
    useTheme: () => useThemeMock(),
}));



describe('Menu', () => {
    it('shows system, light, and dark theme options and updates the selected theme', () => {
        const setTheme = vi.fn();

        useMenuMock.mockReturnValue({
            openConnection: vi.fn(),
            saveCurrentConnection: vi.fn(),
            openSavedConnection: vi.fn(),
            renameConnection: vi.fn(),
            deleteConnection: vi.fn(),
            reload: vi.fn(),
            toggleSidebar: vi.fn(),
            showQueryHistory: vi.fn(),
            showSchemaPanel: vi.fn(),
            undo: vi.fn(),
            redo: vi.fn(),
            cut: vi.fn(),
            copy: vi.fn(),
            paste: vi.fn(),
            find: vi.fn(),
            help: vi.fn(),
            reportIssue: vi.fn(),
            about: vi.fn(),
            isConnectionRoute: true,
            sidebarOpen: true,
            queryHistoryOpen: false,
            schemaPanelOpen: true,
            canOpenSavedConnection: true,
            canSaveCurrentConnection: false,
            canShowQueryHistory: false,
        });

        useThemeMock.mockReturnValue({
            theme: 'system',
            setTheme,
        });

        render(<Menu />);

        expect(screen.getByText('System')).toBeInTheDocument();
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Current Connection' })).toBeDisabled();

        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

        expect(setTheme).toHaveBeenCalledWith('dark');
    });
});
