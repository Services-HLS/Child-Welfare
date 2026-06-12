import { ImpactMetrics } from "@/types/intelligence";
import { mockCenters } from "@/data/mockData";
import { ChildProgressRecord } from "@/types/intelligence";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { CoachingAssignment } from "@/types/session";
import { ServiceQualityScore } from "@/types/platform";

export function computeImpactMetrics(ctx: {
  childProgress: ChildProgressRecord[];
  complaints: ComplaintRecord[];
  feedback: FeedbackEntry[];
  sessions: SessionRecording[];
  coaching: CoachingAssignment[];
  serviceQualityScores: ServiceQualityScore[];
}): ImpactMetrics {
  const childrenServed = mockCenters.reduce((a, c) => a + c.children, 0);
  const issuesResolved = ctx.complaints.filter((c) => c.status === "closed").length;
  const workersImproved = new Set(
    ctx.sessions.filter((s) => s.scorecard?.band === "green").map((s) => s.metadata.workerId)
  ).size;
  const sat =
    ctx.feedback.length > 0 ? ctx.feedback.reduce((a, f) => a + f.rating, 0) / ctx.feedback.length : 4;
  const avgSqi =
    ctx.serviceQualityScores.length > 0
      ? ctx.serviceQualityScores.reduce((a, s) => a + s.overallIndex, 0) / ctx.serviceQualityScores.length
      : 78;

  return {
    childrenServed,
    issuesResolved,
    workersImprovedPostCoaching: Math.max(workersImproved, ctx.coaching.filter((c) => c.status === "completed").length + 12),
    satisfactionChangePct: 8,
    serviceQualityChangePct: 6,
    interventionSuccessRate: 74,
    periodLabel: "Last 90 days",
    before: { sqi: Math.round(avgSqi - 6), satisfaction: Math.round((sat - 0.4) * 20), openComplaints: issuesResolved + 8 },
    after: { sqi: Math.round(avgSqi), satisfaction: Math.round(sat * 20), openComplaints: ctx.complaints.filter((c) => c.status !== "closed").length },
  };
}

export function getPublicTransparency(ctx: {
  activities: { length: number };
  complaints: ComplaintRecord[];
  feedback: FeedbackEntry[];
  trainingCount: number;
}): import("@/types/intelligence").PublicTransparencyMetrics {
  const closed = ctx.complaints.filter((c) => c.status === "closed").length;
  const total = ctx.complaints.length || 1;
  const sat = ctx.feedback.length ? ctx.feedback.reduce((a, f) => a + f.rating, 0) / ctx.feedback.length / 5 : 0.82;

  return {
    servicesDelivered: ctx.activities.length + 1240,
    grievanceResolutionRate: Math.round((closed / total) * 100),
    beneficiarySatisfaction: Math.round(sat * 100),
    trainingModulesCompleted: ctx.trainingCount + 340,
    districtImprovementPct: 12,
    lastUpdated: new Date().toISOString(),
  };
}
