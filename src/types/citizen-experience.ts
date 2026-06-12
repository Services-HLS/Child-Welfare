import { Lang } from "./platform";
import { PublicFeedbackSubmitterType } from "./public-context";
import { PublicEvidenceItem } from "./public-request";
import { FeedbackChannel } from "./feedback-channels";

export type ExperienceStatus = "recorded" | "acknowledged" | "included_in_improvement";

export type ExperienceSentiment = "positive" | "neutral" | "concern";

export type ExperienceType =
  | "appreciation"
  | "suggestion"
  | "concern"
  | "general"
  | "satisfaction";

export interface CitizenExperienceRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  centerId: string;
  centerName: string;
  submittedAs: PublicFeedbackSubmitterType;
  category: string;
  experienceType: ExperienceType;
  rating: number;
  text: string;
  evidence: PublicEvidenceItem[];
  sentiment: ExperienceSentiment;
  satisfactionScore: number;
  aiSummary: string;
  suggestedImprovements: string[];
  detectedLanguage: Lang;
  status: ExperienceStatus;
  timestamp: string;
  sourceChannel?: FeedbackChannel;
  feedbackId?: string;
}
