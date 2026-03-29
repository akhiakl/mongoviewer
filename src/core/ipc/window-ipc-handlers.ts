import type { IpcHandlerMap } from '@/shared/types';
import { setWindowThemePreference, type ThemePreference } from '../window-theme-service';

export const windowHandlers = {
    'window:set-theme-preference': async (_event, themePreference: ThemePreference) => {
        if (
            themePreference !== 'system' &&
            themePreference !== 'light' &&
            themePreference !== 'dark'
        ) {
            throw new Error('Theme preference must be system, light, or dark.');
        }

        setWindowThemePreference(themePreference);
    },
} satisfies IpcHandlerMap<'window'>;
