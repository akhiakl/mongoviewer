const MAX_AUTOCOMPLETE_DEPTH = 2

export type QuerySampleValue = string | number | boolean | null

function isNestedDocument(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isExtendedJsonScalar(value: Record<string, unknown>) {
    const keys = Object.keys(value)
    return keys.length > 0 && keys.every((key) => key.startsWith("$"))
}

function collectFieldPaths(value: unknown, fieldNames: Set<string>, prefix = "", depth = 0) {
    if (!isNestedDocument(value) || isExtendedJsonScalar(value)) {
        return
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = prefix ? `${prefix}.${key}` : key
        fieldNames.add(nextPath)

        if (depth < MAX_AUTOCOMPLETE_DEPTH) {
            collectFieldPaths(nestedValue, fieldNames, nextPath, depth + 1)
        }
    }
}

function isSampleValue(value: unknown): value is QuerySampleValue {
    return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}

function collectFieldSamples(
    value: unknown,
    fieldSamples: Map<string, Set<QuerySampleValue>>,
    prefix = "",
    depth = 0,
) {
    if (!isNestedDocument(value) || isExtendedJsonScalar(value)) {
        return
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = prefix ? `${prefix}.${key}` : key

        if (isSampleValue(nestedValue)) {
            const samples = fieldSamples.get(nextPath) ?? new Set<QuerySampleValue>()
            if (samples.size < 12) {
                samples.add(nestedValue)
            }
            fieldSamples.set(nextPath, samples)
        }

        if (depth < MAX_AUTOCOMPLETE_DEPTH) {
            collectFieldSamples(nestedValue, fieldSamples, nextPath, depth + 1)
        }
    }
}

export function getQueryFieldNames(records: unknown[], maxRecords: number) {
    const nextFieldNames = new Set<string>()

    for (const record of records.slice(0, maxRecords)) {
        collectFieldPaths(record, nextFieldNames)
    }

    const ordered = Array.from(nextFieldNames).sort((left, right) => left.localeCompare(right))
    if (ordered.includes("_id")) {
        return ["_id", ...ordered.filter((fieldName) => fieldName !== "_id")]
    }

    return ordered
}

export function getQueryFieldSamples(records: unknown[], maxRecords: number) {
    const samplesByField = new Map<string, Set<QuerySampleValue>>()

    for (const record of records.slice(0, maxRecords)) {
        collectFieldSamples(record, samplesByField)
    }

    return Object.fromEntries(
        Array.from(samplesByField.entries()).map(([fieldName, samples]) => [fieldName, Array.from(samples)]),
    )
}
