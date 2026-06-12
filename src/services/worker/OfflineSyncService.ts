import { UnifiedUploadItem } from "@/types/worker-flow";
import { updateUploadStatus } from "./UploadQueueService";

export async function batchSyncUploads(
  queue: UnifiedUploadItem[],
  online: boolean,
  handlers: {
    onSession: (sourceId: string) => Promise<boolean>;
    onActivity: (sourceId: string) => Promise<boolean>;
  }
): Promise<UnifiedUploadItem[]> {
  if (!online) return queue;
  let next = queue;
  for (const item of queue) {
    if (item.status !== "pending" && item.status !== "failed") continue;
    next = updateUploadStatus(next, item.id, "syncing", { progress: 30 });
    let ok = false;
    try {
      if (item.sourceType === "session") ok = await handlers.onSession(item.sourceId);
      if (item.sourceType === "activity") ok = await handlers.onActivity(item.sourceId);
      next = updateUploadStatus(
        next,
        item.id,
        ok ? "verified" : "failed",
        { progress: ok ? 100 : 0, error: ok ? undefined : "Sync failed" }
      );
    } catch {
      next = updateUploadStatus(next, item.id, "failed", { error: "Network error" });
    }
  }
  return next;
}

export function countPendingSync(queue: UnifiedUploadItem[]): number {
  return queue.filter((u) => u.status === "draft" || u.status === "pending" || u.status === "syncing" || u.status === "failed").length;
}
