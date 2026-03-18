import { useEffect, useState } from 'react';

import type { DatabaseTreeItem } from '@/components/mongo-viewer/types';
import { mongoViewer } from '@/lib/renderer-api';

export function useDatabasesTree(activeConnectionId: string | null) {
    const [tree, setTree] = useState<DatabaseTreeItem[]>([]);
    const [loadingTree, setLoadingTree] = useState(false);
    const [treeError, setTreeError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeConnectionId) {
            setTree([]);
            setTreeError(null);
            setLoadingTree(false);
            return;
        }

        void refreshTree();
    }, [activeConnectionId]);

    async function refreshTree() {
        if (!activeConnectionId) {
            setTree([]);
            setTreeError(null);
            return;
        }

        setLoadingTree(true);
        setTreeError(null);

        try {
            const nextTree = await mongoViewer.listDatabaseTree();
            setTree(nextTree);
        } catch (error) {
            setTree([]);
            setTreeError(error instanceof Error ? error.message : 'Unable to load databases.');
        } finally {
            setLoadingTree(false);
        }
    }

    return {
        tree,
        loadingTree,
        treeError,
        refreshTree,
    };
}