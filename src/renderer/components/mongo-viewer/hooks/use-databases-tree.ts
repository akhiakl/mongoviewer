import { useEffect, useState } from 'react';

import type { DatabaseTreeItem } from '@/renderer/components/mongo-viewer/types';
import { mongoViewerService } from '@/renderer/services/mongo-viewer-service';

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
            const nextTree = await mongoViewerService.listDatabaseTree(connectionId);
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
