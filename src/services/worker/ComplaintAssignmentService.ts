import { ComplaintRecord } from "@/types/platform";

export function workerAssignedComplaints(complaints: ComplaintRecord[], workerId: string, centerId?: string): ComplaintRecord[] {
  return complaints.filter(
    (c) =>
      c.assignedWorkerId === workerId ||
      (centerId && c.centerId === centerId && (c.status === "assigned" || c.status === "classified"))
  );
}

export function openWorkerIssues(complaints: ComplaintRecord[], workerId: string): ComplaintRecord[] {
  return workerAssignedComplaints(complaints, workerId).filter(
    (c) => c.status !== "closed" && c.status !== "beneficiary_confirmation"
  );
}

export function complaintNeedsEvidence(complaint: ComplaintRecord): boolean {
  return !complaint.resolutionEvidenceUrl && complaint.status !== "closed";
}

export function canResolveComplaint(complaint: ComplaintRecord, hasEvidence: boolean): boolean {
  return hasEvidence && (complaint.status === "assigned" || complaint.status === "classified" || complaint.status === "worker_review");
}
