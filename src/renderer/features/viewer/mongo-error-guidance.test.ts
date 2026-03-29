import { describe, expect, it } from 'vitest';

import { getMongoErrorGuidance } from '@/renderer/features/viewer/mongo-error-guidance';

describe('getMongoErrorGuidance', () => {
    it('maps authentication errors to actionable guidance', () => {
        expect(getMongoErrorGuidance('Authentication failed for user', 'fallback')).toMatchObject({
            title: 'Authentication failed',
        });
    });

    it('maps tls and certificate errors to actionable guidance', () => {
        expect(getMongoErrorGuidance('TLS certificate mismatch', 'fallback')).toMatchObject({
            title: 'TLS or certificate issue',
        });
    });

    it('maps connectivity errors to actionable guidance', () => {
        expect(getMongoErrorGuidance('Server selection timed out after 5000 ms', 'fallback')).toMatchObject({
            title: 'Connection could not be established',
        });
    });

    it('maps parsing errors to actionable guidance', () => {
        expect(getMongoErrorGuidance('JSON parse error', 'fallback')).toMatchObject({
            title: 'Query could not be parsed',
        });
    });

    it('falls back for unknown errors', () => {
        expect(getMongoErrorGuidance('Something odd happened', 'fallback')).toMatchObject({
            title: 'Request failed',
            detail: 'Something odd happened',
        });
        expect(getMongoErrorGuidance(null, 'fallback')).toMatchObject({
            detail: 'fallback',
        });
    });
});
