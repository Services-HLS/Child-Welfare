import { ComplaintCategory, ComplaintRecord, ComplaintStatus, EscalationLevel, Lang } from "@/types/platform";
import { FeedbackChannel } from "@/types/feedback-channels";
import { GrievanceAIAnalysis } from "@/types/grievance";

const CATEGORY_RULES: { keywords: string[]; category: ComplaintCategory; severity: ComplaintRecord["severity"] }[] = [
  { keywords: ["meal", "food", "nutrition", "rice", "egg", "delivered"], category: "hot_cooked_meals", severity: "high" },
  { keywords: ["quality", "stale", "portion"], category: "nutrition_quality", severity: "medium" },
  { keywords: ["water", "drink", "thirst"], category: "drinking_water", severity: "high" },
  { keywords: ["toilet", "clean", "dirty", "hygiene", "wash"], category: "cleanliness", severity: "high" },
  { keywords: ["building", "roof", "wall", "damage", "infrastructure"], category: "infrastructure", severity: "medium" },
  { keywords: ["rude", "shout", "behavior", "staff"], category: "worker_behavior", severity: "high" },
  { keywords: ["safe", "injury", "hurt", "abuse"], category: "child_safety", severity: "critical" },
  { keywords: ["absent", "attendance", "register"], category: "attendance", severity: "medium" },
  { keywords: ["service", "delay", "not provided"], category: "service_delivery", severity: "medium" },
  { keywords: ["policy", "scheme", "entitlement"], category: "other_concerns", severity: "medium" },
];

export interface GrievanceClassification {
  category: ComplaintCategory;
  severity: NonNullable<ComplaintRecord["severity"]>;
  urgencyScore: number;
  slaHours: number;
  routingPath: string[];
  recommendedStatus: ComplaintStatus;
  summary: string;
}

function classifyFromText(text: string, rating: number): { category: ComplaintCategory; severity: GrievanceClassification["severity"] } {
  const lower = text.toLowerCase();
  let category: ComplaintCategory = "other_concerns";
  let severity: GrievanceClassification["severity"] = "low";

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      category = rule.category;
      severity = rule.severity;
      break;
    }
  }
  if (rating <= 2) severity = severity === "low" ? "medium" : severity;
  if (/critical|emergency|unsafe/.test(lower)) severity = "critical";
  return { category, severity };
}

function supervisorRoutingPath(severity: GrievanceClassification["severity"], category: ComplaintCategory): string[] {
  if (category === "infrastructure" || category === "cleanliness" || category === "drinking_water") {
    return ["AI Processing", "Supervisor Review", "District (if unresolved)"];
  }
  if (category === "other_concerns" || category === "other") {
    return ["AI Processing", "Supervisor Review", "District", "State Policy Desk"];
  }
  if (severity === "critical") {
    return ["AI Processing", "Supervisor Review", "District Escalation"];
  }
  return ["AI Processing", "Supervisor Review", "Resolution", "Public Confirmation"];
}

export function classifyGrievance(text: string, rating: number, channel: FeedbackChannel): GrievanceClassification {
  const { category, severity } = classifyFromText(text, rating);
  const urgencyScore = severity === "critical" ? 0.95 : severity === "high" ? 0.8 : severity === "medium" ? 0.55 : 0.35;
  const slaHours = severity === "critical" ? 12 : severity === "high" ? 24 : severity === "medium" ? 48 : 72;
  const routingPath = supervisorRoutingPath(severity, category);

  return {
    category,
    severity,
    urgencyScore,
    slaHours,
    routingPath,
    recommendedStatus: "supervisor_review",
    summary: `Classified via ${channel}: ${category.replace(/_/g, " ")} (${severity})`,
  };
}

export function analyzePublicGrievance(
  text: string,
  rating: number,
  channel: FeedbackChannel,
  lang: Lang = "en"
): GrievanceAIAnalysis {
  const g = classifyGrievance(text, rating, channel);
  const confidence = Math.min(0.98, 0.75 + g.urgencyScore * 0.2);
  return {
    issueClassification: g.category,
    severity: g.severity,
    extractedContext: text.slice(0, 500),
    detectedLanguage: lang,
    suggestedResolutionPath: g.routingPath,
    recommendedAction:
      g.severity === "critical"
        ? "Supervisor immediate review with district alert"
        : "Supervisor investigation using citizen evidence — no worker routing",
    confidence: Math.round(confidence * 100) / 100,
    summary: g.summary,
  };
}

export function shouldEscalate(
  complaint: ComplaintRecord,
  context: { repeatCount: number; workerRedFlags: number; avgSatisfaction: number }
): { escalate: boolean; toLevel: EscalationLevel; reason: string; ruleId: string } | null {
  if (complaint.severity === "critical" || complaint.grievance?.aiAnalysis?.severity === "critical") {
    return { escalate: true, toLevel: "district", reason: "Critical child safety concern", ruleId: "RULE-SAFETY" };
  }
  if (new Date(complaint.slaDueAt) < new Date() && complaint.status !== "closed") {
    return { escalate: true, toLevel: "supervisor", reason: "SLA breach — supervisor priority", ruleId: "RULE-SLA" };
  }
  if (context.repeatCount >= 2) {
    return { escalate: true, toLevel: "district", reason: "Repeated complaints at center", ruleId: "RULE-REPEAT" };
  }
  const cat = complaint.category;
  if (["infrastructure", "cleanliness", "drinking_water"].includes(cat)) {
    return { escalate: true, toLevel: "district", reason: "Infrastructure issue — district engineering review", ruleId: "RULE-INFRA" };
  }
  if (["other", "other_concerns"].includes(cat) && context.repeatCount >= 1) {
    return { escalate: true, toLevel: "district", reason: "Policy matter — district coordination", ruleId: "RULE-POLICY" };
  }
  if (context.avgSatisfaction < 2.5) {
    return { escalate: true, toLevel: "district", reason: "Low citizen satisfaction trend", ruleId: "RULE-SAT" };
  }
  return null;
}
