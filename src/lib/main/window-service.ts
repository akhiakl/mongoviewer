import path from 'node:path';
import { BrowserWindow, nativeTheme } from 'electron/main';

function getTitleBarOverlay() {
    if (nativeTheme.shouldUseDarkColors) {
        return {
            color: '#09090b',
            symbolColor: '#fafafa',
            height: 40,
        };
    }

    return {
        color: '#ffffff',
        symbolColor: '#09090b',
        height: 40,
    };
}

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
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    if (!isMac) {
        const onThemeUpdated = () => {
            mainWindow.setTitleBarOverlay(getTitleBarOverlay());
        };

        nativeTheme.on('updated', onThemeUpdated);
        mainWindow.on('closed', () => {
            nativeTheme.removeListener('updated', onThemeUpdated);
        });
    }

    return mainWindow;
}
