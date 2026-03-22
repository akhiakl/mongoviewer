import type { SubmitEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useState } from 'react';
import { TlsCertificateSection } from './tls-certificate-section';
import QueryParamsSection, { COMMON_QUERY_PARAMS } from './query-params-secton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDownIcon } from 'lucide-react';



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
    const [paramValues, setParamValues] = useState<Record<string, string>>({});

    // Sync displayed value with prop changes (e.g., after save/reset)
    // Bidirectional sync: when connectionString changes, update paramValues; when paramValues change, update connectionString
    React.useEffect(() => {
        setDisplayedConnectionString(connectionString);
        // Parse params from connection string
        try {
            const url = new URL(connectionString);
            const params: Record<string, string> = {};
            COMMON_QUERY_PARAMS.forEach(({ key }) => {
                const val = url.searchParams.get(key);
                if (val !== null) params[key] = val;
            });
            setParamValues(params);
        } catch {
            setParamValues({});
        }
    }, [connectionString]);

    // When paramValues change (from UI), update connection string
    React.useEffect(() => {
        // Only update if paramValues changed from UI, not from connectionString prop
        // Avoid infinite loop by checking if paramValues match connectionString
        try {
            const url = new URL(displayedConnectionString || 'mongodb://localhost:27017');
            let changed = false;
            COMMON_QUERY_PARAMS.forEach(({ key }) => {
                const val = url.searchParams.get(key);
                if ((val ?? '') !== (paramValues[key] ?? '')) changed = true;
            });
            if (changed) {
                // Remove all common params first
                COMMON_QUERY_PARAMS.forEach(({ key }) => url.searchParams.delete(key));
                // Add back non-empty params
                Object.entries(paramValues).forEach(([k, v]) => {
                    if (v && v.trim() !== '') url.searchParams.set(k, v);
                });
                const updated = url.toString();
                setDisplayedConnectionString(updated);
                onConnectionStringChange(updated);
            }
        } catch {
            // fallback: do nothing
        }
        // (removed unnecessary eslint-disable)
    }, [paramValues]);
    // TLS enabled state is derived from paramValues
    const tlsEnabled = paramValues['tls'] === 'true';
    // Helper to update the connection string with new params

    // Basic MongoDB connection string validation
    function validateConnectionString(str: string): string | null {
        if (!str.trim()) return 'Connection string is required.';
        if (!/^mongodb(\+srv)?:\/\//.test(str.trim())) return 'Must start with mongodb:// or mongodb+srv://';
        try {
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
        // Parse params from new string and update paramValues
        try {
            const url = new URL(value);
            const params: Record<string, string> = {};
            COMMON_QUERY_PARAMS.forEach(({ key }) => {
                const val = url.searchParams.get(key);
                if (val !== null) params[key] = val;
            });
            setParamValues(params);
        } catch {
            setParamValues({});
        }
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

    // Mask TLS certificate path in connection string for display
    function maskTlsCertPathInConnectionString(str: string): string {
        try {
            const url = new URL(str);
            // If tlsCertificatePath is present in string, replace with <path to filename.pem>
            if (tlsCertificatePath && url.toString().includes(tlsCertificatePath)) {
                const fileName = tlsCertificatePath.split(/[/\\]/).pop();
                return url.toString().replace(tlsCertificatePath, `<path to ${fileName}>`);
            }
            return url.toString();
        } catch {
            return str;
        }
    }

    const passwordInString = extractPassword(displayedConnectionString);

    return (
        <TooltipProvider>
            <Card className="flex h-full min-h-0 w-full flex-col overflow-y-auto">
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
                        <div>
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
                                value={passwordInString && !showPassword
                                    ? maskPassword(maskTlsCertPathInConnectionString(displayedConnectionString))
                                    : maskTlsCertPathInConnectionString(displayedConnectionString)}
                                onChange={(event) => handleConnectionStringChange(event.target.value)}
                                className="min-h-24"
                                placeholder="mongodb://user:password@host:27017/?replicaSet=rs0"
                                aria-invalid={!!connectionStringError}
                            />
                            {connectionStringError && (
                                <p className="text-xs text-destructive">{connectionStringError}</p>
                            )}
                        </div>

                        {/* Query params section at the bottom */}
                        <div className="space-y-1.5 mt-4">
                            <Collapsible className="data-[state=open]:bg-muted">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="group w-full">
                                        <span className="group-data-[state=open]:hidden">Show</span>
                                        <span className="hidden group-data-[state=open]:inline">Hide</span>
                                        <span className="ml-px">Common Query Parameters</span>
                                        <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent >
                                    <QueryParamsSection paramValues={paramValues} setParamValues={setParamValues} />
                                </CollapsibleContent>
                            </Collapsible>
                            {/* TLS Certificate section, only if TLS is enabled */}
                            {tlsEnabled && (
                                <TlsCertificateSection
                                    tlsCertificatePath={tlsCertificatePath}
                                    onTlsCertificatePathChange={onTlsCertificatePathChange}
                                    onPickTlsCertificate={onPickTlsCertificate}
                                />
                            )}
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
