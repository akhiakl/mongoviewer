import { describe, expect, it } from "vitest"

import { validateMongoQuery } from "@/lib/query-validation"

describe("validateMongoQuery", () => {
    it("accepts empty queries", () => {
        expect(validateMongoQuery("")).toBeNull()
        expect(validateMongoQuery("   ")).toBeNull()
    })

    it("accepts valid Mongo JSON objects", () => {
        expect(validateMongoQuery('{ "status": "active" }')).toBeNull()
        expect(validateMongoQuery('{ "_id": { "$oid": "507f1f77bcf86cd799439011" } }')).toBeNull()
    })

    it("rejects non-object JSON", () => {
        expect(validateMongoQuery("[]")).toBe("Mongo query must be a JSON object.")
        expect(validateMongoQuery('"active"')).toBe("Mongo query must be a JSON object.")
    })

    it("returns parser errors for invalid JSON", () => {
        expect(validateMongoQuery('{ "status": ')).toMatch(/unexpected/i)
    })
})
