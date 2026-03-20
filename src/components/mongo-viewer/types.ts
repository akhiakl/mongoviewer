import type {
    CollectionIndexSummary,
    CollectionSchemaSummary,
    CollectionStats,
    DatabaseTreeItem,
    DocumentsResult,
    Selection,
    SerializableRecord,
} from "@/lib/mongo-types"

export type { DatabaseTreeItem }

export type { Selection }

export type ViewMode = "table" | "json"

export type DocumentsResponse = DocumentsResult

export type ViewerRecord = SerializableRecord

export type { CollectionIndexSummary, CollectionSchemaSummary, CollectionStats }

export type SortDirection = "asc" | "desc"
