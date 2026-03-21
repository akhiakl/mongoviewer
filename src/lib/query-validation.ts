import { EJSON } from "bson"

export function validateMongoQuery(query: string) {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
        return null
    }

    try {
        const parsed = EJSON.parse(normalizedQuery) as unknown
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return "Mongo query must be a JSON object."
        }

        return null
    } catch (error) {
        return error instanceof Error ? error.message : "Invalid query."
    }
}
