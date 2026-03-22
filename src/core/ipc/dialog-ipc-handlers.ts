import { IpcHandlerMap } from '@/shared/types';
import { persistTlsCertificate } from '../tls-certificate-service';

import { dialog, } from 'electron/main';

export const dialogHandlers = {
    'dialog:pick-tls-certificate': async () => {
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
    },
    'dialog:persist-tls-certificate': async (_event, sourcePath: string) => {
        if (!sourcePath) return null;
        return await persistTlsCertificate(sourcePath);
    }
} satisfies IpcHandlerMap<'dialog'>;