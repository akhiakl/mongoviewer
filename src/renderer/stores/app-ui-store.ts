import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppUiState = {
    themePreference: ThemePreference;
    sidebarOpen: boolean;
    queryHistoryOpen: boolean;
    schemaPanelOpen: boolean;
    setThemePreference: (themePreference: ThemePreference) => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setQueryHistoryOpen: (open: boolean) => void;
    toggleQueryHistory: () => void;
    setSchemaPanelOpen: (open: boolean) => void;
    toggleSchemaPanel: () => void;
};

export const APP_UI_STORAGE_KEY = 'mongoviewer-app-ui';

function getDefaultState() {
    return {
        themePreference: 'system' as ThemePreference,
        sidebarOpen: true,
        queryHistoryOpen: false,
        schemaPanelOpen: false,
    };
}

export function getStoredThemePreference(): ThemePreference {
    if (typeof window === 'undefined') {
        return 'system';
    }

    try {
        const raw = window.localStorage.getItem(APP_UI_STORAGE_KEY);
        if (!raw) {
            return 'system';
        }

        const parsed = JSON.parse(raw) as {
            state?: { themePreference?: ThemePreference };
        };
        const themePreference = parsed.state?.themePreference;

        if (
            themePreference === 'system' ||
            themePreference === 'light' ||
            themePreference === 'dark'
        ) {
            return themePreference;
        }
    } catch {
        return 'system';
    }

    return 'system';
}

export const useAppUiStore = create<AppUiState>()(
    persist(
        (set) => ({
            ...getDefaultState(),
            setThemePreference: (themePreference) => set({ themePreference }),
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setQueryHistoryOpen: (queryHistoryOpen) => set({ queryHistoryOpen }),
            toggleQueryHistory: () =>
                set((state) => ({ queryHistoryOpen: !state.queryHistoryOpen })),
            setSchemaPanelOpen: (schemaPanelOpen) => set({ schemaPanelOpen }),
            toggleSchemaPanel: () =>
                set((state) => ({ schemaPanelOpen: !state.schemaPanelOpen })),
        }),
        {
            name: APP_UI_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                themePreference: state.themePreference,
            }),
        },
    ),
);

export const selectThemePreference = (state: AppUiState) => state.themePreference;
export const selectSidebarOpen = (state: AppUiState) => state.sidebarOpen;
export const selectQueryHistoryOpen = (state: AppUiState) => state.queryHistoryOpen;
export const selectSchemaPanelOpen = (state: AppUiState) => state.schemaPanelOpen;
