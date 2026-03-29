import path from 'node:path';
import { BrowserWindow } from 'electron/main';
import { getTitleBarOverlay, syncWindowOverlayWithSystemTheme } from './window-theme-service';

export function createMainWindow() {
    const isMac = process.platform === 'darwin';

    const mainWindow = new BrowserWindow({
        width: 980,
        height: 720,
        minWidth: 840,
        minHeight: 620,
        titleBarStyle: 'hidden',
        ...(!isMac
            ? {
                titleBarOverlay: getTitleBarOverlay(),
            }
            : {}),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        // Auto-open DevTools in dev mode
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        });
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    if (!isMac) {
        const cleanupThemeSync = syncWindowOverlayWithSystemTheme(mainWindow);
        mainWindow.on('closed', cleanupThemeSync);
    }

    return mainWindow;
}
