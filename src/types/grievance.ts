import { ComplaintCategory, Lang } from "./platform";
import { PublicEvidenceItem } from "./public-request";
import { GrievanceAction } from "./public-request";

export type GrievanceOwnerRole = "supervisor" | "district_admin" | "state_admin";

export type PublicGrievancePriority = "low" | "medium" | "high" | "critical";

export interface GrievanceAIAnalysis {
  issueClassification: ComplaintCategory;
  severity: "low" | "medium" | "high" | "critical";
  extractedContext: string;
  detectedLanguage: Lang;
  suggestedResolutionPath: string[];
  recommendedAction: string;
  confidence: number;
  summary: string;
}

export interface GrievanceResolutionReport {
  note: string;
  actionTaken: string;
  evidenceUrl?: string;
  beforeUrl?: string;
  afterUrl?: string;
  documents?: string[];
  estimatedCompletion?: string;
  resolvedBy: GrievanceOwnerRole;
  resolvedByName: string;
  resolvedAt: string;
  reportId: string;
}

export interface PublicGrievanceBundle {
  ownerRole: GrievanceOwnerRole;
  ownerId?: string;
  ownerName?: string;
  evidence: PublicEvidenceItem[];
  aiAnalysis?: GrievanceAIAnalysis;
  actions: GrievanceAction[];
  resolution?: GrievanceResolutionReport;
  consentGiven?: boolean;
  citizenPriority?: PublicGrievancePriority;
}
