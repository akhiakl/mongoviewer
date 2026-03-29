import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Selection } from '@/renderer/components/mongo-viewer/types';
import type { ViewMode } from '@/renderer/components/mongo-viewer/types';

export type ViewerPreferences = {
    pageSize: number;
    viewMode: ViewMode;
    lastSelection: Selection | null;
    showInsights: boolean;
};

type ViewerPreferencesStoreState = {
    preferencesByConnection: Record<string, ViewerPreferences>;
    setPreferences: (connectionId: string, nextPreferences: Partial<ViewerPreferences>) => void;
    getPreferences: (connectionId: string) => ViewerPreferences;
};

const VIEWER_PREFERENCES_STORAGE_KEY = 'mongoviewer-viewer-preferences';

export const DEFAULT_VIEWER_PREFERENCES: ViewerPreferences = {
    pageSize: 50,
    viewMode: 'table',
    lastSelection: null,
    showInsights: false,
};

function shallowEqualPreferences(left: ViewerPreferences, right: ViewerPreferences) {
    return (
        left.pageSize === right.pageSize &&
        left.viewMode === right.viewMode &&
        left.showInsights === right.showInsights &&
        left.lastSelection?.db === right.lastSelection?.db &&
        left.lastSelection?.collection === right.lastSelection?.collection
    );
}

export const useViewerPreferencesStore = create<ViewerPreferencesStoreState>()(
    persist(
        (set, get) => ({
            preferencesByConnection: {},
            setPreferences: (connectionId, nextPreferences) => {
                const currentPreferences = get().getPreferences(connectionId);
                const mergedPreferences = {
                    ...currentPreferences,
                    ...nextPreferences,
                };

                if (shallowEqualPreferences(currentPreferences, mergedPreferences)) {
                    return;
                }

                set((state) => ({
                    preferencesByConnection: {
                        ...state.preferencesByConnection,
                        [connectionId]: mergedPreferences,
                    },
                }));
            },
            getPreferences: (connectionId) => ({
                ...DEFAULT_VIEWER_PREFERENCES,
                ...get().preferencesByConnection[connectionId],
            }),
        }),
        {
            name: VIEWER_PREFERENCES_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const selectViewerPreferences =
    (connectionId: string) => (state: ViewerPreferencesStoreState) => ({
        ...DEFAULT_VIEWER_PREFERENCES,
        ...state.preferencesByConnection[connectionId],
    });
