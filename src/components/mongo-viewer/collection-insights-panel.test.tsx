import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CollectionInsightsPanel } from "@/components/mongo-viewer/collection-insights-panel"

describe("CollectionInsightsPanel", () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        })
    })

    it("renders stats, schema fields, and indexes", () => {
        render(
            <CollectionInsightsPanel
                indexes={[
                    {
                        name: "status_1",
                        fields: ["status (1)"],
                        unique: false,
                        sparse: true,
                        partial: true,
                        ttlSeconds: 3600,
                    },
                ]}
                loadingInsights={false}
                schemaSummary={{
                    sampleSize: 20,
                    fields: [
                        {
                            path: "status",
                            types: ["string"],
                            presenceRate: 1,
                            exampleValues: ["active", "pending"],
                        },
                    ],
                }}
                stats={{
                    documentCount: 5000,
                    avgDocumentSize: 1100,
                    storageSize: 1_300_000,
                    totalIndexSize: 476_000,
                    totalIndexes: 9,
                }}
            />,
        )

        expect(screen.getByText("Collection Stats")).toBeInTheDocument()
        expect(screen.getByText("5,000")).toBeInTheDocument()
        expect(screen.getByText("1.1 KB")).toBeInTheDocument()
        expect(screen.getByText("1.2 MB")).toBeInTheDocument()
        expect(screen.getByText("464.8 KB")).toBeInTheDocument()
        expect(screen.getByText("status")).toBeInTheDocument()
        expect(screen.getByText("Examples: active | pending")).toBeInTheDocument()
        expect(screen.getByText("status_1")).toBeInTheDocument()
        expect(screen.getByText("sparse")).toBeInTheDocument()
        expect(screen.getByText("partial")).toBeInTheDocument()
        expect(screen.getByText("ttl 3600s")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Copy status_1 index definition" }))
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it("shows loading and unavailable fallbacks", () => {
        const { rerender } = render(
            <CollectionInsightsPanel
                indexes={[]}
                loadingInsights={true}
                schemaSummary={null}
                stats={null}
            />,
        )

        expect(screen.getAllByTestId("insight-row-skeleton")).toHaveLength(5)
        expect(screen.getAllByTestId("insight-card-skeleton")).toHaveLength(6)

        rerender(
            <CollectionInsightsPanel
                indexes={[]}
                loadingInsights={false}
                schemaSummary={null}
                stats={null}
            />,
        )

        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
        expect(screen.getByText("No schema sample available.")).toBeInTheDocument()
        expect(screen.getByText("No indexes reported.")).toBeInTheDocument()
    })

    it("shows empty states and standard index badge", () => {
        render(
            <CollectionInsightsPanel
                indexes={[
                    {
                        name: "_id_",
                        fields: ["_id (1)"],
                        unique: false,
                        sparse: false,
                        partial: false,
                        ttlSeconds: null,
                    },
                ]}
                loadingInsights={false}
                schemaSummary={{ sampleSize: 0, fields: [] }}
                stats={null}
            />,
        )

        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
        expect(screen.getByText("No schema sample available.")).toBeInTheDocument()
        expect(screen.getByText("standard")).toBeInTheDocument()
    })
})
