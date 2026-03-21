import type { SubmitEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useState } from 'react';

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
    const [showPassword, setShowPassword] = useState(false);
    const [connectionStringError, setConnectionStringError] = useState<string | null>(null);
    const [displayedConnectionString, setDisplayedConnectionString] = useState(connectionString);

    // Sync displayed value with prop changes (e.g., after save/reset)
    React.useEffect(() => {
        setDisplayedConnectionString(connectionString);
    }, [connectionString]);

    // Basic MongoDB connection string validation
    function validateConnectionString(str: string): string | null {
        if (!str.trim()) return 'Connection string is required.';
        if (!/^mongodb(\+srv)?:\/\//.test(str.trim())) return 'Must start with mongodb:// or mongodb+srv://';
        try {
            // eslint-disable-next-line no-new
            new URL(str.trim());
        } catch {
            return 'Invalid connection string format.';
        }
        return null;
    }

    function handleConnectionStringChange(value: string) {
        setDisplayedConnectionString(value);
        onConnectionStringChange(value);
        setConnectionStringError(validateConnectionString(value));
    }

    // Extract password from connection string for toggle
    function extractPassword(str: string): string | null {
        try {
            const url = new URL(str);
            return url.password || null;
        } catch {
            return null;
        }
    }

    function togglePasswordVisibility() {
        setShowPassword((v) => !v);
    }

    // Replace password in connection string with asterisks if hidden
    function maskPassword(str: string): string {
        try {
            const url = new URL(str);
            if (!url.password) return str;
            url.password = '*'.repeat(url.password.length);
            return url.toString();
        } catch {
            return str;
        }
    }

    const passwordInString = extractPassword(displayedConnectionString);

    return (
        <TooltipProvider>
            <Card className="flex h-full min-h-0 w-full flex-col">
                <CardHeader className="pb-4">
                    <CardTitle>Create New Connection</CardTitle>
                    <CardDescription>
                        Save connections and inspect live MongoDB collections.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <form
                        onSubmit={(event) => {
                            void onSubmit(event);
                        }}
                        className="flex h-full flex-col gap-4"
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="connection-name">Connection name</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-pointer text-muted-foreground">ⓘ</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        A friendly name for this connection profile.
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                id="connection-name"
                                required
                                value={name}
                                onChange={(event) => onNameChange(event.target.value)}
                                placeholder="Prod cluster"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="connection-string">Connection string</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-pointer text-muted-foreground">ⓘ</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        MongoDB URI. <a href="https://www.mongodb.com/docs/manual/reference/connection-string/" target="_blank" rel="noopener noreferrer" className="underline">Learn more</a>.
                                    </TooltipContent>
                                </Tooltip>
                                {passwordInString && (
                                    <Button
                                        type="button"
                                        size="xs"
                                        variant="ghost"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="ml-2"
                                    >
                                        {showPassword ? 'Hide Password' : 'Show Password'}
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                id="connection-string"
                                required
                                value={passwordInString && !showPassword ? maskPassword(displayedConnectionString) : displayedConnectionString}
                                onChange={(event) => handleConnectionStringChange(event.target.value)}
                                className="min-h-24"
                                placeholder="mongodb://user:password@host:27017/?replicaSet=rs0"
                                aria-invalid={!!connectionStringError}
                            />
                            {connectionStringError && (
                                <p className="text-xs text-destructive">{connectionStringError}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="tls-certificate-path">TLS certificate file (optional)</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-pointer text-muted-foreground">ⓘ</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            PEM file for secure connections. Only needed for self-signed or custom CAs.
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
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

                        <div className="mt-auto flex items-center justify-end">
                            <Button type="submit" disabled={saving || !!connectionStringError}>
                                {saving ? 'Saving...' : 'Save Connection'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
