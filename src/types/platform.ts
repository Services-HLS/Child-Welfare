/** AnganSakti 360 — shared platform types */

export type Role =
  | "beneficiary"
  | "worker"
  | "supervisor"
  | "district_admin"
  | "state_admin";

/** @deprecated Use district_admin — migrated on session load */
export type LegacyRole = "admin";

export type Lang = "en" | "te" | "hi";

export type ComplaintStatus =
  | "channel_intake"
  | "ai_processing"
  | "classified"
  | "worker_review"
  | "supervisor_review"
  | "need_evidence"
  | "district_escalation"
  | "state_escalation"
  | "resolution"
  | "beneficiary_confirmation"
  | "closed"
  /** @deprecated legacy statuses — mapped in timeline */
  | "submitted"
  | "ai_classification"
  | "assigned"
  | "worker_response"
  | "supervisor_approval";

export type ComplaintCategory =
  | "service_delivery"
  | "nutrition_quality"
  | "hot_cooked_meals"
  | "infrastructure"
  | "cleanliness"
  | "drinking_water"
  | "worker_behavior"
  | "child_safety"
  | "attendance"
  | "other_concerns"
  /** @deprecated — still accepted */
  | "nutrition"
  | "hygiene"
  | "staff_behavior"
  | "education"
  | "other";

export type FeedbackChannel =
  | "mobile_app"
  | "ivr"
  | "whatsapp"
  | "qr_code"
  | "sms"
  | "handwritten_ocr"
  | "photo_issue";

export type EscalationLevel = "none" | "supervisor" | "district" | "state";

export interface EscalationRecord {
  id: string;
  complaintId: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  reason: string;
  triggeredAt: string;
  ruleId: string;
}

export interface ServiceQualityScore {
  centerId: string;
  centerName: string;
  district: string;
  overallIndex: number;
  workerPerformance: number;
  sessionEvaluation: number;
  complaintVolume: number;
  beneficiarySatisfaction: number;
  attendance: number;
  verificationConfidence: number;
  rank?: number;
  trend: "up" | "down" | "stable";
  updatedAt: string;
}

export interface BeneficiarySatisfactionIndex {
  centerId: string;
  score: number;
  responseCount: number;
  period: string;
}

export type SentimentLabel = "positive" | "neutral" | "negative" | "critical";

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  enrollmentDate: string;
}

export interface NotificationSettings {
  push: boolean;
  sms: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

export interface AppUser {
  role: Role;
  name: string;
  id: string;
  phone?: string;
  email?: string;
  /** Assigned Anganwadi center */
  centerId?: string;
  centerName?: string;
  district?: string;
  mandal?: string;
  /** Beneficiary-only */
  children?: ChildProfile[];
  languagePreference?: Lang;
  complaintCount?: number;
  notificationSettings?: NotificationSettings;
  /** Supervisor / admin scope */
  assignedDistrict?: string;
}

export interface FeedbackEntry {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  centerId: string;
  centerName: string;
  text: string;
  translatedText?: string;
  rating: number;
  imageUrl?: string;
  voiceTranscript?: string;
  lang: Lang;
  sentiment: SentimentLabel;
  sentimentScore: number;
  category: ComplaintCategory;
  urgencyScore: number;
  isComplaint: boolean;
  complaintId?: string;
  timestamp: string;
  aiSummary?: string;
  sourceChannel?: FeedbackChannel;
  confidence?: number;
  feedbackContext?: {
    submittedAs?:
      | "parent_caregiver"
      | "pregnant_woman"
      | "lactating_mother"
      | "guardian"
      | "citizen_community"
      | "other_beneficiary";
    category?: string;
    channel?: FeedbackChannel;
    linkedChild?: string;
    linkedCenter?: string;
    grievance?: boolean;
  };
}

export interface ComplaintRecord {
  id: string;
  feedbackId?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  centerId: string;
  centerName: string;
  district: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  urgencyScore: number;
  sentiment: SentimentLabel;
  /** @deprecated Public grievances bypass workers — use grievance.ownerRole */
  assignedWorkerId?: string;
  /** @deprecated */
  assignedWorkerName?: string;
  supervisorId?: string;
  supervisorName?: string;
  /** Citizen → Supervisor → District → State public grievance bundle */
  grievance?: import("./grievance").PublicGrievanceBundle;
  createdAt: string;
  updatedAt: string;
  slaDueAt: string;
  resolutionNote?: string;
  resolutionEvidenceUrl?: string;
  beneficiaryConfirmed?: boolean;
  aiClassification?: {
    category: ComplaintCategory;
    urgency: number;
    summary: string;
  };
  sourceChannel?: FeedbackChannel;
  escalationLevel?: EscalationLevel;
  severity?: "low" | "medium" | "high" | "critical";
  routingPath?: string[];
  slaHours?: number;
  repeatCount?: number;
  escalations?: EscalationRecord[];
  submittedAs?:
    | "parent_caregiver"
    | "pregnant_woman"
    | "lactating_mother"
    | "guardian"
    | "citizen_community"
    | "other_beneficiary";
  priority?: string;
  citizenEvidence?: import("./public-request").PublicEvidenceItem[];
  grievanceActions?: import("./public-request").GrievanceAction[];
  resolutionBeforeUrl?: string;
  resolutionAfterUrl?: string;
  resolutionDocuments?: string[];
  /** Public grievance intake — per-submission only */
  registeredMobile?: string;
  village?: string;
  mandal?: string;
  anonymous?: boolean;
  investigationReport?: import("./investigation").GrievanceInvestigationReport;
}

export interface PlatformNotification {
  id: string;
  userId: string;
  role: Role;
  channel: "push" | "sms" | "whatsapp" | "in_app" | "ivr";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ServiceEvidenceMetrics {
  classroomSetup: number;
  childPresence: number;
  mealDelivery: number;
  activityExecution: number;
  safetyCompliance: number;
  overallConfidence: number;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  status: "connected" | "pending" | "disconnected";
  lastSync?: string;
}

export interface ExecutiveKpis {
  serviceQualityIndex: number;
  complaintIndex: number;
  feedbackScore: number;
  adoptionRate: number;
  activityCompliance: number;
  grievanceClosurePct: number;
}
