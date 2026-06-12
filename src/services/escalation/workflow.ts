import { ComplaintRecord, ComplaintStatus, EscalationRecord, EscalationLevel } from "@/types/platform";
import { shouldEscalate } from "@/services/ai/grievance-engine";

export const ESCALATION_FLOW: ComplaintStatus[] = [
  "channel_intake",
  "ai_processing",
  "classified",
  "supervisor_review",
  "need_evidence",
  "district_escalation",
  "state_escalation",
  "resolution",
  "beneficiary_confirmation",
  "closed",
];

export function mapLegacyStatus(status: ComplaintStatus): ComplaintStatus {
  const map: Partial<Record<ComplaintStatus, ComplaintStatus>> = {
    submitted: "channel_intake",
    ai_classification: "ai_processing",
    assigned: "classified",
    worker_response: "supervisor_review",
    assigned: "supervisor_review",
    supervisor_approval: "supervisor_review",
  };
  return map[status] ?? status;
}

export function nextEscalationStatus(current: ComplaintStatus): ComplaintStatus | null {
  const s = mapLegacyStatus(current);
  const idx = ESCALATION_FLOW.indexOf(s);
  if (idx < 0 || idx >= ESCALATION_FLOW.length - 1) return null;
  return ESCALATION_FLOW[idx + 1];
}

export function applyEscalationRule(
  complaint: ComplaintRecord,
  context: { repeatCount: number; workerRedFlags: number; avgSatisfaction: number }
): { complaint: ComplaintRecord; escalation?: EscalationRecord } | null {
  const rule = shouldEscalate(complaint, context);
  if (!rule) return null;

  const statusMap: Record<EscalationLevel, ComplaintStatus> = {
    none: complaint.status,
    supervisor: "supervisor_review",
    district: "district_escalation",
    state: "state_escalation",
  };

  const escalation: EscalationRecord = {
    id: `ESC-${Date.now()}`,
    complaintId: complaint.id,
    fromLevel: complaint.escalationLevel ?? "none",
    toLevel: rule.toLevel,
    reason: rule.reason,
    triggeredAt: new Date().toISOString(),
    ruleId: rule.ruleId,
  };

  return {
    complaint: {
      ...complaint,
      status: statusMap[rule.toLevel],
      escalationLevel: rule.toLevel,
      escalations: [...(complaint.escalations ?? []), escalation],
      updatedAt: new Date().toISOString(),
    },
    escalation,
  };
}
