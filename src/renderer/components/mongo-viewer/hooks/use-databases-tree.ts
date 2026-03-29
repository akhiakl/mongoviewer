import { useEffect, useState } from 'react';

import type { DatabaseTreeItem } from '@/renderer/components/mongo-viewer/types';
import { mongoViewer } from '@/renderer/renderer-api';

export function useDatabasesTree(connectionId: string) {
    const [tree, setTree] = useState<DatabaseTreeItem[]>([]);
    const [loadingTree, setLoadingTree] = useState(false);
    const [treeError, setTreeError] = useState<string | null>(null);

    useEffect(() => {
        void refreshTree();
    }, [connectionId]);

    async function refreshTree() {
        setLoadingTree(true);
        setTreeError(null);

        try {
            const nextTree = await mongoViewer.listDatabaseTree(connectionId);
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
