import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/renderer/components/ui/alert';
import { Badge } from '@/renderer/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/renderer/components/ui/card';

describe('ui primitives', () => {
    it('renders all alert slots', () => {
        render(
            <Alert variant="destructive">
                <AlertTitle>Problem</AlertTitle>
                <AlertDescription>Something went wrong</AlertDescription>
                <AlertAction>Retry</AlertAction>
            </Alert>,
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Problem')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('renders badge variants', () => {
        render(
            <>
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
            </>,
        );

        expect(screen.getByText('Default')).toBeInTheDocument();
        expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('renders card slots including action and footer', () => {
        render(
            <Card size="sm">
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                    <CardDescription>Description</CardDescription>
                    <CardAction>Action</CardAction>
                </CardHeader>
                <CardContent>Content</CardContent>
                <CardFooter>Footer</CardFooter>
            </Card>,
        );

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });
});
