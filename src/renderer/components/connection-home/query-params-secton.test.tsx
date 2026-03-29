import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/renderer/components/ui/field', () => ({
    Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor}>{children}</label>,
    FieldSet: ({ children }: { children: React.ReactNode }) => <fieldset>{children}</fieldset>,
}));

vi.mock('@/renderer/components/ui/input', () => ({
    Input: ({
        onChange,
        placeholder,
        type,
        value,
    }: {
        onChange?: (event: { target: { value: string } }) => void;
        placeholder?: string;
        type?: string;
        value?: string;
    }) => (
        <input
            aria-label={placeholder ?? type ?? 'input'}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={(event) => onChange?.({ target: { value: event.target.value } })}
        />
    ),
}));

vi.mock('@/renderer/components/ui/switch', () => ({
    Switch: ({
        checked,
        onCheckedChange,
    }: {
        checked: boolean;
        onCheckedChange?: (checked: boolean) => void;
    }) => (
        <button type="button" aria-pressed={checked} onClick={() => onCheckedChange?.(!checked)}>
            Toggle
        </button>
    ),
}));

vi.mock('@/renderer/components/ui/select', () => ({
    Select: ({
        children,
        onValueChange,
    }: {
        children: React.ReactNode;
        onValueChange?: (value: string) => void;
    }) => <div data-select="" onClick={() => onValueChange?.('secondary')}>{children}</div>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

import QueryParamsSection from '@/renderer/components/connection-home/query-params-secton';

describe('QueryParamsSection', () => {
    it('updates text and number params', () => {
        const setParamValues = vi.fn();

        render(<QueryParamsSection paramValues={{}} setParamValues={setParamValues} />);

        fireEvent.change(screen.getByLabelText('admin'), { target: { value: 'usersDb' } });
        fireEvent.change(screen.getAllByLabelText('10000')[0], { target: { value: '2500' } });

        expect(setParamValues).toHaveBeenCalledWith({ authSource: 'usersDb' });
        expect(setParamValues).toHaveBeenCalledWith({ connectTimeoutMS: '2500' });
    });

    it('updates toggle and select params', () => {
        const setParamValues = vi.fn();

        render(<QueryParamsSection paramValues={{ tls: '', readPreference: '' }} setParamValues={setParamValues} />);

        fireEvent.click(screen.getAllByRole('button', { name: 'Toggle' })[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Select readPreference' }).parentElement as HTMLElement);

        expect(setParamValues).toHaveBeenCalledWith({ tls: 'true', readPreference: '' });
        expect(setParamValues).toHaveBeenCalledWith({ tls: '', readPreference: 'secondary' });
    });
});
