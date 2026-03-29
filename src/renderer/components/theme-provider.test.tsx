import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const setThemePreferenceMock = vi.fn(
    async (theme: 'system' | 'light' | 'dark') => {
        void theme;
    },
);
let mediaQueryMatches = false;
let mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null;

vi.mock('@/renderer/renderer-api', () => ({
    mongoViewer: {
        setThemePreference: (theme: 'system' | 'light' | 'dark') => setThemePreferenceMock(theme),
    },
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return actual;
});

import { initializeTheme, ThemeProvider, useTheme } from '@/renderer/components/theme-provider';

function ThemeConsumer() {
    const { resolvedTheme, setTheme, theme } = useTheme();

    return (
        <div>
            <span>Theme:{theme}</span>
            <span>Resolved:{resolvedTheme}</span>
            <button type="button" onClick={() => setTheme('light')}>Light</button>
            <button type="button" onClick={() => setTheme('dark')}>Dark</button>
            <button type="button" onClick={() => setTheme('system')}>System</button>
        </div>
    );
}

describe('ThemeProvider', () => {
    it('initializes the document theme before React renders', () => {
        window.localStorage.setItem('mongoviewer-theme', 'dark');

        initializeTheme();

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('hydrates from storage and applies the selected theme', async () => {
        window.localStorage.setItem('mongoviewer-theme', 'dark');

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Theme:dark')).toBeInTheDocument();
        });

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(setThemePreferenceMock).toHaveBeenCalledWith('dark');
    });

    it('follows the system theme and reacts to media query changes', async () => {
        mediaQueryMatches = false;
        window.localStorage.setItem('mongoviewer-theme', 'system');
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: mediaQueryMatches,
            media: query,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
                mediaQueryListener = listener;
            },
            removeEventListener: () => {
                mediaQueryListener = null;
            },
            dispatchEvent: () => false,
        }));

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('Resolved:light')).toBeInTheDocument();
        });

        mediaQueryMatches = true;
        act(() => {
            mediaQueryListener?.({ matches: true } as MediaQueryListEvent);
        });

        await waitFor(() => {
            expect(screen.getByText('Resolved:dark')).toBeInTheDocument();
        });

        expect(setThemePreferenceMock).toHaveBeenCalledWith('system');
    });

    it('lets users switch themes explicitly', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        act(() => {
            screen.getByRole('button', { name: 'Light' }).click();
        });

        await waitFor(() => {
            expect(screen.getByText('Theme:light')).toBeInTheDocument();
        });

        expect(window.localStorage.getItem('mongoviewer-theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(setThemePreferenceMock).toHaveBeenLastCalledWith('light');
    });
});
