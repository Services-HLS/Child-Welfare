import {
  AnganwadiExcellenceIndex,
  AEIBand,
  ChildProgressRecord,
  BeneficiarySurvey,
  InterventionRecommendation,
} from "@/types/intelligence";
import { Center, ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";

/** Official statewide KPI weights (sum = 1) */
export const AEI_WEIGHTS = {
  workerPerformance: 0.22,
  childEngagement: 0.16,
  beneficiarySatisfaction: 0.16,
  complaintClosure: 0.12,
  attendanceCompliance: 0.12,
  serviceVerificationConfidence: 0.11,
  interventionSuccess: 0.11,
};

function bandFromScore(score: number): AEIBand {
  if (score >= 75) return "green";
  if (score >= 55) return "orange";
  return "red";
}

function guidanceForBand(band: AEIBand): { guidance: string[]; recommendations: string[] } {
  if (band === "green") {
    return {
      guidance: ["Service delivery and outcomes are strengthening — maintain current improvement loop."],
      recommendations: ["Share best practices with peer centers", "Continue beneficiary communication cadence"],
    };
  }
  if (band === "orange") {
    return {
      guidance: ["Improvement opportunity — services are delivered; targeted support will strengthen outcomes."],
      recommendations: ["Schedule supportive coaching observation", "Complete open interventions", "Run satisfaction survey after next service"],
    };
  }
  return {
    guidance: ["Attention required — supportive intervention recommended to strengthen service delivery (not punitive)."],
    recommendations: ["Supervisor field visit within 7 days", "Activate coaching pathway", "Close open grievances with beneficiary confirmation"],
  };
}

export function computeAEI(
  center: Center,
  ctx: {
    sessions: SessionRecording[];
    complaints: ComplaintRecord[];
    feedback: FeedbackEntry[];
    activities: ActivityLog[];
    childProgress: ChildProgressRecord[];
    surveys: BeneficiarySurvey[];
    interventions?: InterventionRecommendation[];
    satisfactionBoost?: number;
  }
): AnganwadiExcellenceIndex {
  const centerSessions = ctx.sessions.filter((s) => s.metadata.centerId === center.id && s.scorecard);
  const workerPerformance =
    centerSessions.length > 0
      ? centerSessions.reduce((a, s) => a + s.scorecard!.overallPerformanceIndex * 100, 0) / centerSessions.length
      : center.compliance * 0.85;

  const cp = ctx.childProgress.filter((p) => p.centerId === center.id);
  const childEngagement =
    cp.length > 0 ? (cp.reduce((a, p) => a + p.preschoolParticipation, 0) / cp.length) * 100 : 72;

  const centerFb = ctx.feedback.filter((f) => f.centerId === center.id);
  const centerSv = ctx.surveys.filter((s) => s.centerId === center.id && s.responses);
  const fbAvg = centerFb.length ? (centerFb.reduce((a, f) => a + f.rating, 0) / centerFb.length / 5) * 100 : 75;
  const svAvg = centerSv.length
    ? (centerSv.reduce((a, s) => a + s.responses!.overallSatisfaction, 0) / centerSv.length / 5) * 100
    : fbAvg;
  let beneficiarySatisfaction = Math.round(svAvg * 0.55 + fbAvg * 0.45);
  if (ctx.satisfactionBoost) beneficiarySatisfaction = Math.min(100, beneficiarySatisfaction + ctx.satisfactionBoost);

  const totalCmp = ctx.complaints.filter((c) => c.centerId === center.id).length;
  const closed = ctx.complaints.filter((c) => c.centerId === center.id && c.status === "closed").length;
  const complaintClosure = totalCmp === 0 ? 90 : Math.round((closed / totalCmp) * 100);

  const acts = ctx.activities.filter((a) => a.centerId === center.id);
  const attendanceCompliance = Math.round(
    center.compliance * 0.6 + (acts.length > 0 ? (acts.filter((a) => a.status === "approved").length / acts.length) * 40 : 28)
  );

  const serviceVerificationConfidence = Math.round(
    acts.length > 0
      ? (acts.reduce((a, x) => a + (x.aiConfidence ?? 0.65), 0) / acts.length) * 100
      : center.compliance * 0.8
  );

  const centerInts = (ctx.interventions ?? []).filter((i) => i.centerId === center.id);
  const done = centerInts.filter((i) => i.status === "completed" || i.status === "impact_measured").length;
  const interventionSuccess =
    centerInts.length === 0 ? 78 : Math.round((done / centerInts.length) * 100 + (done > 0 ? 10 : 0));

  const w = AEI_WEIGHTS;
  const score = Math.round(
    workerPerformance * w.workerPerformance +
      childEngagement * w.childEngagement +
      beneficiarySatisfaction * w.beneficiarySatisfaction +
      complaintClosure * w.complaintClosure +
      attendanceCompliance * w.attendanceCompliance +
      serviceVerificationConfidence * w.serviceVerificationConfidence +
      interventionSuccess * w.interventionSuccess
  );

  const band = bandFromScore(score);
  const { guidance, recommendations } = guidanceForBand(band);

  const trendHistory = [
    { period: "W-4", score: Math.max(40, score - 12) },
    { period: "W-3", score: Math.max(45, score - 8) },
    { period: "W-2", score: Math.max(50, score - 4) },
    { period: "Current", score },
  ];

  return {
    centerId: center.id,
    centerName: center.name,
    district: center.district,
    score: Math.min(100, score),
    band,
    components: {
      workerPerformance: Math.round(workerPerformance),
      childEngagement: Math.round(childEngagement),
      beneficiarySatisfaction,
      complaintClosure,
      attendanceCompliance,
      serviceVerificationConfidence,
      interventionSuccess: Math.min(100, interventionSuccess),
    },
    weights: w,
    guidance,
    recommendations,
    trend: score >= 78 ? "up" : score < 60 ? "down" : "stable",
    trendHistory,
    updatedAt: new Date().toISOString(),
  };
}

export function computeAllAEI(
  centers: Center[],
  ctx: Parameters<typeof computeAEI>[1]
): AnganwadiExcellenceIndex[] {
  return centers.map((c) => computeAEI(c, ctx)).sort((a, b) => b.score - a.score);
}
