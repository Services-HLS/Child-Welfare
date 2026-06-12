import { OmnichannelInput } from "@/types/feedback-channels";
import {
  GrievanceAction,
  PublicEvidenceItem,
  PublicRequest,
} from "@/types/public-request";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS, PublicFeedbackSubmitterType } from "@/types/public-context";
import { ComplaintRecord, ComplaintStatus, FeedbackEntry } from "@/types/platform";
import { BeneficiarySurvey } from "@/types/intelligence";
import { enrichEvidenceItem, buildAIVerification } from "./evidenceVerification";
import { getSLAVisibility, requestBucketLabel } from "./slaVisibility";

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function defaultActionsForComplaint(c: ComplaintRecord): GrievanceAction[] {
  if (c.grievance?.actions?.length) return c.grievance.actions;
  if (c.grievanceActions?.length) return c.grievanceActions;
  const base: GrievanceAction[] = [
    {
      id: `${c.id}-a0`,
      ownerRole: "beneficiary",
      officerName: c.beneficiaryName,
      notes: "Citizen submission received",
      timestamp: c.createdAt,
    },
  ];
  if (["ai_processing", "classified", "supervisor_review", "need_evidence"].includes(c.status)) {
    base.push({
      id: `${c.id}-a1`,
      ownerRole: "system",
      officerName: "AI Grievance Engine",
      notes: c.grievance?.aiAnalysis?.summary ?? "AI classification complete",
      timestamp: new Date(new Date(c.createdAt).getTime() + 600_000).toISOString(),
    });
  }
  if (["supervisor_review", "need_evidence", "resolution", "beneficiary_confirmation", "closed"].includes(c.status)) {
    base.push({
      id: `${c.id}-a2`,
      ownerRole: "supervisor",
      officerName: c.supervisorName ?? "Supervisor · Tirupati",
      notes: c.resolutionNote ?? "Supervisor investigation in progress",
      evidenceUrl: c.resolutionEvidenceUrl,
      timestamp: c.updatedAt,
    });
  }
  return base;
}

function evidenceFromFeedback(f: FeedbackEntry): PublicEvidenceItem[] {
  const items: PublicEvidenceItem[] = [];
  if (f.imageUrl) {
    items.push({
      id: `${f.id}-img`,
      type: "photo",
      url: f.imageUrl,
      label: "Uploaded photo",
      uploadedAt: f.timestamp,
    });
  }
  if (f.voiceTranscript) {
    items.push({
      id: `${f.id}-voice`,
      type: "voice",
      text: f.voiceTranscript,
      label: "Voice recording transcript",
      uploadedAt: f.timestamp,
    });
  }
  items.push({
    id: `${f.id}-txt`,
    type: "text",
    text: f.text,
    label: "Feedback text",
    uploadedAt: f.timestamp,
  });
  return items;
}

function evidenceFromOmnichannel(o: OmnichannelInput): PublicEvidenceItem[] {
  const items: PublicEvidenceItem[] = [];
  o.attachmentUrls?.forEach((url, i) => {
    items.push({
      id: `${o.id}-att-${i}`,
      type: "photo",
      url,
      label: `Attachment ${i + 1}`,
      uploadedAt: o.processedAt,
    });
  });
  if (o.ocrText || o.transcript) {
    items.push({
      id: `${o.id}-ocr`,
      type: "ocr",
      text: o.ocrText ?? o.transcript,
      label: "Extracted text",
      uploadedAt: o.processedAt,
    });
  }
  if (o.normalizedText) {
    items.push({
      id: `${o.id}-norm`,
      type: "transcript",
      text: o.normalizedText,
      label: "Normalized message",
      uploadedAt: o.processedAt,
    });
  }
  return items;
}

