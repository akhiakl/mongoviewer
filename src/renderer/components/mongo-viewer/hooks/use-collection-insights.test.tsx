import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
    resetCollectionInsightsCache,
    useCollectionInsights,
} from "@/renderer/components/mongo-viewer/hooks/use-collection-insights"

const getCollectionStatsMock = vi.fn()
const getCollectionIndexesMock = vi.fn()
const getCollectionSchemaSummaryMock = vi.fn()

vi.mock("@/renderer/renderer-api", () => ({
    mongoViewer: {
        getCollectionStats: (...args: unknown[]) => getCollectionStatsMock(...args),
        getCollectionIndexes: (...args: unknown[]) => getCollectionIndexesMock(...args),
        getCollectionSchemaSummary: (...args: unknown[]) => getCollectionSchemaSummaryMock(...args),
    },
}))

describe("useCollectionInsights", () => {
    beforeEach(() => {
        resetCollectionInsightsCache()
        getCollectionStatsMock.mockResolvedValue({
            documentCount: 12,
            avgDocumentSize: 128,
            storageSize: 2048,
            totalIndexSize: 512,
            totalIndexes: 1,
        })
        getCollectionIndexesMock.mockResolvedValue([
            {
                name: "_id_",
                fields: ["_id (1)"],
                unique: true,
                sparse: false,
                partial: false,
                ttlSeconds: null,
            },
        ])
        getCollectionSchemaSummaryMock.mockResolvedValue({
            sampleSize: 12,
            fields: [
                {
                    path: "status",
                    types: ["string"],
                    presenceRate: 1,
                    exampleValues: ["active"],
                },
            ],
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
        resetCollectionInsightsCache()
    })

    it("loads insights for the selected connection", async () => {
        const { result } = renderHook(
            ({ connectionId, selection }) => useCollectionInsights(connectionId, selection),
            {
                initialProps: {
                    connectionId: "conn-1",
                    selection: { db: "app", collection: "users" },
                },
            },
        )

        expect(result.current.loadingInsights).toBe(true)

        await waitFor(() => {
            expect(result.current.loadingInsights).toBe(false)
        })

        expect(result.current.stats?.documentCount).toBe(12)
        expect(result.current.indexes).toHaveLength(1)
        expect(result.current.schemaSummary?.sampleSize).toBe(12)
        expect(getCollectionStatsMock).toHaveBeenCalledWith({ connectionId: "conn-1", db: "app", collection: "users" })
        expect(getCollectionIndexesMock).toHaveBeenCalledWith({ connectionId: "conn-1", db: "app", collection: "users" })
        expect(getCollectionSchemaSummaryMock).toHaveBeenCalledWith({ connectionId: "conn-1", db: "app", collection: "users" })
    })

    it("reuses cached insights for the same selection", async () => {
        const props = {
            connectionId: "conn-1",
            selection: { db: "app", collection: "users" },
        }
        const initial = renderHook(
            ({ connectionId, selection }) => useCollectionInsights(connectionId, selection),
            {
                initialProps: props,
            },
        )

        await waitFor(() => {
            expect(initial.result.current.loadingInsights).toBe(false)
        })

        initial.unmount()
        vi.clearAllMocks()

        const cached = renderHook(
            ({ connectionId, selection }) => useCollectionInsights(connectionId, selection),
            {
                initialProps: props,
            },
        )

        expect(cached.result.current.loadingInsights).toBe(false)
        expect(cached.result.current.stats?.documentCount).toBe(12)
        expect(getCollectionStatsMock).not.toHaveBeenCalled()
        expect(getCollectionIndexesMock).not.toHaveBeenCalled()
        expect(getCollectionSchemaSummaryMock).not.toHaveBeenCalled()
    })

    it("surfaces fetch errors cleanly", async () => {
        getCollectionStatsMock.mockRejectedValueOnce(new Error("Stats failed"))

        const { result } = renderHook(
            ({ connectionId, selection }) => useCollectionInsights(connectionId, selection),
            {
                initialProps: {
                    connectionId: "conn-1",
                    selection: { db: "app", collection: "users" },
                },
            },
        )

        await waitFor(() => {
            expect(result.current.loadingInsights).toBe(false)
        })

        expect(result.current.insightsError).toBe("Stats failed")
        expect(result.current.stats).toBeNull()
        expect(result.current.indexes).toEqual([])
        expect(result.current.schemaSummary).toBeNull()
    })

    it("resets cleanly when there is no active selection", async () => {
        const { result } = renderHook(
            ({ connectionId, selection }) => useCollectionInsights(connectionId, selection),
            {
                initialProps: {
                    connectionId: "conn-1",
                    selection: null as { db: string; collection: string } | null,
                },
            },
        )

        expect(result.current.loadingInsights).toBe(false)
        expect(result.current.insightsError).toBeNull()
        expect(result.current.stats).toBeNull()
        expect(result.current.indexes).toEqual([])
        expect(result.current.schemaSummary).toBeNull()
        expect(getCollectionStatsMock).not.toHaveBeenCalled()
    })
})
