import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFeatureLogger, logRendererError, logRendererEvent } from '@/renderer/services/logger';

describe('logger', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('logs warnings and errors with context', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        logRendererEvent('warn', 'menu.disabled', { command: 'save-current' });
        logRendererError('ipc.failure', new Error('boom'), { channel: 'mongo:list-documents' });

        expect(warnSpy).toHaveBeenCalledWith('[renderer:menu.disabled]', {
            command: 'save-current',
        });
        expect(errorSpy).toHaveBeenCalled();
    });

    it('creates scoped loggers and handles non-error values', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const featureLogger = createFeatureLogger('connections');

        featureLogger.error('refreshFailed', 'network down', { connectionId: 'conn-1' });

        expect(errorSpy).toHaveBeenCalledWith('[renderer:connections.refreshFailed]', {
            connectionId: 'conn-1',
            error: { message: 'network down' },
        });
    });

    it('supports debug and info logging branches without context', () => {
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
        const featureLogger = createFeatureLogger('viewer');

        featureLogger.debug('selectionChanged');
        featureLogger.info('queryApplied');
        logRendererEvent('info', 'app.ready');

        if (import.meta.env.DEV) {
            expect(debugSpy).toHaveBeenCalledWith('[renderer:viewer.selectionChanged]');
            expect(infoSpy).toHaveBeenCalledWith('[renderer:viewer.queryApplied]');
            expect(infoSpy).toHaveBeenCalledWith('[renderer:app.ready]');
        } else {
            expect(debugSpy).not.toHaveBeenCalled();
        }
    });
});
