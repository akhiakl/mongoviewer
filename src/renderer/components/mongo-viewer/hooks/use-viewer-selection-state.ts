import { useEffect, useState } from 'react';

import type { DatabaseTreeItem, Selection } from '@/renderer/components/mongo-viewer/types';

function pickSelection(tree: DatabaseTreeItem[], current: Selection | null) {
    if (current) {
        const matchingDatabase = tree.find((database) => database.name === current.db);
        if (matchingDatabase?.collections.includes(current.collection)) {
            return current;
        }
    }

    for (const database of tree) {
        if (database.collections.length > 0) {
            return {
                db: database.name,
                collection: database.collections[0],
            };
        }
    }

    return null;
}

type UseViewerSelectionStateOptions = {
    connectionId: string;
    initialSelection: Selection | null;
    tree: DatabaseTreeItem[];
    onSelectionPersist: (selection: Selection | null) => void;
};

export function useViewerSelectionState({
    connectionId,
    initialSelection,
    tree,
    onSelectionPersist,
}: UseViewerSelectionStateOptions) {
    const [selection, setSelection] = useState<Selection | null>(initialSelection);

    useEffect(() => {
        setSelection(initialSelection);
    }, [connectionId, initialSelection]);

    useEffect(() => {
        setSelection((current) => {
            const nextSelection = pickSelection(tree, current ?? initialSelection);

            if (
                nextSelection?.db === current?.db &&
                nextSelection?.collection === current?.collection
            ) {
                return current;
            }

            return nextSelection;
        });
    }, [initialSelection, tree]);

    useEffect(() => {
        onSelectionPersist(selection);
    }, [onSelectionPersist, selection]);

    return {
        selection,
        setSelection,
    };
}
