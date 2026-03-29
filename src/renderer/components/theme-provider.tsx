import React from 'react';

import { mongoViewer } from '@/renderer/renderer-api';
import {
    getStoredThemePreference,
    selectThemePreference,
    type ThemePreference,
    useAppUiStore,
} from '@/renderer/stores/app-ui-store';

export type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
    theme: ThemePreference;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: ThemePreference) => void;
};

const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(resolvedTheme: ResolvedTheme) {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
}

function resolveThemePreference(theme: ThemePreference): ResolvedTheme {
    return theme === 'system' ? getSystemTheme() : theme;
}

export function initializeTheme() {
    applyTheme(resolveThemePreference(getStoredThemePreference()));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppUiStore(selectThemePreference);
    const setTheme = useAppUiStore((state) => state.setThemePreference);
    const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() => getSystemTheme());

    React.useEffect(() => {
        const mediaQuery = window.matchMedia(MEDIA_QUERY);
        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    React.useLayoutEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    React.useEffect(() => {
        void mongoViewer.setThemePreference(theme);
    }, [theme]);

    const value = React.useMemo(
        () => ({
            theme,
            resolvedTheme,
            setTheme,
        }),
        [resolvedTheme, setTheme, theme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider.');
    }

    return context;
}
