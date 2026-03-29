import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ViewerContent } from "@/renderer/components/mongo-viewer/viewer-content"

vi.mock("@/renderer/components/mongo-viewer/viewer-toolbar", () => ({
    ViewerToolbar: ({
        onViewModeChange,
    }: {
        onViewModeChange: (value: "table" | "json") => void
    }) => (
        <div>
            <button type="button" onClick={() => onViewModeChange("json")}>
                Switch To Json
            </button>
        </div>
    ),
}))

vi.mock("@/renderer/components/mongo-viewer/records-table", () => ({
    RecordsTable: ({ records }: { records: Array<Record<string, unknown>> }) => (
        <div>Table Count:{records.length}</div>
    ),
}))

vi.mock("@/renderer/components/mongo-viewer/records-json-list", () => ({
    RecordsJsonList: ({ records }: { records: Array<Record<string, unknown>> }) => (
        <div>Json Count:{records.length}</div>
    ),
}))

describe("ViewerContent", () => {
    const baseProps = {
        hasActiveMongoQuery: false,
        hasQuickFilter: false,
        filteredRecords: [{ _id: 1, name: "Alice" }],
        loadingDocs: false,
        noResultsMessage: "No records match the current quick filter.",
        onClearQuickFilter: vi.fn(),
        onResetQuery: vi.fn(),
        onSortDirectionChange: vi.fn(),
        onSortFieldChange: vi.fn(),
        onViewModeChange: vi.fn(),
        queryFieldNames: ["_id", "name"],
        selection: { db: "app", collection: "users" },
        sortDirection: "asc" as const,
        sortField: null,
        viewMode: "table" as const,
    }

    it("renders the table view when records are available", () => {
        render(<ViewerContent {...baseProps} />)

        expect(screen.getByText("Table Count:1")).toBeInTheDocument()
    })

    it("renders the json view when selected", () => {
        render(<ViewerContent {...baseProps} viewMode="json" />)

        expect(screen.getByText("Json Count:1")).toBeInTheDocument()
    })

    it("shows a loading skeleton state", () => {
        render(<ViewerContent {...baseProps} loadingDocs={true} filteredRecords={[]} />)

        expect(screen.getByText("Loading records...")).toBeInTheDocument()
    })

    it("shows the empty selection state", () => {
        render(<ViewerContent {...baseProps} filteredRecords={[]} selection={null} />)

        expect(screen.getByText("Select a collection from the sidebar to view records.")).toBeInTheDocument()
    })

    it("shows recovery actions for no-results states", () => {
        const onClearQuickFilter = vi.fn()
        const onResetQuery = vi.fn()

        render(
            <ViewerContent
                {...baseProps}
                filteredRecords={[]}
                hasActiveMongoQuery={true}
                hasQuickFilter={true}
                onClearQuickFilter={onClearQuickFilter}
                onResetQuery={onResetQuery}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Clear Quick Filter" }))
        fireEvent.click(screen.getByRole("button", { name: "Reset Query" }))

        expect(onClearQuickFilter).toHaveBeenCalledTimes(1)
        expect(onResetQuery).toHaveBeenCalledTimes(1)
        expect(screen.getByText(/try clearing the active filter or query/i)).toBeInTheDocument()
    })

    it("shows the passive no-results suggestion when no filters are active", () => {
        render(<ViewerContent {...baseProps} filteredRecords={[]} />)

        expect(screen.getByText(/try switching collections or refreshing the tree/i)).toBeInTheDocument()
    })
})
