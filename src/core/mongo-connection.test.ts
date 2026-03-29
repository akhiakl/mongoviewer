import { describe, expect, it } from 'vitest';

import { buildMongoConnectionString } from '@/core/mongo-connection';

describe('buildMongoConnectionString', () => {
    it('throws when connection string is empty', () => {
        expect(() => buildMongoConnectionString('   ')).toThrow('Connection string is required.');
    });

    it('returns trimmed connection string when no TLS cert is provided', () => {
        expect(buildMongoConnectionString('  mongodb://localhost:27017  ')).toBe('mongodb://localhost:27017');
    });

    it('adds tls parameters for valid URL connection strings', () => {
        const result = buildMongoConnectionString(
            'mongodb://localhost:27017/?replicaSet=rs0',
            '  C:/certs/ca.pem  ',
        );

        expect(result).toContain('replicaSet=rs0');
        expect(result).toContain('tls=true');
        expect(result).toContain('tlsCAFile=C%3A%2Fcerts%2Fca.pem');
    });

    it('falls back to query-string append for non-URL strings', () => {
        const result = buildMongoConnectionString('not a valid connection', 'C:/certs/ca.pem');

        expect(result).toBe('not a valid connection?tls=true&tlsCAFile=C%3A%2Fcerts%2Fca.pem');
    });
});
