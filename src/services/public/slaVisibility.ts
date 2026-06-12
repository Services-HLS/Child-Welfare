import { ComplaintRecord } from "@/types/platform";
import { differenceInHours, differenceInMinutes } from "date-fns";

export interface SLABadge {
  targetHours: number;
  dueAt: string;
  hoursRemaining: number;
  minutesRemaining: number;
  breached: boolean;
  label: string;
  escalationHint: string;
}

export function getSLAVisibility(c: ComplaintRecord): SLABadge {
  const targetHours = c.slaHours ?? 48;
  const due = new Date(c.slaDueAt);
  const now = new Date();
  const breached = due < now && c.status !== "closed";
  const hoursRemaining = Math.max(0, differenceInHours(due, now));
  const minutesRemaining = Math.max(0, differenceInMinutes(due, now) % 60);

  let escalationHint = "Supervisor review (no worker routing)";
  if (c.status === "district_escalation") escalationHint = "Escalated to District administration";
  if (c.status === "state_escalation") escalationHint = "Escalated to State policy desk";
  if (c.escalationLevel === "district") escalationHint = "May move Supervisor → District if unresolved";

  const label = breached
    ? "SLA breached — priority escalation"
    : hoursRemaining < 6
      ? `${hoursRemaining}h ${minutesRemaining}m remaining`
      : `${hoursRemaining} hours remaining`;

  return {
    targetHours,
    dueAt: c.slaDueAt,
    hoursRemaining,
    minutesRemaining,
    breached,
    label,
    escalationHint,
  };
}

export function requestBucketLabel(
  status: string
): "submitted" | "under_review" | "action_taken" | "escalated" | "resolved" | "closed" {
  if (status === "closed") return "closed";
  if (status === "beneficiary_confirmation" || status === "resolution") return "resolved";
  if (["district_escalation", "state_escalation"].includes(status)) return "escalated";
  if (["supervisor_review", "need_evidence", "ai_processing", "classified"].includes(status))
    return "under_review";
  if (status === "channel_intake" || status === "submitted") return "submitted";
  return "action_taken";
}
