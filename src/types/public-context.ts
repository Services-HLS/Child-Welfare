import { ChildProfile } from "@/types/platform";

/** Citizen beneficiary segment — single public login, personalized experience */
export type BeneficiaryType =
  | "parent_child"
  | "pregnant_woman"
  | "lactating_mother"
  | "caregiver_guardian";

export interface PublicContextPreferences {
  consentGiven?: boolean;
  serviceUpdates?: boolean;
  photoConsent?: boolean;
}

export interface PublicContext {
  beneficiaryType: BeneficiaryType;
  linkedChildren?: ChildProfile[];
  linkedServices?: string[];
  preferences?: PublicContextPreferences;
  selectedAt: string;
}

export const BENEFICIARY_TYPE_LABELS: Record<BeneficiaryType, string> = {
  parent_child: "Parent of Child (0–6 Years)",
  pregnant_woman: "Pregnant Woman",
  lactating_mother: "Lactating Mother",
  caregiver_guardian: "Caregiver / Guardian",
};

export const BENEFICIARY_TYPE_SHORT: Record<BeneficiaryType, string> = {
  parent_child: "Parent · Child 0–6",
  pregnant_woman: "Pregnant Woman",
  lactating_mother: "Lactating Mother",
  caregiver_guardian: "Caregiver / Guardian",
};

export type PublicFeedbackSubmitterType =
  | "parent_caregiver"
  | "pregnant_woman"
  | "lactating_mother"
  | "guardian"
  | "citizen_community"
  | "other_beneficiary";

export const PUBLIC_FEEDBACK_SUBMITTER_LABELS: Record<PublicFeedbackSubmitterType, string> = {
  parent_caregiver: "Parent / Caregiver",
  pregnant_woman: "Pregnant Woman",
  lactating_mother: "Lactating Mother",
  guardian: "Guardian",
  citizen_community: "Citizen / Community Member",
  other_beneficiary: "Other Beneficiary",
};
