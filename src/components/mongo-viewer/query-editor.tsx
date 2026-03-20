import { autocompletion, closeBrackets, startCompletion } from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { bracketMatching, foldGutter, indentOnInput } from "@codemirror/language"
import { EditorSelection, Prec } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import CodeMirror from "@uiw/react-codemirror"
import { useMemo } from "react"

import { createMongoCompletionSource } from "@/components/mongo-viewer/query-editor-autocomplete"
import { queryEditorTheme, queryHighlightExtension } from "@/components/mongo-viewer/query-editor-theme"

type QueryEditorProps = {
    disabled?: boolean
    fieldNames?: string[]
    fieldSamples?: Record<string, Array<string | number | boolean | null>>
    onApplyQuery?: () => void
    onChange: (value: string) => void
    placeholder?: string
    value: string
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
    const completionSource = useMemo(() => createMongoCompletionSource(fieldNames, fieldSamples), [fieldNames, fieldSamples])

    const extensions = useMemo(
        () => [
            json(),
            history(),
            foldGutter(),
            indentOnInput(),
            bracketMatching(),
            queryHighlightExtension,
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
            queryEditorTheme,
        ],
        [completionSource, onApplyQuery],
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
