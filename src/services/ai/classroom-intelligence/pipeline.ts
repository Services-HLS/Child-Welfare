import { SessionRecording, SessionScorecard } from "@/types/session";
import {
  ClassroomAnalyticsIndices,
  ClassroomSessionAnalytics,
  ClassroomHeatmapSegment,
  ClassroomTimelineStep,
} from "@/types/classroom-intelligence";
import { mockCenters } from "@/data/mockData";

function pct(n: number): number {
  return Math.round(Math.max(0, Math.min(100, n * 100)));
}

export function computeIndicesFromScorecard(sc: SessionScorecard): ClassroomAnalyticsIndices {
  const tei = (sc.teachingEffectiveness + sc.classroomManagement) / 2;
  const cei = sc.childEngagement;
  const cqi = sc.communication;
  const sai = sc.activityCompliance;
  const ccs =
    (sc.bodyLanguage.teacherEngagement +
      sc.speech.confidence +
      sc.classroomQuality.participationBalance) /
    3;
  const opi = sc.overallPerformanceIndex;
  const ips = Math.max(0, Math.min(1, 1 - opi + 0.15));
  return {
    opi: pct(opi),
    tei: pct(tei),
    cei: pct(cei),
    cqi: pct(cqi),
    sai: pct(sai),
    ccs: pct(ccs),
    ips: pct(ips),
  };
}

function buildHeatmap(sc: SessionScorecard): ClassroomHeatmapSegment[] {
  const d = sc.childEngagementDetail;
  const total = Math.max(d.estimatedPresent, 1);
  return [
    { segment: "Opening", engagement: pct(sc.teachingEffectiveness * 0.9) },
    { segment: "Core activity", engagement: pct((d.attentive + d.participating) / total) },
    { segment: "Group work", engagement: pct(sc.classroomQuality.participationBalance) },
    { segment: "Closing", engagement: pct(sc.communication * 0.85) },
  ];
}

function detectRepeatedIssues(
  session: SessionRecording,
  allSessions: SessionRecording[]
): string[] {
  const workerSessions = allSessions.filter(
    (s) => s.metadata.workerId === session.metadata.workerId && s.scorecard && s.id !== session.id
  );
  const tags: string[] = [];
  const sc = session.scorecard!;
  if (sc.childEngagement < 0.6) {
    const repeats = workerSessions.filter((s) => (s.scorecard?.childEngagement ?? 1) < 0.6).length;
    if (repeats >= 1) tags.push("Repeated low child engagement");
  }
  if (sc.communication < 0.6) {
    const repeats = workerSessions.filter((s) => (s.scorecard?.communication ?? 1) < 0.6).length;
    if (repeats >= 1) tags.push("Communication quality pattern");
  }
  if (sc.syllabus.gaps.length > 0) tags.push("Syllabus gap detected");
  return tags;
}

function supportiveBandMessage(band: SessionScorecard["band"]): string {
  if (band === "green") return "Strong classroom delivery — your practices support child outcomes.";
  if (band === "orange") return "Progress opportunity — coaching will help strengthen your next sessions.";
  return "Development focus — supervisor support is available; this is not punitive.";
}

export function buildClassroomAnalytics(
  session: SessionRecording,
  allSessions: SessionRecording[]
): ClassroomSessionAnalytics | null {
  if (!session.scorecard) return null;
  const sc = session.scorecard;
  const center = mockCenters.find((c) => c.id === session.metadata.centerId);
  const indices = computeIndicesFromScorecard(sc);
  const repeatedIssueTags = detectRepeatedIssues(session, allSessions);
  const flagged = sc.band === "red" || repeatedIssueTags.length > 0;
  const aiConfidence = pct(
    (sc.bodyLanguage.interactionQuality + sc.syllabus.curriculumMatch + sc.speech.clarity) / 3
  );

  const strengths: string[] = [];
  if (indices.tei >= 75) strengths.push("Teaching effectiveness");
  if (indices.cei >= 75) strengths.push("Child engagement");
  if (indices.cqi >= 75) strengths.push("Communication clarity");
  if (indices.sai >= 75) strengths.push("Syllabus adherence");
  if (strengths.length === 0) strengths.push("Consistent session completion");

  const improvementAreas = [
    ...(indices.cei < 65 ? ["Increase participatory activities"] : []),
    ...(indices.cqi < 65 ? ["Verbal clarity and pacing"] : []),
    ...(indices.sai < 65 ? ["Curriculum sequence coverage"] : []),
    ...sc.syllabus.gaps.map((g) => g),
  ].slice(0, 4);

  const workerView = {
    summary: `Session OPI ${indices.opi}% — ${supportiveBandMessage(sc.band)}`,
    strengths,
    improvementAreas,
    coachingRecommendations: sc.supportiveRecommendations,
    supportiveBandMessage: supportiveBandMessage(sc.band),
  };

  const operationalView = {
    summary: `${session.metadata.workerName} · ${session.metadata.centerName} — ${sc.band.toUpperCase()} band · AI confidence ${aiConfidence}%`,
    actionItems: flagged
      ? ["Schedule supportive observation", "Assign coaching module", "Review within 7 days"]
      : ["Acknowledge strong delivery", "Share best practice in cluster"],
    coachingQueuePriority: (sc.band === "red" ? "high" : sc.band === "orange" ? "medium" : "low") as
      | "low"
      | "medium"
      | "high",
    syllabusCompletionPct: indices.sai,
    engagementTrend: indices.cei >= 70 ? "up" : indices.cei >= 55 ? "stable" : "down",
  };

  const executiveView = {
    summary: `${center?.district ?? "District"} · ${session.metadata.centerName} — operational index ${indices.opi}% (aggregated view)`,
    riskIndicator: (sc.band === "red" ? "high" : sc.band === "orange" ? "medium" : "low") as
      | "low"
      | "medium"
      | "high",
    districtAttention: flagged,
    interventionHint: flagged ? "Consider district coaching visit or infrastructure review" : undefined,
  };

  const timelineReplay: ClassroomTimelineStep[] = [
    { step: "Session recorded", status: "done", at: session.createdAt },
    { step: "AI analysis", status: "done", at: session.processedAt },
    { step: "Supervisor coaching", status: sc.band === "green" ? "pending" : "active" },
    { step: "Worker training", status: "pending" },
    { step: "Next session", status: "pending" },
    { step: "Improvement measured", status: "pending" },
  ];

  return {
    sessionId: session.id,
    centerId: session.metadata.centerId,
    centerName: session.metadata.centerName,
    workerId: session.metadata.workerId,
    workerName: session.metadata.workerName,
    district: center?.district ?? "Tirupati",
    syllabusCategory: session.metadata.syllabusCategory,
    publishedAt: new Date().toISOString(),
    indices,
    band: sc.band,
    aiConfidence,
    flagged,
    repeatedIssueTags,
    coachingRecommended: sc.band !== "green",
    workerView,
    operationalView,
    executiveView,
    heatmap: buildHeatmap(sc),
    timelineReplay,
  };
}

export function publishClassroomIntelligence(
  session: SessionRecording,
  allSessions: SessionRecording[]
): ClassroomSessionAnalytics | null {
  return buildClassroomAnalytics(session, allSessions);
}

export function backfillClassroomAnalytics(
  sessions: SessionRecording[]
): Record<string, ClassroomSessionAnalytics> {
  const map: Record<string, ClassroomSessionAnalytics> = {};
  sessions
    .filter((s) => s.scorecard)
    .forEach((s) => {
      const a = buildClassroomAnalytics(s, sessions);
      if (a) map[s.id] = a;
    });
  return map;
}
