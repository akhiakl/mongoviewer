import type { SubmitEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ConnectionCreateFormProps = {
    name: string;
    connectionString: string;
    tlsCertificatePath: string;
    saving: boolean;
    error: string | null;
    onNameChange: (value: string) => void;
    onConnectionStringChange: (value: string) => void;
    onTlsCertificatePathChange: (value: string) => void;
    onPickTlsCertificate: () => Promise<void>;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
};

export function ConnectionCreateForm({
    name,
    connectionString,
    tlsCertificatePath,
    saving,
    error,
    onNameChange,
    onConnectionStringChange,
    onTlsCertificatePathChange,
    onPickTlsCertificate,
    onSubmit,
}: ConnectionCreateFormProps) {
    return (
        <Card className="w-full lg:max-w-2xl">
            <CardHeader>
                <CardTitle>Create New Connection</CardTitle>
                <CardDescription>
                    Save connections and inspect live MongoDB collections.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        void onSubmit(event);
                    }}
                    className="mt-5 space-y-4"
                >
                    <div className="space-y-1.5">
                        <Label htmlFor="connection-name">Connection name</Label>
                        <Input
                            id="connection-name"
                            required
                            value={name}
                            onChange={(event) => onNameChange(event.target.value)}
                            placeholder="Prod cluster"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="connection-string">Connection string</Label>
                        <Textarea
                            id="connection-string"
                            required
                            value={connectionString}
                            onChange={(event) => onConnectionStringChange(event.target.value)}
                            className="min-h-24"
                            placeholder="mongodb://user:password@host:27017/?replicaSet=rs0"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="tls-certificate-path">TLS certificate file (optional)</Label>
                            <div className="flex items-center gap-2">
                                {tlsCertificatePath ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onTlsCertificatePathChange('')}
                                    >
                                        Clear
                                    </Button>
                                ) : null}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        void onPickTlsCertificate();
                                    }}
                                >
                                    Choose File
                                </Button>
                            </div>
                        </div>
                        <Input
                            id="tls-certificate-path"
                            value={tlsCertificatePath}
                            readOnly
                            placeholder="No file selected"
                        />
                        <p className="text-xs text-muted-foreground">
                            The selected certificate is copied into app storage with a unique file name.
                        </p>
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Connection'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
