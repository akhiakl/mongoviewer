import { Alert, AlertDescription } from '@/renderer/components/ui/alert';
import { Button } from '@/renderer/components/ui/button';

type ViewerErrorAlertProps = {
    title: string;
    detail: string;
    hint: string;
    hasActiveMongoQuery: boolean;
    onReconnect: () => void;
    onResetQuery: () => void;
};

export function ViewerErrorAlert({
    title,
    detail,
    hint,
    hasActiveMongoQuery,
    onReconnect,
    onResetQuery,
}: ViewerErrorAlertProps) {
    return (
        <div className="px-4 md:px-6">
            <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                    <div className="space-y-2">
                        <p className="font-medium">{title}</p>
                        <p>{detail}</p>
                        <p className="text-xs text-destructive/90">{hint}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="link" size="sm" className="h-auto px-0" onClick={onReconnect}>
                                Retry Connection
                            </Button>
                            {hasActiveMongoQuery ? (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto px-0"
                                    onClick={onResetQuery}
                                >
                                    Clear Query
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}
