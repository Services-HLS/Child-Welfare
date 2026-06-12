import { ComplaintRecord } from "@/types/platform";
import { SessionRecording, TrainingRecommendation } from "@/types/session";
import { ClassroomSessionAnalytics } from "@/types/classroom-intelligence";

export function trainingFromSession(
  session: SessionRecording,
  intel: ClassroomSessionAnalytics | null
): Omit<TrainingRecommendation, "id" | "createdAt"> {
  const sc = session.scorecard!;
  return {
    workerId: session.metadata.workerId,
    sessionId: session.id,
    moduleIds: sc.trainingModuleIds,
    reason: intel?.workerView?.improvementAreas?.[0] ?? sc.supportiveRecommendations[0] ?? "Session coaching path",
    band: sc.band,
    assignedBy: "ai",
    status: "pending",
  };
}

export function trainingFromComplaintTrends(complaints: ComplaintRecord[], workerId: string): string[] {
  const mine = complaints.filter((c) => c.assignedWorkerId === workerId);
  const cats = mine.map((c) => c.category);
  const hints: string[] = [];
  if (cats.some((c) => c.includes("nutrition"))) hints.push("TM-NUT-01");
  if (cats.some((c) => c.includes("hygiene") || c.includes("sanitation"))) hints.push("TM-SAFE-02");
  if (mine.length >= 2) hints.push("TM-COMM-04");
  return hints;
}

export function markTrainingComplete(recs: TrainingRecommendation[], recId: string): TrainingRecommendation[] {
  return recs.map((r) => (r.id === recId ? { ...r, status: "completed" as const } : r));
}
