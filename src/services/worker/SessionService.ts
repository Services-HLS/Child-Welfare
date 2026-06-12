import { SessionPipelineStatus } from "@/types/worker-flow";
import { SessionRecording, SessionRecordingStatus } from "@/types/session";

export function toPipelineStatus(status: SessionRecordingStatus): SessionPipelineStatus {
  if (status === "recording" || status === "paused") return "recording";
  if (status === "uploading" || status === "queued_offline") return "uploading";
  if (status === "processing") return "processing";
  if (status === "completed") return "completed";
  if (status === "failed") return "uploading";
  return "draft";
}

export function findTodaySession(sessions: SessionRecording[], workerId: string): SessionRecording | undefined {
  const today = new Date().toDateString();
  return sessions.find(
    (s) => s.metadata.workerId === workerId && new Date(s.createdAt).toDateString() === today
  );
}

export function findRecoverableSession(sessions: SessionRecording[], workerId: string): SessionRecording | undefined {
  return sessions.find(
    (s) =>
      s.metadata.workerId === workerId &&
      (s.status === "recording" || s.status === "paused" || s.status === "queued_offline" || s.status === "failed")
  );
}
