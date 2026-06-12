import { SessionRecording } from "@/types/session";
import { ClassroomSessionAnalytics } from "@/types/classroom-intelligence";

/** Reduce SQI session-evaluation contribution when repeated low engagement is detected */
export function classroomSessionEvalPenalty(
  centerId: string,
  sessions: SessionRecording[],
  analytics: Record<string, ClassroomSessionAnalytics>
): number {
  const centerSessions = sessions.filter((s) => s.metadata.centerId === centerId && s.scorecard);
  let lowEngagementCount = 0;
  centerSessions.forEach((s) => {
    const a = analytics[s.id];
    if (a && a.indices.cei < 55) lowEngagementCount++;
  });
  if (lowEngagementCount >= 3) return 0.12;
  if (lowEngagementCount >= 2) return 0.08;
  return 0;
}

export function classroomCoachingSqiBoost(
  centerId: string,
  analytics: Record<string, ClassroomSessionAnalytics>,
  satisfactionBoost?: number
): number {
  const centerAnalytics = Object.values(analytics).filter((a) => a.centerId === centerId);
  const improving = centerAnalytics.filter((a) => a.operationalView.engagementTrend === "up").length;
  if (improving >= 2 && satisfactionBoost) return satisfactionBoost / 100;
  if (improving >= 1) return 0.04;
  return 0;
}
