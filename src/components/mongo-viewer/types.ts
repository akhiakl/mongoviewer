import type {
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
