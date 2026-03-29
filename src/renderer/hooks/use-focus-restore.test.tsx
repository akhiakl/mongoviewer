import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFocusRestore } from '@/renderer/hooks/use-focus-restore';

describe('useFocusRestore', () => {
    it('tracks the last focused editable element and restores focus', () => {
        const input = document.createElement('input');
        const focusSpy = vi.spyOn(input, 'focus');
        document.body.appendChild(input);

        const { result } = renderHook(() => useFocusRestore());

        act(() => {
            input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        act(() => {
            result.current.restoreFocus();
        });

        expect(result.current.lastFocused.current).toBe(input);
        expect(focusSpy).toHaveBeenCalledTimes(1);
        document.body.removeChild(input);
    });

    it('ignores non-editable targets and runs callbacks after restoring focus', () => {
        vi.useFakeTimers();

        const input = document.createElement('textarea');
        const div = document.createElement('div');
        const focusSpy = vi.spyOn(input, 'focus');
        document.body.appendChild(input);
        document.body.appendChild(div);

        const callback = vi.fn();
        const { result } = renderHook(() => useFocusRestore());

        act(() => {
            input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
            div.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        act(() => {
            result.current.runWithFocus(callback);
            vi.runAllTimers();
        });

        expect(result.current.lastFocused.current).toBe(input);
        expect(focusSpy).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);

        document.body.removeChild(input);
        document.body.removeChild(div);
        vi.useRealTimers();
    });
});
