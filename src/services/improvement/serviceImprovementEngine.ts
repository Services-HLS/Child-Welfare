import { AnganwadiExcellenceIndex, CenterJourneyPhase } from "@/types/intelligence";
import { computeAEI } from "@/services/excellence/aei";
import { Center, ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { ChildProgressRecord, BeneficiarySurvey, InterventionRecommendation } from "@/types/intelligence";
import { CoachingAssignment } from "@/types/session";

/** Bidirectional improvement: closure → satisfaction → AEI; coaching → worker performance */
export function applyImprovementEffects(ctx: {
  center: Center;
  trigger: "complaint_closed" | "survey_positive" | "coaching_completed" | "session_green" | "center_recovery";
  sessions: SessionRecording[];
  complaints: ComplaintRecord[];
  feedback: FeedbackEntry[];
  activities: ActivityLog[];
  childProgress: ChildProgressRecord[];
  surveys: BeneficiarySurvey[];
}): { aei: AnganwadiExcellenceIndex; delta: number; message: string } {
  let boost = 0;
  let message = "";
  switch (ctx.trigger) {
    case "complaint_closed":
      boost = 5;
      message = "Resolution completed — beneficiary trust and AEI satisfaction component improved";
      break;
    case "survey_positive":
      boost = 4;
      message = "Beneficiary survey lifted satisfaction index";
      break;
    case "coaching_completed":
      boost = 6;
      message = "Training assigned and completed — worker performance trajectory improved";
      break;
    case "session_green":
      boost = 3;
      message = "AI verified strong session — worker performance reinforced";
      break;
    case "center_recovery":
      boost = 8;
      message = "Center recovery — measurable outcome improvement on AEI";
      break;
  }
  const before = computeAEI(ctx.center, { ...ctx, satisfactionBoost: 0 });
  const after = computeAEI(ctx.center, { ...ctx, satisfactionBoost: boost });
  return { aei: after, delta: after.score - before.score, message };
}

/** Canonical 7-step center lifecycle for Center Journey */
export function buildCenterJourneyPhases(centerId: string, ctx: {
  sessions: SessionRecording[];
  activities: ActivityLog[];
  feedback: FeedbackEntry[];
  complaints: ComplaintRecord[];
  coaching: CoachingAssignment[];
  childProgress: ChildProgressRecord[];
  interventions: InterventionRecommendation[];
}): CenterJourneyPhase[] {
  const centerSessions = ctx.sessions.filter((s) => s.metadata.centerId === centerId);
  const hasService = ctx.activities.some((a) => a.centerId === centerId) || centerSessions.length > 0;
  const hasAi = centerSessions.some((s) => s.scorecard);
  const hasFeedback = ctx.feedback.some((f) => f.centerId === centerId);
  const complaints = ctx.complaints.filter((c) => c.centerId === centerId);
  const hasComplaint = complaints.length > 0;
  const resolved = complaints.some((c) => c.status === "closed");
  const hasTraining = ctx.coaching.some((c) => c.centerId === centerId) ||
    ctx.interventions.some((i) => i.centerId === centerId && i.status !== "proposed");
  const hasOutcome = ctx.childProgress.some((p) => p.centerId === centerId && p.preschoolParticipation >= 0.7);
  const recovered = hasOutcome && (resolved || centerSessions.some((s) => s.scorecard?.band === "green"));

  const latestSession = centerSessions[0];
  const latestFeedback = ctx.feedback.filter((f) => f.centerId === centerId).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  return [
    {
      id: "service",
      label: "Service Delivered",
      status: hasService ? "complete" : "pending",
      narrative: "Worker logs attendance, nutrition, preschool activities with GPS and photo/video evidence",
      timestamp: ctx.activities.find((a) => a.centerId === centerId)?.timestamp ?? latestSession?.createdAt,
    },
    {
      id: "ai",
      label: "AI Verified",
      status: hasAi ? "complete" : hasService ? "active" : "pending",
      narrative: hasAi
        ? `Session OPI ${((latestSession!.scorecard!.overallPerformanceIndex) * 100).toFixed(0)}% — ${latestSession!.scorecard!.band} band (supportive coaching if orange/red)`
        : "Awaiting session upload and AI evaluation",
      timestamp: latestSession?.processedAt ?? latestSession?.createdAt,
      link: latestSession ? `/session-explanation/${latestSession.id}` : undefined,
    },
    {
      id: "beneficiary",
      label: "Beneficiary Responded",
      status: hasFeedback ? "complete" : "pending",
      narrative: hasFeedback
        ? `Parent feedback ${latestFeedback?.rating}/5 — sentiment analyzed; visible in beneficiary portal`
        : "No beneficiary response yet this period",
      timestamp: latestFeedback?.timestamp,
    },
    {
      id: "complaint",
      label: "Complaint Generated",
      status: hasComplaint ? (resolved ? "complete" : "active") : "complete",
      narrative: hasComplaint
        ? `${complaints.length} grievance(s) — AI classified with SLA and escalation rules`
        : "No grievance required — satisfaction within thresholds",
      timestamp: complaints[0]?.createdAt,
      link: complaints[0] ? `/grievance-explanation/${complaints[0].id}` : undefined,
    },
    {
      id: "resolution",
      label: "Resolution Completed",
      status: resolved ? "complete" : hasComplaint ? "active" : "pending",
      narrative: resolved
        ? "Grievance closed with beneficiary confirmation — trust loop updated"
        : hasComplaint ? "Resolution in progress" : "Not applicable",
      timestamp: complaints.find((c) => c.status === "closed")?.updatedAt,
    },
    {
      id: "training",
      label: "Training Assigned",
      status: hasTraining ? "complete" : "pending",
      narrative: "Supportive coaching and intervention modules assigned to worker",
      timestamp: ctx.coaching[0]?.createdAt ?? ctx.interventions[0]?.createdAt,
    },
    {
      id: "outcome",
      label: "Outcome Improved",
      status: recovered ? "complete" : hasOutcome ? "active" : "pending",
      narrative: recovered
        ? "Child outcomes and AEI trending toward green — center recovery measured"
        : "Track CWI and participation for improvement evidence",
    },
  ];
}

export function buildOperationalFlow(centerId: string, ctx: Parameters<typeof buildCenterJourneyPhases>[1]): import("@/types/intelligence").OperationalFlowStep[] {
  return buildCenterJourneyPhases(centerId, ctx).map((p) => ({
    id: p.id,
    label: p.label,
    status: p.status,
    narrative: p.narrative,
    timestamp: p.timestamp,
  }));
}