export function buildPublicRequests(
  userId: string,
  feedback: FeedbackEntry[],
  complaints: ComplaintRecord[],
  omnichannel: OmnichannelInput[],
  _surveys: BeneficiarySurvey[] = []
): PublicRequest[] {
  const mineFeedback = feedback.filter((f) => f.beneficiaryId === userId);
  const mineComplaints = complaints.filter((c) => c.beneficiaryId === userId);
  const mineOmni = omnichannel.filter((o) => o.beneficiaryId === userId);

  const requests: PublicRequest[] = [];

  for (const f of mineFeedback) {
    if (!f.isComplaint && !f.complaintId) continue;
    const linked = mineComplaints.find((c) => c.feedbackId === f.id || c.id === f.complaintId);
    const isOpen = linked ? linked.status !== "closed" : !f.isComplaint;
    requests.push({
      id: f.id,
      referenceId: f.id,
      submittedAs: f.feedbackContext?.submittedAs,
      type: f.isComplaint ? "grievance" : "feedback",
      channel: f.sourceChannel ?? "mobile_app",
      date: f.timestamp,
      status: linked?.status ?? (f.isComplaint ? "ai_processing" : "submitted"),
      statusLabel: linked ? statusLabel(linked.status) : f.isComplaint ? "Processing" : "Submitted",
      title: f.isComplaint ? `Grievance from feedback` : "Public feedback",
      summary: f.text,
      centerId: f.centerId,
      centerName: f.centerName,
      priority: f.feedbackContext?.category,
      category: f.category,
      feedbackId: f.id,
      complaintId: f.complaintId ?? linked?.id,
      rating: f.rating,
      evidence: evidenceFromFeedback(f),
      actions: linked ? defaultActionsForComplaint(linked) : [],
      resolution: linked
        ? {
            note: linked.resolutionNote,
            afterUrl: linked.resolutionAfterUrl ?? linked.resolutionEvidenceUrl,
            beforeUrl: linked.resolutionBeforeUrl,
            documents: linked.resolutionDocuments,
            evidenceUrl: linked.resolutionEvidenceUrl,
            confirmedAt: linked.beneficiaryConfirmed ? linked.updatedAt : undefined,
          }
        : undefined,
      feedback: f,
      complaint: linked,
    });
  }

  for (const c of mineComplaints) {
    if (requests.some((r) => r.complaintId === c.id || r.id === c.id)) continue;
    const linkedFb = mineFeedback.find((f) => f.id === c.feedbackId);
    requests.push({
      id: c.id,
      referenceId: c.id,
      submittedAs: c.submittedAs ?? linkedFb?.feedbackContext?.submittedAs,
      type: "grievance",
      channel: c.sourceChannel,
      date: c.createdAt,
      status: c.status,
      statusLabel: statusLabel(c.status),
      title: c.title,
      summary: c.description,
      centerId: c.centerId,
      centerName: c.centerName,
      priority: c.priority ?? linkedFb?.feedbackContext?.category,
      category: c.category,
      feedbackId: c.feedbackId,
      complaintId: c.id,
      evidence: [...(c.citizenEvidence ?? []), ...(linkedFb ? evidenceFromFeedback(linkedFb) : [])],
      actions: defaultActionsForComplaint(c),
      resolution: {
        note: c.resolutionNote,
        afterUrl: c.resolutionAfterUrl ?? c.resolutionEvidenceUrl,
        beforeUrl: c.resolutionBeforeUrl,
        documents: c.resolutionDocuments,
        evidenceUrl: c.resolutionEvidenceUrl,
        confirmedAt: c.beneficiaryConfirmed ? c.updatedAt : undefined,
      },
      escalation: c.escalationLevel
        ? { level: c.escalationLevel, path: c.routingPath ?? [] }
        : undefined,
      complaint: c,
      feedback: linkedFb,
    });
  }

  for (const o of mineOmni) {
    if (requests.some((r) => r.referenceId === o.id)) continue;
    const omniMeta = o.metadata as { grievance?: boolean; submittedAs?: PublicFeedbackSubmitterType } | undefined;
    const linkedComplaint = mineComplaints.find(
      (c) => c.feedbackId && mineFeedback.some((f) => f.id === c.feedbackId && f.sourceChannel === o.channel)
    );
    if (!omniMeta?.grievance && !linkedComplaint && o.category === "other_concerns") continue;
    requests.push({
      id: o.id,
      referenceId: o.id,
      submittedAs: omniMeta?.submittedAs,
      type: "omnichannel",
      channel: o.channel,
      date: o.processedAt,
      status: linkedComplaint?.status ?? "submitted",
      statusLabel: linkedComplaint ? statusLabel(linkedComplaint.status) : "Submitted",
      title: linkedComplaint ? linkedComplaint.title : `Reported issue · ${o.channel.replace(/_/g, " ")}`,
      summary: o.normalizedText,
      centerId: o.centerId,
      centerName: o.centerName,
      priority: o.priority,
      category: o.category,
      evidence: [...evidenceFromOmnichannel(o), ...(linkedComplaint?.citizenEvidence ?? [])],
      actions: linkedComplaint ? defaultActionsForComplaint(linkedComplaint) : [],
      complaintId: linkedComplaint?.id,
      complaint: linkedComplaint,
      omnichannel: o,
    });
  }

  return requests
    .map((r) => enrichRequest(r, mineFeedback[0]?.centerId ?? mineComplaints[0]?.centerId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPublicRequestById(
  id: string,
  userId: string,
  feedback: FeedbackEntry[],
  complaints: ComplaintRecord[],
  omnichannel: OmnichannelInput[],
  surveys?: BeneficiarySurvey[]
): PublicRequest | null {
  return buildPublicRequests(userId, feedback, complaints, omnichannel, surveys).find(
    (r) => r.id === id || r.referenceId === id || r.complaintId === id || r.feedbackId === id
  ) ?? null;
}

export function submitterLabel(type?: PublicFeedbackSubmitterType): string {
  if (!type) return "Public citizen";
  return PUBLIC_FEEDBACK_SUBMITTER_LABELS[type];
}

export function isRequestOpen(r: PublicRequest): boolean {
  if (r.status === "closed") return false;
  if (r.complaintId || r.type === "grievance") return true;
  return r.feedback?.isComplaint === true && r.status !== "closed";
}

export function isRequestResolved(r: PublicRequest): boolean {
  return r.status === "closed" || !!r.resolution?.confirmedAt;
}

export type TransparencyBucket =
  | "submitted"
  | "under_review"
  | "action_taken"
  | "escalated"
  | "resolved"
  | "closed";

export function countByBucket(requests: PublicRequest[]) {
  const buckets: Record<TransparencyBucket, number> = {
    submitted: 0,
    under_review: 0,
    action_taken: 0,
    escalated: 0,
    resolved: 0,
    closed: 0,
  };
  requests.forEach((r) => {
    const b = requestBucketLabel(String(r.status));
    buckets[b]++;
  });
  return {
    ...buckets,
    feedback: requests.filter((r) => r.type === "feedback" || r.type === "omnichannel").length,
    evidence: requests.reduce((n, r) => n + r.evidence.length, 0),
    open: requests.filter((r) => isRequestOpen(r)).length,
    resolved: requests.filter((r) => isRequestResolved(r)).length,
  };
}

function enrichRequest(r: PublicRequest, centerId?: string): PublicRequest {
  const cid = centerId ?? r.centerId ?? "AWC-TPT-01";
  const evidence = r.evidence.map((e) => {
    const full = enrichEvidenceItem(e, cid);
    return {
      ...e,
      aiStatus: full.aiStatus,
      geo: full.geo
        ? {
            matchPercent: full.geo.matchPercent,
            distanceMeters: full.geo.distanceMeters,
            status: full.geo.status,
            citizenSummary: full.geo.citizenSummary,
          }
        : undefined,
    };
  });
  let sla = r.sla;
  let aiExplain = r.aiExplain;
  if (r.complaint) {
    const s = getSLAVisibility(r.complaint);
    sla = {
      targetHours: s.targetHours,
      dueAt: s.dueAt,
      label: s.label,
      breached: s.breached,
      escalationHint: s.escalationHint,
      urgencyLabel: r.complaint.grievance?.aiAnalysis?.severity,
    };
    const ai = buildAIVerification(
      r.summary,
      r.rating ?? 3,
      r.channel ?? "mobile_app",
      "en",
      r.complaint
    );
    aiExplain = {
      confidence: ai.confidence,
      urgencyLabel: ai.urgencyLabel,
      reasons: ai.explainability,
    };
  }
  return {
    ...r,
    evidence,
    sla,
    aiExplain,
    ownerRole: r.complaint?.grievance?.ownerRole ?? "supervisor",
    anonymous: r.complaint?.beneficiaryName?.includes("Anonymous"),
  };
}
