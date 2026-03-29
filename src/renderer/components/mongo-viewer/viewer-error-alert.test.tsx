import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ViewerErrorAlert } from '@/renderer/components/mongo-viewer/viewer-error-alert';

describe('ViewerErrorAlert', () => {
    it('renders retry and clear actions when a query is active', () => {
        const onReconnect = vi.fn();
        const onResetQuery = vi.fn();

        render(
            <ViewerErrorAlert
                title="Connection failed"
                detail="Timed out"
                hint="Check network access"
                hasActiveMongoQuery={true}
                onReconnect={onReconnect}
                onResetQuery={onResetQuery}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Retry Connection' }));
        fireEvent.click(screen.getByRole('button', { name: 'Clear Query' }));

        expect(onReconnect).toHaveBeenCalledTimes(1);
        expect(onResetQuery).toHaveBeenCalledTimes(1);
    });

    it('hides clear query when there is no active query', () => {
        render(
            <ViewerErrorAlert
                title="Connection failed"
                detail="Timed out"
                hint="Check network access"
                hasActiveMongoQuery={false}
                onReconnect={vi.fn()}
                onResetQuery={vi.fn()}
            />,
        );

        expect(screen.queryByRole('button', { name: 'Clear Query' })).not.toBeInTheDocument();
    });
});
