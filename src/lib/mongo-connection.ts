export function buildMongoConnectionString(connectionString: string, tlsCertificatePath?: string) {
  const normalizedConnection = connectionString.trim();
  const normalizedCertPath = tlsCertificatePath?.trim();

  if (!normalizedConnection) {
    throw new Error('Connection string is required.');
  }

  if (!normalizedCertPath) {
    return normalizedConnection;
  }

  try {
    const url = new URL(normalizedConnection);

    url.searchParams.set('tls', 'true');
    url.searchParams.set('tlsCAFile', normalizedCertPath);

    return url.toString();
  } catch {
    const separator = normalizedConnection.includes('?') ? '&' : '?';
    const params = new URLSearchParams({
      tls: 'true',
      tlsCAFile: normalizedCertPath,
    });

    return `${normalizedConnection}${separator}${params.toString()}`;
  }
}