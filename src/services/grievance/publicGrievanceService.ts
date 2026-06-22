import { ComplaintRecord, ComplaintCategory, ComplaintStatus } from "@/types/platform";
import { PublicGrievancePriority } from "@/types/grievance";

export type SupervisorGrievanceBucket = "new" | "in_review" | "need_evidence" | "resolved";

export function isPublicSupervisorGrievance(c: ComplaintRecord): boolean {
  return c.grievance?.ownerRole === "supervisor" || (!c.assignedWorkerId && !!c.feedbackId);
}

/** True once a supervisor has actively taken the case (not the auto-queue note on intake). */
export function hasSupervisorStartedReview(c: ComplaintRecord): boolean {
  return (c.grievanceActions ?? []).some(
    (a) =>
      a.ownerRole === "supervisor" &&
      !/queued for supervisor investigation|public grievance \(no worker/i.test(a.notes)
  );
}

export function supervisorBucket(c: ComplaintRecord): SupervisorGrievanceBucket {
  if (c.status === "closed" || c.status === "beneficiary_confirmation" || c.status === "rejected") return "resolved";
  if (c.status === "need_evidence") return "need_evidence";
  if (["district_escalation", "state_escalation", "resolution"].includes(c.status)) return "in_review";
  if (["ai_processing", "channel_intake", "classified", "submitted"].includes(c.status)) return "new";
  if (c.status === "supervisor_review" && !hasSupervisorStartedReview(c)) return "new";
  return "in_review";
}

/** Escalation path by complaint type — no worker hop */
export function escalationPathForComplaint(
  category: ComplaintCategory,
  repeatCount: number
): string[] {
  const policyCats: ComplaintCategory[] = ["other_concerns", "other"];
  const infraCats: ComplaintCategory[] = ["infrastructure", "cleanliness", "drinking_water"];

  if (policyCats.includes(category)) return ["Supervisor", "District", "State"];
  if (infraCats.includes(category)) return ["Supervisor", "District"];
  if (repeatCount >= 2) return ["Supervisor", "District"];
  return ["Supervisor"];
}

export function priorityLabel(p?: PublicGrievancePriority | string): string {
  if (!p) return "Medium";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function aiSeverityLabel(c: ComplaintRecord): string {
  return c.grievance?.aiAnalysis?.severity ?? c.severity ?? "medium";
}

export const PUBLIC_GRIEVANCE_TIMELINE = [
  "Submitted",
  "AI Reviewed",
  "Supervisor Reviewing",
  "Action Taken",
  "Resolution Uploaded",
  "Citizen Confirmation",
  "Closed",
] as const;

export function publicTimelineIndex(status: ComplaintStatus): number {
  const map: Record<string, number> = {
    channel_intake: 0,
    ai_processing: 1,
    classified: 1,
    submitted: 0,
    supervisor_review: 2,
    need_evidence: 2,
    resolution: 4,
    district_escalation: 3,
    state_escalation: 3,
    beneficiary_confirmation: 5,
    closed: 6,
  };
  return map[status] ?? 2;
}
