import { dialog, ipcMain } from 'electron/main';

export function registerDialogIpcHandlers() {
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
}
