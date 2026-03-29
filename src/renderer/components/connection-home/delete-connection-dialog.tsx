import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/renderer/components/ui/dialog';
import { Button } from '@/renderer/components/ui/button';

type DeleteConnectionDialogProps = {
    connectionName: string | null;
    open: boolean;
    deleting: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function DeleteConnectionDialog({
    connectionName,
    open,
    deleting,
    error,
    onOpenChange,
    onConfirm,
}: DeleteConnectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[min(92vw,30rem)]">
                <DialogHeader className="p-0">
                    <DialogTitle>Delete saved connection</DialogTitle>
                    <DialogDescription>
                        {connectionName
                            ? `This removes ${connectionName} from the local workspace.`
                            : 'This removes the saved connection from the local workspace.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        The saved profile and any stored TLS certificate path attached to it will be removed.
                    </p>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Connection'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
