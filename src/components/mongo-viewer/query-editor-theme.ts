import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { tags } from "@lezer/highlight"

export const queryHighlightExtension = syntaxHighlighting(
    HighlightStyle.define([
        { tag: tags.string, color: "var(--chart-2)" },
        { tag: tags.number, color: "var(--chart-3)" },
        { tag: tags.bool, color: "var(--chart-5)" },
        { tag: tags.null, color: "var(--destructive)" },
        { tag: tags.keyword, color: "var(--primary)" },
        { tag: tags.brace, color: "var(--foreground)" },
        { tag: tags.squareBracket, color: "var(--foreground)" },
        { tag: tags.separator, color: "var(--muted-foreground)" },
        { tag: tags.propertyName, color: "var(--foreground)" },
    ]),
)

export const queryEditorTheme = EditorView.theme({
    "&": {
        fontSize: "0.875rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        boxShadow: "0 1px 2px color-mix(in oklch, black 4%, transparent)",
        position: "relative",
    },
    ".cm-editor": {
        backgroundColor: "var(--background) !important",
        color: "var(--foreground) !important",
        borderRadius: "inherit",
        overflow: "visible",
    },
    "&.cm-focused": {
        outline: "2px solid var(--ring)",
        borderColor: "var(--ring)",
        boxShadow: "0 0 0 3px color-mix(in oklch, var(--ring) 18%, transparent)",
    },
    ".cm-scroller": {
        minHeight: "6rem",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
        backgroundColor: "var(--background) !important",
        color: "var(--foreground) !important",
        borderRadius: "inherit",
    },
    ".cm-content": {
        padding: "0.75rem",
        caretColor: "var(--foreground)",
    },
    ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--foreground)",
    },
    ".cm-gutters": {
        backgroundColor: "var(--background) !important",
        border: "none",
        color: "var(--muted-foreground)",
    },
    ".cm-placeholder": {
        color: "var(--muted-foreground) !important",
    },
    ".cm-activeLine": {
        backgroundColor: "color-mix(in oklch, var(--muted) 60%, transparent)",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "color-mix(in oklch, var(--muted) 60%, transparent)",
    },
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "color-mix(in oklch, var(--ring) 22%, transparent) !important",
    },
    ".cm-tooltip": {
        border: "1px solid var(--border)",
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        borderRadius: "0.5rem",
        overflow: "hidden",
        boxShadow: "0 10px 30px color-mix(in oklch, black 12%, transparent)",
        zIndex: "30",
    },
    ".cm-tooltip-autocomplete ul": {
        fontFamily: "inherit",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
        backgroundColor: "color-mix(in oklch, var(--accent) 88%, transparent)",
        color: "var(--accent-foreground)",
    },
    ".cm-completionIcon": {
        opacity: "0.75",
    },
})
