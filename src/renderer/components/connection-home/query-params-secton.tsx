import { Input } from "@/renderer/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/renderer/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { Switch } from "@/renderer/components/ui/switch";

// List of common MongoDB query parameters
export const COMMON_QUERY_PARAMS = [
    { key: 'authSource', label: 'authSource', placeholder: 'admin', type: 'text' },
    { key: 'replicaSet', label: 'replicaSet', placeholder: 'rs0', type: 'text' },
    { key: 'tls', label: 'tls', type: 'toggle' },
    { key: 'readPreference', label: 'readPreference', placeholder: 'primary/secondary', type: 'select', options: ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'] },
    { key: 'w', label: 'w', placeholder: '1/majority', type: 'text' },
    { key: 'retryWrites', label: 'retryWrites', type: 'toggle' },
    { key: 'connectTimeoutMS', label: 'connectTimeoutMS', placeholder: '10000', type: 'number' },
    { key: 'socketTimeoutMS', label: 'socketTimeoutMS', placeholder: '10000', type: 'number' },
    { key: 'maxPoolSize', label: 'maxPoolSize', placeholder: '10', type: 'number' },
    { key: 'appName', label: 'appName', placeholder: 'MyApp', type: 'text' },
];

type QueryParamsSectionProps = {
    paramValues: Record<string, string>;
    setParamValues: (params: Record<string, string>) => void;
}

type FormItemRendererProps = {
    param: typeof COMMON_QUERY_PARAMS[number];
    value: string;
    onChange: (value: string) => void;
}

const FormItemRenderer = ({ param, value, onChange }: FormItemRendererProps) => {
    switch (param.type) {
        case 'toggle':
            return (
                <Switch
                    checked={value === 'true'}
                    onCheckedChange={e => onChange(e ? 'true' : '')}
                />
            );
        case 'select':
            return (
                <Select onValueChange={value => onChange(value === 'none' ? '' : value)}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder={`Select ${param.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{param.label}</SelectLabel>
                            <SelectItem value="none">None</SelectItem>
                            {param.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            );
        case 'number':
            return (
                <Input
                    type="number"
                    value={value}
                    placeholder={param.placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1"
                />
            );
        default:
            return (
                <Input
                    type="text"
                    value={value}
                    placeholder={param.placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1"
                />
            );
    }
}

const QueryParamsSection = ({ paramValues, setParamValues }: QueryParamsSectionProps) => {
    function handleParamChange(key: string, value: string) {
        const newParams = { ...paramValues, [key]: value };
        setParamValues(newParams);
    }

    return (
        <FieldSet className="mb-2 p-3 w-full max-w-lg">
            <FieldGroup>
                {COMMON_QUERY_PARAMS.map((param) => (
                    <Field key={param.key} orientation="horizontal">
                        <FieldLabel htmlFor={`param-${param.key}`} className="w-36">{param.label}</FieldLabel>
                        <FormItemRenderer
                            param={param}
                            value={paramValues[param.key] || ''}
                            onChange={(value) => handleParamChange(param.key, value)}
                        />
                    </Field>
                ))}
            </FieldGroup>
            <p className="text-xs text-muted-foreground mt-1">These will be added to the connection string as query parameters.</p>
        </FieldSet>
    )
}

export default QueryParamsSection