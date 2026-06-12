import { InterventionRecommendation, InterventionDimension } from "@/types/intelligence";
import { mockCenters } from "@/data/mockData";
import { ChildProgressRecord } from "@/types/intelligence";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { BeneficiarySurvey } from "@/types/intelligence";

function avgSurvey(surveys: BeneficiarySurvey[]) {
  const done = surveys.filter((s) => s.responses);
  if (!done.length) return 4;
  return done.reduce((a, s) => a + (s.responses!.overallSatisfaction), 0) / done.length;
}

function baseRec(partial: Omit<InterventionRecommendation, "createdAt" | "status">): InterventionRecommendation {
  return {
    ...partial,
    createdAt: new Date().toISOString(),
    status: "proposed",
    confidence: partial.confidence ?? 0.82,
    implementationEffort: partial.implementationEffort ?? "medium",
    projectedOutcomeDelta: partial.projectedOutcomeDelta ?? 12,
    owner: partial.owner ?? "District CDPO",
    timelineDue: partial.timelineDue ?? new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10),
  };
}

export function generateInterventions(
  centerId: string,
  ctx: {
    sessions: SessionRecording[];
    complaints: ComplaintRecord[];
    feedback: FeedbackEntry[];
    childProgress: ChildProgressRecord[];
    surveys: BeneficiarySurvey[];
  }
): InterventionRecommendation[] {
  const center = mockCenters.find((c) => c.id === centerId);
  if (!center) return [];

  const recs: InterventionRecommendation[] = [];
  const centerSessions = ctx.sessions.filter((s) => s.metadata.centerId === centerId);
  const redSessions = centerSessions.filter((s) => s.scorecard?.band === "red").length;
  const orangeSessions = centerSessions.filter((s) => s.scorecard?.band === "orange").length;
  const openComplaints = ctx.complaints.filter((c) => c.centerId === centerId && c.status !== "closed").length;
  const repeatComplaints = ctx.complaints.filter((c) => c.centerId === centerId && (c.repeatCount ?? 0) >= 2).length;
  const progress = ctx.childProgress.filter((p) => p.centerId === centerId);
  const declining = progress.filter((p) => !p.attended || p.preschoolParticipation < 0.5).length;
  const sat = avgSurvey(ctx.surveys.filter((s) => s.centerId === centerId));

  if (redSessions >= 1 || orangeSessions >= 2) {
    recs.push(
      baseRec({
        id: `INT-TR-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "worker_training",
        priority: 1,
        urgency: "high",
        title: "Accelerated training pathway",
        description: "Session AI flagged engagement gaps; assign mentorship modules within 7 days.",
        expectedImpact: "15–20% OPI improvement in 4 weeks",
        evidenceSummary: `${redSessions} red, ${orangeSessions} orange session(s)`,
        implementationEffort: "medium",
        projectedOutcomeDelta: 18,
        confidence: 0.88,
      })
    );
    recs.push(
      baseRec({
        id: `INT-COACH-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "worker_coaching",
        priority: 1,
        urgency: "high",
        title: "Supervisor-led coaching cycle",
        description: "Pair worker with supervisor for 3 observed sessions — supportive, not punitive.",
        expectedImpact: "Band uplift green within 6 weeks",
        evidenceSummary: "AI coaching triggers from session evaluation",
        implementationEffort: "low",
        projectedOutcomeDelta: 15,
        confidence: 0.9,
      })
    );
  }
  if (openComplaints >= 2) {
    recs.push(
      baseRec({
        id: `INT-SA-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "supervisor_attention",
        priority: 2,
        urgency: "high",
        title: "Supervisor field audit",
        description: "Repeated grievances suggest systemic issues requiring mandal visit.",
        expectedImpact: "Reduce open complaints by 40% in 30 days",
        evidenceSummary: `${openComplaints} open grievances`,
        implementationEffort: "medium",
        projectedOutcomeDelta: 22,
      })
    );
    recs.push(
      baseRec({
        id: `INT-VISIT-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "operational_visit",
        priority: 2,
        urgency: "critical",
        title: "District operational visit",
        description: "On-site inspection with photo evidence and beneficiary spot-check.",
        expectedImpact: "SLA compliance restored within 14 days",
        evidenceSummary: "Complaint pattern + SLA risk",
        implementationEffort: "high",
        projectedOutcomeDelta: 25,
        confidence: 0.86,
      })
    );
  }
  if (center.compliance < 75 || center.status === "critical") {
    recs.push(
      baseRec({
        id: `INT-INF-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "infrastructure",
        priority: 3,
        urgency: "medium",
        title: "Infrastructure upgrade review",
        description: "Compliance and facility feedback indicate repair or supply needs.",
        expectedImpact: "Improved cleanliness & safety scores",
        evidenceSummary: `Compliance ${center.compliance}%, status ${center.status}`,
        implementationEffort: "high",
        projectedOutcomeDelta: 10,
      })
    );
  }
  if (declining >= 2) {
    recs.push(
      baseRec({
        id: `INT-RES-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "resource_allocation",
        priority: 2,
        urgency: "high",
        title: "Nutrition & outreach resources",
        description: "Child outcome data shows attendance/nutrition gaps — allocate supplementary ration review.",
        expectedImpact: "Recover 10+ attendance days per month",
        evidenceSummary: `${declining} children with declining participation`,
        projectedOutcomeDelta: 14,
      })
    );
  }
  if (sat < 3.5) {
    recs.push(
      baseRec({
        id: `INT-SAT-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "community_outreach",
        priority: 1,
        urgency: "medium",
        title: "Community outreach — parent trust",
        description: "30-day parent communication cadence + satisfaction surveys after each activity.",
        expectedImpact: "+0.5 satisfaction points in 60 days",
        evidenceSummary: `Avg survey satisfaction ${sat.toFixed(1)}/5`,
        implementationEffort: "low",
        projectedOutcomeDelta: 8,
        owner: "Supervisor — field team",
      })
    );
  }
  if (openComplaints >= 1 || repeatComplaints > 0) {
    recs.push(
      baseRec({
        id: `INT-MON-${centerId}`,
        centerId,
        centerName: center.name,
        dimension: "monitoring_visit",
        priority: 2,
        urgency: "high",
        title: "Monitoring visit — verify service recovery",
        description: "Structured visit checklist: session quality, meal service, grievance closure evidence.",
        expectedImpact: "Measurable AEI uplift within 21 days",
        evidenceSummary: `${openComplaints} open grievance(s)`,
        owner: "Supervisor",
        projectedOutcomeDelta: 18,
      })
    );
  }
  return recs.sort((a, b) => a.priority - b.priority);
}

export const DIMENSION_LABELS: Record<InterventionDimension, string> = {
  worker_training: "Training",
  worker_coaching: "Worker Coaching",
  infrastructure: "Infrastructure Support",
  supervisor_attention: "Supervisor Attention",
  resource_allocation: "Resource Allocation",
  operational_visit: "Monitoring Visit",
  follow_up_plan: "Follow-up Plan",
  community_outreach: "Community Outreach",
  monitoring_visit: "Monitoring Visit",
};

export function normalizeInterventionStatus(s: InterventionRecommendation["status"]): InterventionRecommendation["status"] {
  if (s === "recommended") return "proposed";
  if (s === "in_progress") return "active";
  return s;
}
