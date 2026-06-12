import { UnifiedUploadItem, UnifiedUploadStatus } from "@/types/worker-flow";
import { createAudit, touchAudit } from "./audit";

export function mergeUploadQueues(
  bundleQueue: UnifiedUploadItem[],
  derived: UnifiedUploadItem[]
): UnifiedUploadItem[] {
  const map = new Map<string, UnifiedUploadItem>();
  bundleQueue.forEach((u) => map.set(u.id, u));
  derived.forEach((u) => {
    const existing = map.get(u.id);
    if (!existing || statusRank(u.status) > statusRank(existing.status)) {
      map.set(u.id, { ...u, ...existing, status: u.status, progress: Math.max(u.progress, existing?.progress ?? 0) });
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.audit.updatedAt).getTime() - new Date(a.audit.updatedAt).getTime()
  );
}

function statusRank(s: UnifiedUploadStatus): number {
  const o: Record<UnifiedUploadStatus, number> = { draft: 0, pending: 1, syncing: 2, failed: 2, verified: 3 };
  return o[s] ?? 0;
}

export function enqueueUpload(
  queue: UnifiedUploadItem[],
  item: Omit<UnifiedUploadItem, "audit"> & { audit?: UnifiedUploadItem["audit"] },
  offline: boolean
): UnifiedUploadItem[] {
  if (queue.some((q) => q.sourceType === item.sourceType && q.sourceId === item.sourceId && q.status !== "failed")) {
    return queue;
  }
  const entry: UnifiedUploadItem = {
    ...item,
    audit: item.audit ?? createAudit(offline),
  };
  return [entry, ...queue];
}

export function updateUploadStatus(
  queue: UnifiedUploadItem[],
  id: string,
  status: UnifiedUploadStatus,
  extra?: Partial<UnifiedUploadItem>
): UnifiedUploadItem[] {
  return queue.map((q) =>
    q.id === id
      ? {
          ...q,
          ...extra,
          status,
          audit: touchAudit(q.audit, { synced: status === "verified", verified: status === "verified" }),
        }
      : q
  );
}

export function deriveUploadsFromAppData(input: {
  sessions: { id: string; status: string; uploadProgress: number; synced: boolean; createdAt: string; metadata: { sessionType: string } }[];
  activities: { id: string; type: string; timestamp: string; synced: boolean; imageUrl?: string; status: string }[];
  offline: boolean;
}): UnifiedUploadItem[] {
  const items: UnifiedUploadItem[] = [];
  input.sessions
    .filter((s) => !s.synced || s.status === "queued_offline" || s.status === "uploading")
    .forEach((s) => {
      items.push({
        id: `upload-session-${s.id}`,
        sourceType: "session",
        sourceId: s.id,
        label: `Session: ${s.metadata.sessionType}`,
        status: s.status === "queued_offline" ? "pending" : "syncing",
        progress: s.uploadProgress,
        evidenceCount: 1,
        audit: createAudit(!input.offline || !s.synced),
      });
    });
  input.activities
    .filter((a) => !a.synced || !a.imageUrl || a.status === "pending")
    .forEach((a) => {
      items.push({
        id: `upload-activity-${a.id}`,
        sourceType: "activity",
        sourceId: a.id,
        label: a.type,
        status: a.imageUrl ? "pending" : "draft",
        progress: a.imageUrl ? 50 : 0,
        evidenceCount: a.imageUrl ? 1 : 0,
        audit: createAudit(!a.synced),
      });
    });
  return items;
}
