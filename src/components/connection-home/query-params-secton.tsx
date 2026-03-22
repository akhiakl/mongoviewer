import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// List of common MongoDB query parameters
export const COMMON_QUERY_PARAMS = [
    { key: 'authSource', label: 'authSource', placeholder: 'admin', type: 'text' },
    { key: 'replicaSet', label: 'replicaSet', placeholder: 'rs0', type: 'text' },
    { key: 'tls', label: 'tls', type: 'toggle' },
    { key: 'readPreference', label: 'readPreference', placeholder: 'primary/secondary', type: 'text' },
    { key: 'w', label: 'w', placeholder: '1/majority', type: 'text' },
    { key: 'retryWrites', label: 'retryWrites', placeholder: 'true/false', type: 'text' },
    { key: 'connectTimeoutMS', label: 'connectTimeoutMS', placeholder: '10000', type: 'number' },
    { key: 'socketTimeoutMS', label: 'socketTimeoutMS', placeholder: '10000', type: 'number' },
    { key: 'maxPoolSize', label: 'maxPoolSize', placeholder: '10', type: 'number' },
    { key: 'appName', label: 'appName', placeholder: 'MyApp', type: 'text' },
];

type QueryParamsSectionProps = {
    paramValues: Record<string, string>;
    setParamValues: (params: Record<string, string>) => void;
}

const QueryParamsSection = ({ paramValues, setParamValues }: QueryParamsSectionProps) => {
    function handleParamChange(key: string, value: string) {
        const newParams = { ...paramValues, [key]: value };
        setParamValues(newParams);
    }

    return (
        <div className="mb-2 p-3 flex flex-col gap-2">
            {COMMON_QUERY_PARAMS.map(({ key, label, placeholder, type }) => (
                <div key={key} className="flex items-center gap-2">
                    <Label htmlFor={`param-${key}`} className="w-36">{label}</Label>
                    {type === 'toggle' ? (
                        <input
                            id={`param-${key}`}
                            type="checkbox"
                            checked={paramValues[key] === 'true'}
                            onChange={e => handleParamChange(key, e.target.checked ? 'true' : '')}
                            className="size-4 accent-primary"
                        />
                    ) : (
                        <Input
                            id={`param-${key}`}
                            type={type}
                            value={paramValues[key] ?? ''}
                            placeholder={placeholder}
                            onChange={e => handleParamChange(key, e.target.value)}
                            className="flex-1"
                        />
                    )}
                </div>
            ))}
            <p className="text-xs text-muted-foreground mt-1">These will be added to the connection string as query parameters.</p>
        </div>
    )
}

export default QueryParamsSection