import { autocompletion, closeBrackets, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { bracketMatching, foldGutter, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language"
import { EditorSelection } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import CodeMirror from "@uiw/react-codemirror"
import { tags } from "@lezer/highlight"
import { useMemo } from "react"

type QueryEditorProps = {
    disabled?: boolean
    onApplyQuery?: () => void
    onChange: (value: string) => void
    placeholder?: string
    value: string
}

const MONGO_COMPLETIONS = [
    "$and",
    "$or",
    "$nor",
    "$not",
    "$in",
    "$nin",
    "$eq",
    "$ne",
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$exists",
    "$type",
    "$regex",
    "$elemMatch",
    "$size",
    "$all",
    "$text",
    "$search",
    "$expr",
    "$oid",
    "$date",
]

function mongoCompletionSource(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\$[\w]*/)
    if (!word && !context.explicit) {
        return null
    }

    const from = word?.from ?? context.pos
    const typedValue = word?.text ?? ""

    return {
        from,
        options: MONGO_COMPLETIONS.filter((option) => option.startsWith(typedValue)).map((option) => ({
            label: option,
            type: "keyword",
        })),
    }
}

export function QueryEditor({ disabled = false, onApplyQuery, onChange, placeholder, value }: QueryEditorProps) {
    const queryHighlightStyle = useMemo(
        () =>
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
        [],
    )

    const extensions = useMemo(
        () => [
            json(),
            history(),
            foldGutter(),
            indentOnInput(),
            bracketMatching(),
            syntaxHighlighting(queryHighlightStyle),
            closeBrackets(),
            autocompletion({
                activateOnTyping: true,
                override: [mongoCompletionSource],
            }),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                indentWithTab,
                {
                    key: "Ctrl-Enter",
                    run: () => {
                        onApplyQuery?.()
                        return true
                    },
                },
                {
                    key: "Mod-Enter",
                    run: () => {
                        onApplyQuery?.()
                        return true
                    },
                },
            ]),
            EditorView.lineWrapping,
            EditorView.theme({
                "&": {
                    fontSize: "0.875rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 2px color-mix(in oklch, black 4%, transparent)",
                    overflow: "hidden",
                },
                ".cm-editor": {
                    backgroundColor: "var(--background) !important",
                    color: "var(--foreground) !important",
                    borderRadius: "inherit",
                    overflow: "hidden",
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
            }),
        ],
        [onApplyQuery, queryHighlightStyle],
    )

    return (
        <CodeMirror
            value={value}
            height="112px"
            editable={!disabled}
            basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
            }}
            extensions={extensions}
            placeholder={placeholder}
            onChange={onChange}
            onCreateEditor={(view) => {
                if (value.length === 0) {
                    view.dispatch({
                        selection: EditorSelection.cursor(0),
                    })
                }
            }}
        />
    )
}
