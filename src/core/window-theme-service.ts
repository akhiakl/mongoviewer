import { BrowserWindow, nativeTheme } from 'electron/main';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const TITLE_BAR_OVERLAY = {
    light: {
        color: '#f1f8f3',
        symbolColor: '#152019',
        height: 40,
    },
    dark: {
        color: '#0e1611',
        symbolColor: '#ecf0ed',
        height: 40,
    },
} as const;

let themePreference: ThemePreference = 'system';

function resolveTheme(): ResolvedTheme {
    if (themePreference === 'light' || themePreference === 'dark') {
        return themePreference;
    }

    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

export function getTitleBarOverlay() {
    const resolvedTheme = resolveTheme();
    return TITLE_BAR_OVERLAY[resolvedTheme];
}

export function setWindowThemePreference(nextTheme: ThemePreference) {
    themePreference = nextTheme;

    for (const window of BrowserWindow.getAllWindows()) {
        if (!window.isDestroyed() && process.platform !== 'darwin') {
            window.setTitleBarOverlay(getTitleBarOverlay());
        }
    }
}

export function syncWindowOverlayWithSystemTheme(window: BrowserWindow) {
    if (process.platform === 'darwin') {
        return () => undefined;
    }

    const onThemeUpdated = () => {
        if (themePreference === 'system' && !window.isDestroyed()) {
            window.setTitleBarOverlay(getTitleBarOverlay());
        }
    };

    nativeTheme.on('updated', onThemeUpdated);

    return () => {
        nativeTheme.removeListener('updated', onThemeUpdated);
    };
}
