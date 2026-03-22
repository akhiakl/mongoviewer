import { useCallback } from "react";
import { useFocusRestore } from "../use-focus-restore";

/**
 * Executes a document command if supported.
 *
 * NOTE:
 * - document.execCommand() is deprecated.
 * - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
 * - Still required for undo/redo and as fallback for clipboard actions.
 */
const runCommand = (command: string) => {
    if (document.queryCommandSupported(command)) {
        document.execCommand(command);
        return true;
    }
    return false;
};

export function useEditMenu() {
    const { runWithFocus } = useFocusRestore();

    const undo = useCallback(() => {
        runWithFocus(() => { runCommand("undo") });
    }, [runWithFocus]);

    const redo = useCallback(() => {
        runWithFocus(() => { runCommand("redo") });
    }, [runWithFocus]);

    const copy = useCallback(() => {
        runWithFocus(async () => {
            const selection = window.getSelection()?.toString();

            if (selection) {
                try {
                    await navigator.clipboard.writeText(selection);
                    return;
                } catch {
                    // fallback to execCommand
                }
            }

            runCommand("copy");
        });
    }, [runWithFocus]);

    const cut = useCallback(() => {
        runWithFocus(() => {
            runCommand("cut");
        });
    }, [runWithFocus]);

    const paste = useCallback(() => {
        runWithFocus(async () => {
            const success = runCommand("paste");
            if (success) return;

            try {
                const text = await navigator.clipboard.readText();
                const active = document.activeElement as HTMLElement | null;

                if (
                    active instanceof HTMLInputElement ||
                    active instanceof HTMLTextAreaElement
                ) {
                    const start = active.selectionStart ?? 0;
                    const end = active.selectionEnd ?? 0;
                    active.setRangeText(text, start, end, "end");
                } else if (active?.isContentEditable) {
                    document.execCommand("insertText", false, text);
                }
            } catch (err) {
                console.warn("Paste fallback failed:", err);
            }
        });
    }, [runWithFocus]);

    const find = useCallback(() => {
        runWithFocus(() => { runCommand("find") });
    }, [runWithFocus]);

    return {
        undo,
        redo,
        cut,
        copy,
        paste,
        find,
    };
}