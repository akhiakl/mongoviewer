import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron/main';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { buildMongoConnectionString } from './lib/mongo-connection';
import { createConnection, deleteConnection, getActiveConnection, getConnectionsState, setActiveConnection } from './lib/main/connection-store';
import { listDatabaseNames, listDatabaseTree, listDocuments } from './lib/main/mongo-service';
import type { DocumentsQuery, SaveConnectionInput } from './lib/mongo-types';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

ipcMain.handle('mongo:list-databases', async (_event, connectionString: string) => {
  if (!connectionString || !connectionString.trim()) {
    throw new Error('A MongoDB connection string is required.');
  }

  try {
    return await listDatabaseNames(connectionString);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connection error.';
    throw new Error(`Failed to connect to MongoDB: ${message}`, { cause: error });
  }
});

ipcMain.handle('mongo:list-connections', async () => getConnectionsState());

ipcMain.handle('mongo:save-connection', async (_event, input: SaveConnectionInput) => {
  const name = input.name?.trim();
  const connectionString = input.connectionString?.trim();
  const tlsCertificatePath = input.tlsCertificatePath?.trim();

  if (!name) {
    throw new Error('Connection name is required.');
  }

  if (!connectionString) {
    throw new Error('Connection string is required.');
  }

  const uri = buildMongoConnectionString(connectionString, tlsCertificatePath);

  return createConnection({
    name,
    uri,
    tlsCertificatePath,
  });
});

ipcMain.handle('mongo:delete-connection', async (_event, connectionId: string) => {
  if (!connectionId?.trim()) {
    throw new Error('Connection id is required.');
  }

  return deleteConnection(connectionId);
});

ipcMain.handle('mongo:set-active-connection', async (_event, connectionId: string) => {
  if (!connectionId?.trim()) {
    throw new Error('Connection id is required.');
  }

  return setActiveConnection(connectionId);
});

ipcMain.handle('mongo:list-database-tree', async () => {
  const activeConnection = await getActiveConnection();
  if (!activeConnection) {
    throw new Error('No active connection selected.');
  }

  return listDatabaseTree(activeConnection.uri);
});

ipcMain.handle('mongo:list-documents', async (_event, query: DocumentsQuery) => {
  if (!query?.db?.trim() || !query?.collection?.trim()) {
    throw new Error('Database and collection are required.');
  }

  const activeConnection = await getActiveConnection();
  if (!activeConnection) {
    throw new Error('No active connection selected.');
  }

  return listDocuments(activeConnection.uri, query);
});

ipcMain.handle('dialog:pick-tls-certificate', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select TLS certificate',
    properties: ['openFile'],
    filters: [
      {
        name: 'Certificates',
        extensions: ['pem', 'crt', 'cer', 'ca', 'txt'],
      },
    ],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0] ?? null;
});

const createWindow = () => {
  const isMac = process.platform === 'darwin';
  const getTitleBarOverlay = () => {
    if (nativeTheme.shouldUseDarkColors) {
      return {
        // Matches dark mode Tailwind tokens: bg-background + text-foreground
        color: '#09090b',
        symbolColor: '#fafafa',
        height: 40,
      };
    }

    return {
      // Matches light mode Tailwind tokens: bg-background + text-foreground
      color: '#ffffff',
      symbolColor: '#09090b',
      height: 40,
    };
  };

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 840,
    minHeight: 620,
    // Hide the default title bar but keep native window controls.
    titleBarStyle: 'hidden',
    ...(!isMac
      ? {
        // Show native controls on Windows/Linux while keeping custom content area.
        titleBarOverlay: getTitleBarOverlay(),
      }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
