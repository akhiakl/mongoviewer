export type ConnectionListItem = {
  id: string;
  name: string;
  createdAt: string;
  uri: string;
};

export type ConnectionsState = {
  connections: ConnectionListItem[];
};

export type SaveConnectionInput = {
  name: string;
  connectionString: string;
  tlsCertificatePath?: string;
};

export type UpdateConnectionInput = SaveConnectionInput & {
  connectionId: string;
};

export type DatabaseTreeItem = {
  name: string;
  collections: string[];
};

export type Selection = {
  db: string;
  collection: string;
};

export type DocumentsQuery = Selection & {
  connectionId: string;
  page?: number;
  pageSize?: number;
  mongoQuery?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
};

export type SerializableRecord = Record<string, unknown>;

export type DocumentsResult = {
  db: string;
  collection: string;
  page: number;
  pageSize: number;
  total: number;
  records: SerializableRecord[];
};

export type CollectionIndexSummary = {
  name: string;
  fields: string[];
  unique: boolean;
  sparse: boolean;
  partial: boolean;
  ttlSeconds: number | null;
};

export type CollectionFieldSummary = {
  path: string;
  types: string[];
  presenceRate: number;
  exampleValues: string[];
};

export type CollectionSchemaSummary = {
  sampleSize: number;
  fields: CollectionFieldSummary[];
};

export type CollectionStats = {
  documentCount: number;
  avgDocumentSize: number | null;
  storageSize: number | null;
  totalIndexSize: number | null;
  totalIndexes: number;
};
