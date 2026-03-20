import { autocompletion, closeBrackets, startCompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { bracketMatching, foldGutter, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language"
import { EditorSelection, Prec } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import CodeMirror from "@uiw/react-codemirror"
import { tags } from "@lezer/highlight"
import { useMemo } from "react"

type QueryEditorProps = {
    disabled?: boolean
    fieldNames?: string[]
    fieldSamples?: Record<string, Array<string | number | boolean | null>>
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

function getPreviousNonWhitespace(text: string, from: number) {
    for (let index = from - 1; index >= 0; index -= 1) {
        const character = text[index]
        if (!character || /\s/.test(character)) {
            continue
        }

        return character
    }

    return null
}

function getLastQueryKey(text: string) {
    const matches = Array.from(text.matchAll(/"([^"]+)"\s*:/g))

    for (let index = matches.length - 1; index >= 0; index -= 1) {
        const match = matches[index]
        const key = match[1]

        if (!key.startsWith("$")) {
            return key
        }
    }

    return null
}

function toValueCompletion(value: string | number | boolean | null) {
    return {
        label: value === null ? "null" : String(value),
        type: "text",
        apply: value === null ? "null" : JSON.stringify(value),
        detail: "sample value",
    } as const
}

function createMongoCompletionSource(
    fieldNames: string[],
    fieldSamples: Record<string, Array<string | number | boolean | null>>,
) {
    return (context: CompletionContext): CompletionResult | null => {
        const textBeforeCursor = context.state.sliceDoc(0, context.pos)
        const operatorWord = context.matchBefore(/\$[\w]*/)
        const plainWord = context.matchBefore(/(?:true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*"|[\w.-]+)?/)
        const currentWord = operatorWord ?? plainWord
        const from = currentWord?.from ?? context.pos
        const to = currentWord?.to ?? context.pos
        const typedValue = currentWord?.text ?? ""
        const previousCharacter = getPreviousNonWhitespace(textBeforeCursor, from)
        const isValueContext = previousCharacter === ":"
        const isKeyContext = previousCharacter === "{" || previousCharacter === ","

        if (!currentWord && !context.explicit) {
            return null
        }

        if (operatorWord) {
            return {
                from: operatorWord.from,
                to: operatorWord.to,
                options: MONGO_COMPLETIONS.filter((option) => option.startsWith(typedValue)).map((option) => ({
                    label: option,
                    type: "keyword",
                    detail: "operator",
                })),
            }
        }

        const normalizedFieldValue = typedValue.replace(/^"/, "").replace(/"$/, "")
        const activeField = getLastQueryKey(textBeforeCursor)

        const fieldOptions = isKeyContext
            ? fieldNames
                  .filter((fieldName) => !normalizedFieldValue || fieldName.startsWith(normalizedFieldValue))
                  .slice(0, 100)
                  .map((fieldName) => ({
                      label: fieldName,
                      type: "property",
                      apply: `"${fieldName}"`,
                      detail: "field",
                  }))
            : []

        const sampledValueOptions =
            isValueContext && activeField
                ? (fieldSamples[activeField] ?? [])
                      .filter((sample) => {
                          if (typedValue.length === 0) {
                              return true
                          }

                          const normalizedSample = sample === null ? "null" : String(sample).toLowerCase()
                          return normalizedSample.startsWith(typedValue.replace(/^"/, "").toLowerCase())
                      })
                      .slice(0, 20)
                      .map(toValueCompletion)
                : []

        const options = isValueContext ? sampledValueOptions : fieldOptions

        if (options.length === 0) {
            return null
        }

        return {
            from,
            to,
            options,
        }
    }
}

export function QueryEditor({
    disabled = false,
    fieldNames = [],
    fieldSamples = {},
    onApplyQuery,
    onChange,
    placeholder,
    value,
}: QueryEditorProps) {
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
    const completionSource = useMemo(() => createMongoCompletionSource(fieldNames, fieldSamples), [fieldNames, fieldSamples])

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
                override: [completionSource],
            }),
            Prec.highest(
                keymap.of([
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
            ),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                {
                    key: "Ctrl-Space",
                    run: (view) => {
                        startCompletion(view)
                        return true
                    },
                },
                indentWithTab,
            ]),
            EditorView.domEventHandlers({
                keydown: (event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                        event.preventDefault()
                        onApplyQuery?.()
                        return true
                    }

                    return false
                },
            }),
            EditorView.lineWrapping,
            EditorView.theme({
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
            }),
        ],
        [completionSource, onApplyQuery, queryHighlightStyle],
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
