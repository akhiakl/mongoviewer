import { BrowserWindow, nativeTheme } from 'electron/main';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const TITLE_BAR_OVERLAY = {
    light: {
        color: '#f8f9fb',      // matches light --background: cool off-white
        symbolColor: '#1a1c22',
        height: 40,
    },
    dark: {
        color: '#0c0d10',      // matches dark --background: near-black neutral
        symbolColor: '#e8eaed',
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
