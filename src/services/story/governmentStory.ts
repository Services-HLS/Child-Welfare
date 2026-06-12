import { GovernmentStoryInsight } from "@/types/intelligence";
import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { ChildProgressRecord } from "@/types/intelligence";
import { ServiceQualityScore } from "@/types/platform";

export function generateGovernmentStory(ctx: {
  activities: ActivityLog[];
  sessions: SessionRecording[];
  complaints: ComplaintRecord[];
  feedback: FeedbackEntry[];
  childProgress: ChildProgressRecord[];
  serviceQualityScores: ServiceQualityScore[];
}): GovernmentStoryInsight[] {
  const completedSessions = ctx.sessions.filter((s) => s.status === "completed").length;
  const closedComplaints = ctx.complaints.filter((c) => c.status === "closed").length;
  const openComplaints = ctx.complaints.filter((c) => c.status !== "closed").length;
  const avgSat =
    ctx.feedback.length > 0 ? ctx.feedback.reduce((a, f) => a + f.rating, 0) / ctx.feedback.length : 4;
  const atRisk = ctx.serviceQualityScores.filter((s) => s.overallIndex < 65).length;
  const improving = ctx.childProgress.filter((p) => p.preschoolParticipation >= 0.8).length;
  const todayActs = ctx.activities.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return [
    {
      id: "ST-1",
      headline: "Operations pulse",
      narrative: `Today ${todayActs} service logs were captured statewide. ${completedSessions} preschool sessions completed AI evaluation this period, strengthening workforce transparency.`,
      metric: `${todayActs} today`,
      trend: "up",
      category: "operations",
    },
    {
      id: "ST-2",
      headline: "Service quality trajectory",
      narrative: `Average Service Quality Index across monitored centers is ${ctx.serviceQualityScores.length ? Math.round(ctx.serviceQualityScores.reduce((a, s) => a + s.overallIndex, 0) / ctx.serviceQualityScores.length) : 78}. ${atRisk} centers flagged for targeted intervention.`,
      metric: `${atRisk} at risk`,
      trend: atRisk > 3 ? "down" : "stable",
      category: "quality",
    },
    {
      id: "ST-3",
      headline: "Grievance accountability",
      narrative: `${closedComplaints} grievances reached closure with beneficiary confirmation pathways. ${openComplaints} remain active with SLA monitoring and escalation rules engaged.`,
      metric: `${closedComplaints} closed`,
      trend: "up",
      category: "grievance",
    },
    {
      id: "ST-4",
      headline: "Child outcome signal",
      narrative: `${improving} child progress records show strong preschool participation this week, indicating services are translating into engagement outcomes—not only attendance logs.`,
      trend: "up",
      category: "outcomes",
    },
    {
      id: "ST-5",
      headline: "Citizen trust",
      narrative: `Beneficiary satisfaction averages ${avgSat.toFixed(1)}/5 from surveys and feedback. Declining trust is detected early via sentiment trends before complaints spike.`,
      metric: `${avgSat.toFixed(1)}/5`,
      trend: avgSat >= 4 ? "up" : "down",
      category: "trust",
      recommendedAction: avgSat < 3.5 ? "Launch trust recovery follow-up plans in low-satisfaction mandals" : "Continue publishing transparency aggregates",
    },
    {
      id: "ST-6",
      headline: "Districts needing support",
      narrative: `Tirupati and Kurnool blocks show the widest SQI–CWI gap—service delivery is logged but child participation lags. Mission Control recommends operational visits where CWI < 65.`,
      trend: "down",
      category: "outcomes",
      recommendedAction: "Open /state-admin/mission-control and approve district interventions",
    },
    {
      id: "ST-7",
      headline: "Intervention impact",
      narrative: `Coaching and infrastructure interventions are tracked through Proposed → Impact Measured states. Centers with completed coaching show greener session bands in follow-up evaluations.`,
      category: "quality",
      recommendedAction: "Review /district-admin/interventions for approvals",
    },
  ];
}
