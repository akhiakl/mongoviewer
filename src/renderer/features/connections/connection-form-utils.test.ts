import { describe, expect, it } from 'vitest';

import {
    extractTlsCertificatePath,
    isPersistedTlsCertificatePath,
    validateConnectionString,
} from '@/renderer/features/connections/connection-form-utils';

describe('connection-form-utils', () => {
    it('validates connection strings across invalid and valid states', () => {
        expect(validateConnectionString('')).toBe('Connection string is required.');
        expect(validateConnectionString('http://localhost')).toBe(
            'Must start with mongodb:// or mongodb+srv://',
        );
        expect(validateConnectionString('mongodb://bad host')).toBe(
            'Invalid connection string format.',
        );
        expect(validateConnectionString('mongodb://localhost:27017')).toBeNull();
    });

    it('detects persisted tls certificate paths', () => {
        expect(isPersistedTlsCertificatePath('C:\\app\\storage\\certificates\\mongo.pem')).toBe(
            true,
        );
        expect(isPersistedTlsCertificatePath('C:\\Users\\akhil\\Downloads\\mongo.pem')).toBe(
            false,
        );
    });

    it('extracts tls certificate paths from valid connection strings', () => {
        expect(
            extractTlsCertificatePath(
                'mongodb://localhost:27017/?tls=true&tlsCAFile=C%3A%5C%5Ccerts%5C%5Cmongo.pem',
            ),
        ).toBe('C:\\\\certs\\\\mongo.pem');
        expect(extractTlsCertificatePath('mongodb://localhost:27017')).toBe('');
        expect(extractTlsCertificatePath('not-a-uri')).toBe('');
    });
});
