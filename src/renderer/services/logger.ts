export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown> | undefined;

function shouldLog(level: LogLevel) {
    return level === 'error' || level === 'warn' || import.meta.env.DEV;
}

function getConsoleMethod(level: LogLevel) {
    switch (level) {
        case 'debug':
            return console.debug;
        case 'info':
            return console.info;
        case 'warn':
            return console.warn;
        case 'error':
        default:
            return console.error;
    }
}

export function logRendererEvent(level: LogLevel, event: string, context?: LogContext) {
    if (!shouldLog(level)) {
        return;
    }

    const method = getConsoleMethod(level);
    if (context && Object.keys(context).length > 0) {
        method(`[renderer:${event}]`, context);
        return;
    }

    method(`[renderer:${event}]`);
}

export function logRendererError(
    event: string,
    error: unknown,
    context?: LogContext,
) {
    const normalizedError =
        error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            }
            : { message: String(error) };

    logRendererEvent('error', event, {
        ...context,
        error: normalizedError,
    });
}

export function createFeatureLogger(scope: string) {
    return {
        debug: (event: string, context?: LogContext) =>
            logRendererEvent('debug', `${scope}.${event}`, context),
        info: (event: string, context?: LogContext) =>
            logRendererEvent('info', `${scope}.${event}`, context),
        warn: (event: string, context?: LogContext) =>
            logRendererEvent('warn', `${scope}.${event}`, context),
        error: (event: string, error: unknown, context?: LogContext) =>
            logRendererError(`${scope}.${event}`, error, context),
    };
}
