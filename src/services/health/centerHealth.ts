import { CenterHealthProfile } from "@/types/intelligence";
import { Center, ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { ChildProgressRecord, BeneficiarySurvey } from "@/types/intelligence";
import { AnganwadiExcellenceIndex } from "@/types/intelligence";
import { SessionRecording } from "@/types/session";

export function buildCenterHealthProfile(
  center: Center,
  aei: AnganwadiExcellenceIndex,
  ctx: {
    complaints: ComplaintRecord[];
    feedback: FeedbackEntry[];
    childProgress: ChildProgressRecord[];
    activities: ActivityLog[];
    surveys: BeneficiarySurvey[];
    sessions?: SessionRecording[];
  }
): CenterHealthProfile {
  const factors: CenterHealthProfile["factors"] = [];
  const sessions = ctx.sessions ?? [];
  const centerSessions = sessions.filter((s) => s.metadata.centerId === center.id && s.scorecard);
  const avgOpi = centerSessions.length
    ? centerSessions.reduce((a, s) => a + s.scorecard!.overallPerformanceIndex, 0) / centerSessions.length
    : 0.7;

  const open = ctx.complaints.filter((c) => c.centerId === center.id && c.status !== "closed");
  if (open.length > 0) {
    factors.push({ label: "Unresolved grievances", severity: open.length >= 2 ? "high" : "medium", detail: `${open.length} open complaint(s)` });
  }
  const repeat = ctx.complaints.filter((c) => c.centerId === center.id && (c.repeatCount ?? 0) >= 2).length;
  if (repeat > 0) {
    factors.push({ label: "Repeated complaints", severity: "high", detail: `${repeat} repeat grievance pattern(s)` });
  }
  if (avgOpi < 0.55) {
    factors.push({ label: "Low session quality", severity: "high", detail: `Average OPI ${(avgOpi * 100).toFixed(0)}% across recent sessions` });
  }
  if (aei.components.childEngagement < 60) {
    factors.push({ label: "Weak child engagement", severity: "high", detail: `Engagement component ${aei.components.childEngagement}%` });
  }
  const negFb = ctx.feedback.filter((f) => f.centerId === center.id && f.rating <= 2).length;
  if (negFb > 0) {
    factors.push({ label: "Declining beneficiary satisfaction", severity: "medium", detail: `${negFb} low-rating feedback signal(s)` });
  }
  const acts = ctx.activities.filter((a) => a.centerId === center.id);
  const avgConf = acts.length ? acts.reduce((a, x) => a + (x.aiConfidence ?? 0.5), 0) / acts.length : 0.7;
  if (avgConf < 0.65) {
    factors.push({ label: "Service verification confidence", severity: "medium", detail: `AI evidence confidence ${(avgConf * 100).toFixed(0)}%` });
  }
  const absences = ctx.childProgress.filter((p) => p.centerId === center.id && !p.attended).length;
  if (absences >= 2) {
    factors.push({ label: "Attendance inconsistency", severity: "medium", detail: `${absences} absence records` });
  }
  if (center.compliance < 75) {
    factors.push({ label: "Service inconsistency", severity: "medium", detail: `Compliance ${center.compliance}%` });
  }
  if (center.status === "critical" || center.status === "warning") {
    factors.push({ label: "Infrastructure concerns", severity: "high", detail: `Facility status: ${center.status}` });
  }

  const highCount = factors.filter((f) => f.severity === "high").length;
  const riskLevel = highCount >= 2 ? "high" : factors.length >= 2 ? "medium" : "low";
  const riskScore = Math.min(100, Math.round(100 - aei.score + highCount * 8));
  const confidence = Math.round(0.78 + Math.min(0.15, centerSessions.length * 0.02));
  const trendDirection = aei.trend === "up" ? "improving" : aei.trend === "down" ? "declining" : "stable";

  const recommendedActions = [
    ...aei.recommendations,
    avgOpi < 0.6 ? "Worker coaching on engagement — supervisor observation session" : null,
    open.length > 0 ? "Beneficiary outreach and grievance closure survey" : null,
    negFb > 0 ? "Community outreach — parent communication cadence" : null,
    center.status !== "healthy" ? "Infrastructure support request to district" : null,
    repeat > 0 ? "Monitoring visit within 7 days" : null,
  ].filter(Boolean) as string[];

  return {
    centerId: center.id,
    centerName: center.name,
    riskLevel,
    riskScore,
    confidence,
    trendDirection,
    summary:
      riskLevel === "high"
        ? `${center.name} needs supportive intervention — explainable factors below with assigned actions (not punitive).`
        : riskLevel === "medium"
          ? `${center.name} has improvement opportunities; AEI ${aei.score} (${aei.band}).`
          : `${center.name} operational health is stable; maintain current improvement loop.`,
    factors,
    recommendedActions,
  };
}
