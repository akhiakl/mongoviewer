import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RecordsTable } from "@/components/mongo-viewer/records-table"

vi.mock("react-window", () => ({
    List: ({
        rowComponent: RowComponent,
        rowCount,
        rowProps,
    }: {
        rowComponent: (props: {
            index: number
            style: Record<string, unknown>
        } & Record<string, unknown>) => React.ReactNode
        rowCount: number
        rowProps: Record<string, unknown>
    }) => (
        <div>
            {Array.from({ length: rowCount }, (_, index) => (
                <RowComponent key={index} index={index} style={{}} {...rowProps} />
            ))}
        </div>
    ),
}))

describe("RecordsTable", () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        })

        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                disconnect() {}
            },
        )
    })

    it("renders compact previews and opens the inspector for structured values", () => {
        render(
            <RecordsTable
                records={[
                    {
                        _id: { $oid: "507f1f77bcf86cd799439011" },
                        createdAt: { $date: "2026-01-01T00:00:00.000Z" },
                        name: "Alice",
                        tags: ["active", "pro"],
                        profile: { city: "Bengaluru", plan: "pro" },
                    },
                ]}
            />,
        )

        expect(screen.getByText("{ city, plan }")).toBeInTheDocument()
        expect(screen.getByText("[active, pro]")).toBeInTheDocument()
        expect(screen.getByText("507f1f77bcf86cd799439011")).toBeInTheDocument()
        expect(screen.getByText("2026-01-01T00:00:00.000Z")).toBeInTheDocument()
        expect(screen.getAllByText("Inspect")).toHaveLength(2)

        fireEvent.click(screen.getByRole("button", { name: "Copy name value" }))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Alice")

        fireEvent.click(screen.getByRole("button", { name: "Inspect profile value" }))

        expect(screen.getByText("Inspect profile")).toBeInTheDocument()
        expect(screen.getByText("Record 507f1f77bcf86cd799439011")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            JSON.stringify({ city: "Bengaluru", plan: "pro" }, null, 2),
        )

        fireEvent.click(screen.getByRole("button", { name: "Close" }))

        expect(screen.queryByText("Inspect profile")).not.toBeInTheDocument()
    })

    it("does not mark scalar and EJSON scalar cells as inspectable", () => {
        render(
            <RecordsTable
                records={[
                    {
                        _id: { $oid: "507f1f77bcf86cd799439011" },
                        createdAt: { $date: "2026-01-01T00:00:00.000Z" },
                        amount: 42,
                        enabled: true,
                        name: "Alice",
                    },
                ]}
            />,
        )

        expect(screen.queryByText("Inspect")).not.toBeInTheDocument()
        expect(screen.queryByRole("cell", { name: /inspect /i })).not.toBeInTheDocument()
        expect(screen.getByText("42")).toBeInTheDocument()
        expect(screen.getByText("true")).toBeInTheDocument()
    })
})
