import type { MongoViewerApi } from "@/shared/types";

export const mongoViewer = (window as unknown as { mongoViewer: MongoViewerApi }).mongoViewer;
