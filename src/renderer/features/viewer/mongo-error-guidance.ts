type ErrorGuidance = {
    title: string;
    detail: string;
    hint: string;
};

function defaultDetail(message: string, fallback: string) {
    return message.trim() || fallback;
}

export function getMongoErrorGuidance(message: string | null, fallback: string): ErrorGuidance {
    const normalizedMessage = message?.toLowerCase() ?? '';

    if (
        normalizedMessage.includes('auth') ||
        normalizedMessage.includes('authentication') ||
        normalizedMessage.includes('not authorized')
    ) {
        return {
            title: 'Authentication failed',
            detail: defaultDetail(message ?? '', fallback),
            hint: 'Verify the username, password, auth database, and any required roles in the connection string.',
        };
    }

    if (
        normalizedMessage.includes('tls') ||
        normalizedMessage.includes('ssl') ||
        normalizedMessage.includes('certificate')
    ) {
        return {
            title: 'TLS or certificate issue',
            detail: defaultDetail(message ?? '', fallback),
            hint: 'Confirm the CA file path is valid on this machine and that the server certificate matches the cluster you are connecting to.',
        };
    }

    if (
        normalizedMessage.includes('econnrefused') ||
        normalizedMessage.includes('timed out') ||
        normalizedMessage.includes('failed to connect') ||
        normalizedMessage.includes('server selection')
    ) {
        return {
            title: 'Connection could not be established',
            detail: defaultDetail(message ?? '', fallback),
            hint: 'Check that the host, port, VPN or network access, and MongoDB server availability are all correct, then retry.',
        };
    }

    if (
        normalizedMessage.includes('json') ||
        normalizedMessage.includes('bson') ||
        normalizedMessage.includes('parse')
    ) {
        return {
            title: 'Query could not be parsed',
            detail: defaultDetail(message ?? '', fallback),
            hint: 'Review the Mongo query syntax and sampled field names before running it again.',
        };
    }

    return {
        title: 'Request failed',
        detail: defaultDetail(message ?? '', fallback),
        hint: 'Retry the request. If it keeps failing, review the saved connection details and MongoDB server logs.',
    };
}
