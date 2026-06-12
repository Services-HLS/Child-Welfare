import { idbGet, idbPut, STORES } from "./db";

const VIDEO_PREFIX = "vid_";

interface StoredSessionVideo {
  sessionId: string;
  mimeType: string;
  data: ArrayBuffer;
  savedAt: string;
}

export function mimeTypeForVideo(source: Blob | File): string {
  if (source.type && source.type.startsWith("video/")) return source.type;
  const name = source instanceof File ? source.name.toLowerCase() : "";
  if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".avi")) return "video/x-msvideo";
  if (name.endsWith(".mkv")) return "video/x-matroska";
  return "video/mp4";
}

export async function saveSessionVideoBlob(sessionId: string, blob: Blob | File): Promise<void> {
  const mimeType = mimeTypeForVideo(blob);
  const data = await (blob instanceof File ? blob.arrayBuffer() : blob.arrayBuffer());
  await idbPut<StoredSessionVideo>(STORES.session_offline_queue, `${VIDEO_PREFIX}${sessionId}`, {
    sessionId,
    mimeType,
    data,
    savedAt: new Date().toISOString(),
  });
}

export async function loadSessionVideoBlob(sessionId: string): Promise<Blob | null> {
  const rec = await idbGet<StoredSessionVideo>(STORES.session_offline_queue, `${VIDEO_PREFIX}${sessionId}`);
  if (!rec?.data) return null;
  return new Blob([rec.data], { type: rec.mimeType || "video/mp4" });
}

export async function createSessionVideoObjectUrl(sessionId: string): Promise<string | null> {
  const blob = await loadSessionVideoBlob(sessionId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export function createVideoObjectUrlFromBlob(blob: Blob | File): string {
  const typed =
    blob.type && blob.type.startsWith("video/")
      ? blob
      : new Blob([blob], { type: mimeTypeForVideo(blob) });
  return URL.createObjectURL(typed);
}

/** Blob URLs are session-only; never persist them. */
export function isEphemeralBlobUrl(url?: string | null): boolean {
  return !!url && url.startsWith("blob:");
}
