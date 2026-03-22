import { useEffect, useRef, useCallback } from "react";

const isEditable = (el: EventTarget | null): el is HTMLElement => {
    return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement)?.isContentEditable
    );
};

export function useFocusRestore() {
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    // Track last focused editable element
    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            if (isEditable(e.target)) {
                lastFocusedRef.current = e.target as HTMLElement;
            }
        };

        window.addEventListener("focusin", handleFocus);
        return () => window.removeEventListener("focusin", handleFocus);
    }, []);

    // Restore focus to last known editable element
    const restoreFocus = useCallback(() => {
        const el = lastFocusedRef.current;
        if (el && document.contains(el)) {
            el.focus();
        }
    }, []);

    /**
     * Helper to run a command safely after restoring focus
     * Useful for paste / undo / redo etc.
     */
    const runWithFocus = useCallback(
        (fn: () => void | Promise<void>) => {
            restoreFocus();

            // let browser apply focus before executing
            setTimeout(() => {
                fn();
            }, 0);
        },
        [restoreFocus]
    );

    return {
        restoreFocus,
        runWithFocus,
        lastFocused: lastFocusedRef,
    };
}