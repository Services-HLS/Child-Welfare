import { MissionControlSnapshot } from "@/types/intelligence";
import { ActivityLog, mockCenters } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { InterventionRecommendation } from "@/types/intelligence";
import { ServiceQualityScore } from "@/types/platform";
import { ChildWellnessIndex } from "@/types/intelligence";
import { generateRiskAlerts } from "@/services/ai/alerts";

export function buildMissionControlSnapshot(ctx: {
  sessions: SessionRecording[];
  complaints: ComplaintRecord[];
  feedback: FeedbackEntry[];
  activities: ActivityLog[];
  interventions: InterventionRecommendation[];
  serviceQualityScores: ServiceQualityScore[];
  childWellnessIndexes: ChildWellnessIndex[];
  online: boolean;
}): MissionControlSnapshot {
  const activeSessions = ctx.sessions.filter((s) => s.status === "processing" || s.status === "recording").length;
  const completed = ctx.sessions.filter((s) => s.status === "completed").length;
  const totalSessions = ctx.sessions.length || 1;
  const liveComplaints = ctx.complaints.filter((c) => c.status !== "closed").length;
  const now = Date.now();
  const slaAtRisk = ctx.complaints.filter(
    (c) => c.status !== "closed" && new Date(c.slaDueAt).getTime() - now < 24 * 3600_000
  ).length;
  const closed = ctx.complaints.filter((c) => c.status === "closed").length;
  const grievanceClosureRate = Math.round((closed / Math.max(1, ctx.complaints.length)) * 100);
  const fb = ctx.feedback;
  const satisfactionScore =
    fb.length > 0 ? Math.round((fb.reduce((a, f) => a + f.rating, 0) / fb.length / 5) * 100) : 78;
  const doneInt = ctx.interventions.filter((i) => i.status === "completed" || i.status === "impact_measured").length;
  const interventionCompletionRate = Math.round((doneInt / Math.max(1, ctx.interventions.length)) * 100) || 0;
  const bands = { green: 0, orange: 0, red: 0 };
  ctx.sessions.forEach((s) => {
    const b = s.scorecard?.band;
    if (b === "green") bands.green++;
    else if (b === "orange") bands.orange++;
    else if (b === "red") bands.red++;
  });
  const risks = generateRiskAlerts(mockCenters, ctx.complaints, ctx.feedback);
  const highRiskCenters = risks.slice(0, 6).map((r) => ({
    centerId: r.centerId,
    centerName: r.centerName,
    reason: r.message,
  }));
  const districts = [...new Set(mockCenters.map((c) => c.district))];
  const districtRankings = districts.map((district) => {
    const inDist = mockCenters.filter((c) => c.district === district);
    const sqis = inDist.map((c) => ctx.serviceQualityScores.find((s) => s.centerId === c.id)?.overallIndex ?? 70);
    const cwis = inDist.map((c) => ctx.childWellnessIndexes.find((w) => w.centerId === c.id)?.cwiScore ?? 70);
    return {
      district,
      sqi: Math.round(sqis.reduce((a, x) => a + x, 0) / Math.max(1, sqis.length)),
      cwi: Math.round(cwis.reduce((a, x) => a + x, 0) / Math.max(1, cwis.length)),
    };
  }).sort((a, b) => b.sqi - a.sqi);

  const neg = fb.filter((f) => f.sentiment === "negative" || f.rating <= 2).length;
  const sentimentLabel =
    neg > fb.length * 0.3 ? "Declining trust signals" : satisfactionScore >= 80 ? "Positive beneficiary sentiment" : "Mixed sentiment";

  return {
    activeSessions,
    liveComplaints,
    slaAtRisk,
    districtAlerts: risks.length,
    sessionCompletionRate: Math.round((completed / totalSessions) * 100),
    grievanceClosureRate,
    satisfactionScore,
    interventionCompletionRate,
    platformHealth: !ctx.online ? "degraded" : slaAtRisk > 5 ? "critical" : "healthy",
    workerBands: bands,
    highRiskCenters,
    districtRankings,
    sentimentLabel,
    interventionQueue: ctx.interventions.filter((i) => i.status === "proposed" || i.status === "recommended" || i.status === "approved").length,
  };
}
