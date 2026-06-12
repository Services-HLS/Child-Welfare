import { FeedbackChannel } from "./feedback-channels";
import { ComplaintRecord, ComplaintStatus, Role } from "./platform";
import { PublicFeedbackSubmitterType } from "./public-context";
import { FeedbackEntry } from "./platform";
import { OmnichannelInput } from "./feedback-channels";

export interface PublicEvidenceItem {
  id: string;
  type: "photo" | "voice" | "transcript" | "ocr" | "document" | "video" | "text";
  url?: string;
  text?: string;
  label?: string;
  uploadedAt: string;
  aiStatus?: string;
  geo?: {
    matchPercent: number;
    distanceMeters: number;
    status: "verified" | "near_center" | "outside_zone" | "manual_review";
    citizenSummary: string;
  };
}

export interface PublicRequestSLA {
  targetHours: number;
  dueAt: string;
  label: string;
  breached: boolean;
  escalationHint: string;
  urgencyLabel?: string;
}

export interface PublicRequestAIExplain {
  confidence: number;
  urgencyLabel: string;
  reasons: string[];
}

export interface GrievanceAction {
  id: string;
  ownerRole: Role | "system";
  officerName: string;
  notes: string;
  evidenceUrl?: string;
  timestamp: string;
}

export interface PublicRequestResolution {
  note?: string;
  beforeUrl?: string;
  afterUrl?: string;
  documents?: string[];
  evidenceUrl?: string;
  confirmedAt?: string;
}

export interface PublicRequest {
  id: string;
  referenceId: string;
  submittedAs?: PublicFeedbackSubmitterType;
  type: "feedback" | "grievance" | "omnichannel" | "survey";
  channel?: FeedbackChannel | "survey";
  date: string;
  status: ComplaintStatus | "submitted" | "processing" | "resolved";
  statusLabel: string;
  title: string;
  summary: string;
  centerId?: string;
  centerName?: string;
  priority?: string;
  category?: string;
  feedbackId?: string;
  complaintId?: string;
  rating?: number;
  evidence: PublicEvidenceItem[];
  actions: GrievanceAction[];
  resolution?: PublicRequestResolution;
  escalation?: { level: string; path: string[] };
  complaint?: ComplaintRecord;
  feedback?: FeedbackEntry;
  omnichannel?: OmnichannelInput;
  sla?: PublicRequestSLA;
  aiExplain?: PublicRequestAIExplain;
  anonymous?: boolean;
  ownerRole?: string;
}
