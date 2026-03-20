import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete"

export const MONGO_COMPLETIONS = [
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

export function createMongoCompletionSource(
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
