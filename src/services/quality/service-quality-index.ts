import { ServiceQualityScore } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { ActivityLog, Center } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { BeneficiarySurvey } from "@/types/intelligence";

export function computeCenterServiceQuality(
  center: Center,
  sessions: SessionRecording[],
  complaints: ComplaintRecord[],
  feedback: FeedbackEntry[],
  activities: ActivityLog[],
  surveys: BeneficiarySurvey[] = [],
  options?: { sessionEvalPenalty?: number; sessionEvalBoost?: number }
): ServiceQualityScore {
  const centerSessions = sessions.filter((s) => s.metadata.centerId === center.id && s.scorecard);
  let sessionEval =
    centerSessions.length > 0
      ? centerSessions.reduce((a, s) => a + (s.scorecard?.overallPerformanceIndex ?? 0), 0) / centerSessions.length
      : center.compliance / 100;
  if (options?.sessionEvalPenalty) sessionEval = Math.max(0, sessionEval - options.sessionEvalPenalty);
  if (options?.sessionEvalBoost) sessionEval = Math.min(1, sessionEval + options.sessionEvalBoost);

  const openComplaints = complaints.filter((c) => c.centerId === center.id && c.status !== "closed").length;
  const complaintVolume = Math.max(0, 100 - openComplaints * 12);

  const centerFeedback = feedback.filter((f) => f.centerId === center.id);
  const centerSurveys = surveys.filter((s) => s.centerId === center.id && s.responses);
  const surveyAvg = centerSurveys.length
    ? centerSurveys.reduce((a, s) => a + s.responses!.overallSatisfaction, 0) / centerSurveys.length / 5
    : null;
  const feedbackAvg = centerFeedback.length > 0 ? centerFeedback.reduce((a, f) => a + f.rating, 0) / centerFeedback.length / 5 : 0.75;
  const beneficiarySatisfaction = (surveyAvg !== null ? surveyAvg * 0.55 + feedbackAvg * 0.45 : feedbackAvg) * 100;

  const centerActs = activities.filter((a) => a.centerId === center.id);
  const verificationConfidence =
    centerActs.length > 0
      ? (centerActs.reduce((a, x) => a + (x.aiConfidence ?? 0.5), 0) / centerActs.length) * 100
      : 70;

  const workerPerformance = sessionEval * 100;
  const attendance = center.compliance;
  const overallIndex = Math.round(
    workerPerformance * 0.22 +
      sessionEval * 100 * 0.2 +
      complaintVolume * 0.18 +
      beneficiarySatisfaction * 0.18 +
      attendance * 0.12 +
      verificationConfidence * 0.1
  );

  return {
    centerId: center.id,
    centerName: center.name,
    district: center.district,
    overallIndex: Math.min(100, overallIndex),
    workerPerformance: Math.round(workerPerformance),
    sessionEvaluation: Math.round(sessionEval * 100),
    complaintVolume: Math.round(complaintVolume),
    beneficiarySatisfaction: Math.round(beneficiarySatisfaction),
    attendance: Math.round(attendance),
    verificationConfidence: Math.round(verificationConfidence),
    trend: overallIndex >= 80 ? "up" : overallIndex < 65 ? "down" : "stable",
    updatedAt: new Date().toISOString(),
  };
}

export function rankDistrictCenters(scores: ServiceQualityScore[]): ServiceQualityScore[] {
  return [...scores].sort((a, b) => b.overallIndex - a.overallIndex).map((s, i) => ({ ...s, rank: i + 1 }));
}
