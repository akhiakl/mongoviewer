export function validateConnectionString(connectionString: string) {
    if (!connectionString.trim()) {
        return 'Connection string is required.';
    }

    if (!/^mongodb(\+srv)?:\/\//.test(connectionString.trim())) {
        return 'Must start with mongodb:// or mongodb+srv://';
    }

    try {
        new URL(connectionString.trim());
    } catch {
        return 'Invalid connection string format.';
    }

    return null;
}

export function isPersistedTlsCertificatePath(path: string) {
    return /storage[\\/]+certificates/.test(path);
}

export function extractTlsCertificatePath(connectionString: string) {
    try {
        const url = new URL(connectionString);
        return url.searchParams.get('tlsCAFile') ?? '';
    } catch {
        return '';
    }
}
