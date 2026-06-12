import { ComplaintRecord, ExecutiveKpis, FeedbackEntry } from "@/types/platform";
import { ActivityLog } from "@/data/mockData";

export function computeExecutiveKpis(
  activities: ActivityLog[],
  complaints: ComplaintRecord[],
  feedback: FeedbackEntry[]
): ExecutiveKpis {
  const approved = activities.filter((a) => a.status === "approved").length;
  const closed = complaints.filter((c) => c.status === "closed").length;
  const avgRating =
    feedback.length > 0 ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 4;
  const openComplaints = complaints.filter((c) => c.status !== "closed").length;

  return {
    serviceQualityIndex: Math.round((approved / Math.max(activities.length, 1)) * 100),
    complaintIndex: Math.min(100, openComplaints * 8),
    feedbackScore: Math.round((avgRating / 5) * 100),
    adoptionRate: 78,
    activityCompliance: Math.round((approved / Math.max(activities.length, 1)) * 92),
    grievanceClosurePct: complaints.length ? Math.round((closed / complaints.length) * 100) : 100,
  };
}

export async function predictInterventionCenters(
  centerIds: string[]
): Promise<{ centerId: string; riskScore: number; recommendation: string }[]> {
  await new Promise((r) => setTimeout(r, 300));
  return centerIds.slice(0, 5).map((id, i) => ({
    centerId: id,
    riskScore: 0.9 - i * 0.12,
    recommendation: i === 0 ? "Deploy supervisor field visit within 48h" : "Increase meal verification frequency",
  }));
}
