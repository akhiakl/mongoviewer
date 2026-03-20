import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { JsonNode, JsonValueInspector, RecordsJsonList } from "@/components/mongo-viewer/json-value-viewer"

describe("JsonNode", () => {
    it("renders scalar and structured values", () => {
        const { rerender } = render(<JsonNode value={[]} />)
        expect(screen.getByText("[]")).toBeInTheDocument()

        rerender(<JsonNode value={{}} />)
        expect(screen.getByText("{}")).toBeInTheDocument()

        rerender(<JsonNode value={{ $oid: "abc123" }} />)
        expect(screen.getByText("abc123")).toBeInTheDocument()

        rerender(<JsonNode value="hello" />)
        expect(screen.getByText(/hello/)).toBeInTheDocument()

        rerender(<JsonNode value={42} />)
        expect(screen.getByText("42")).toBeInTheDocument()

        rerender(<JsonNode value={true} />)
        expect(screen.getByText("true")).toBeInTheDocument()

        rerender(<JsonNode value={null} />)
        expect(screen.getByText("null")).toBeInTheDocument()

        rerender(<JsonNode value={["a", 1]} />)
        expect(screen.getByText("[2]")).toBeInTheDocument()

        rerender(<JsonNode value={{ city: "Bengaluru", plan: "pro" }} />)
        expect(screen.getByText(/\{ 2 keys \}/)).toBeInTheDocument()
        expect(screen.getByText("city:")).toBeInTheDocument()
    })
})

describe("JsonValueInspector", () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        })
    })

    it("renders inspector metadata and copies JSON", async () => {
        render(
            <JsonValueInspector
                fieldName="profile"
                open={true}
                onOpenChange={vi.fn()}
                recordId="doc-1"
                value={{ city: "Bengaluru", plan: "pro" }}
            />,
        )

        expect(screen.getByText("Inspect profile")).toBeInTheDocument()
        expect(screen.getByText("Record doc-1")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: /copy json/i }))

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            JSON.stringify({ city: "Bengaluru", plan: "pro" }, null, 2),
        )
    })

    it("shows fallback description when record id is absent", () => {
        render(
            <JsonValueInspector
                fieldName="tags"
                open={true}
                onOpenChange={vi.fn()}
                value={["active", "pro"]}
            />,
        )

        expect(screen.getByText("Expanded structured value")).toBeInTheDocument()
    })
})

describe("RecordsJsonList", () => {
    it("renders record cards with derived ids", () => {
        render(
            <RecordsJsonList
                records={[
                    { _id: "abc123", name: "Alice" },
                    { name: "Without id" },
                ]}
            />,
        )

        expect(screen.getByText("abc123")).toBeInTheDocument()
        expect(screen.getByText("doc-2")).toBeInTheDocument()
    })
})
