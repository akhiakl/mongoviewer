import { beforeEach, describe, expect, it } from 'vitest';

import {
    APP_UI_STORAGE_KEY,
    getStoredThemePreference,
    useAppUiStore,
} from '@/renderer/stores/app-ui-store';

describe('app-ui-store', () => {
    beforeEach(() => {
        window.localStorage.clear();
        useAppUiStore.setState({
            themePreference: 'system',
            queryHistoryOpen: false,
            schemaPanelOpen: false,
        });
    });

    it('reads valid stored theme preferences and falls back safely', () => {
        expect(getStoredThemePreference()).toBe('system');

        window.localStorage.setItem(
            APP_UI_STORAGE_KEY,
            JSON.stringify({
                state: {
                    themePreference: 'dark',
                },
                version: 0,
            }),
        );

        expect(getStoredThemePreference()).toBe('dark');

        window.localStorage.setItem(APP_UI_STORAGE_KEY, '{"state":{"themePreference":"unknown"}}');
        expect(getStoredThemePreference()).toBe('system');

        window.localStorage.setItem(APP_UI_STORAGE_KEY, JSON.stringify({}));
        expect(getStoredThemePreference()).toBe('system');

        window.localStorage.setItem(APP_UI_STORAGE_KEY, '{not-json');
        expect(getStoredThemePreference()).toBe('system');
    });

    it('toggles shared ui flags through store actions', () => {
        const state = useAppUiStore.getState();

        state.setThemePreference('light');
        state.toggleQueryHistory();
        state.toggleSchemaPanel();
        state.setQueryHistoryOpen(false);
        state.setSchemaPanelOpen(false);

        expect(useAppUiStore.getState().themePreference).toBe('light');
        expect(useAppUiStore.getState().queryHistoryOpen).toBe(false);
        expect(useAppUiStore.getState().schemaPanelOpen).toBe(false);
    });
});
