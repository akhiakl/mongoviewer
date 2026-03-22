import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron/main';

function getCertificatesDirectoryPath() {
    return path.join(app.getPath('userData'), 'storage', 'certificates');
}

export async function persistTlsCertificate(sourcePath: string): Promise<string> {
    const certificatesDir = getCertificatesDirectoryPath();
    await mkdir(certificatesDir, { recursive: true });

    const extension = path.extname(sourcePath);
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const destinationPath = path.join(certificatesDir, fileName);

    await copyFile(sourcePath, destinationPath);

    return destinationPath;
}

export async function removeTlsCertificate(certificatePath: string | null | undefined) {
    if (!certificatePath) {
        return;
    }

    await unlink(certificatePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    });
}
