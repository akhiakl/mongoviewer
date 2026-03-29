import { Copy, Check, Edit2, Trash2 } from 'lucide-react';
import { ButtonGroup } from '@/renderer/components/ui/button-group';
import { Button } from '@/renderer/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/renderer/components/ui/card';
import type { ConnectionListItem } from '@/shared/mongo-types';
import { Link } from "react-router";

type ConnectionCardProps = {
    connection: ConnectionListItem;
    isCopied: boolean;
    onCopy: (connString: string, id: string) => void;
    onEdit: (connection: ConnectionListItem) => void;
    onDelete: (id: string, name: string) => void;
};

const getConnectionDetails = (uri: string) => {
    try {
        const url = new URL(uri);
        return `${url.hostname}:${url.port}`;
    } catch {
        return 'Invalid URI';
    }
};

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}


const ConnectionCard = ({
    connection,
    isCopied,
    onCopy,
    onEdit,
    onDelete,
}: ConnectionCardProps) => {
    return (
        <Card className="group hover:border-primary/50 transition">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle>{connection.name}</CardTitle>
                        <CardDescription className="mt-2">
                            <p>{getConnectionDetails(connection.uri)}</p>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 transition">
                        <ButtonGroup>
                            <Button
                                onClick={() => onCopy(connection.uri, connection.id)}
                                variant="ghost"
                                size="icon"
                                title="Copy connection string"
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 text-primary" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                onClick={() => onEdit(connection)}
                                variant="ghost"
                                size="icon"
                                title="Edit connection"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => onDelete(connection.id, connection.name)}
                                variant="destructive"
                                size="icon"
                                title="Delete connection"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </CardHeader>

            <CardFooter className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                    Created {timeAgo(connection.createdAt)}
                </p>
                <Button
                    variant="default"
                    size="sm"
                    asChild
                >
                    <Link to={`/connections/${connection.id}`} >
                        Connect
                    </Link >
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ConnectionCard;
