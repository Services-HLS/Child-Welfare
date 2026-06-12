import { PublicFeedbackSubmitterType } from "@/types/public-context";

const STORAGE_KEY = "angansakti.public.sessionContext";

export type PublicSessionFocus = {
  primaryLinks: { label: string; to: string }[];
  benefitIds: string[];
  grievanceCategories: string[];
  headline: string;
};

export const SESSION_CONTEXT_CONFIG: Record<PublicFeedbackSubmitterType, PublicSessionFocus> = {
  parent_caregiver: {
    headline: "Child services, attendance, meals, and preschool visibility",
    primaryLinks: [
      { label: "Today's Services", to: "/beneficiary/daily-journey" },
      { label: "Service Visibility", to: "/beneficiary/my-child" },
      { label: "Center Timeline", to: "/beneficiary/center-timeline" },
    ],
    benefitIds: ["preschool", "nutrition", "meals", "growth", "take_home_ration"],
    grievanceCategories: ["Meals", "Teacher", "Activities", "Safety", "Attendance"],
  },
  pregnant_woman: {
    headline: "Nutrition support, supplements, health visits, and service feedback",
    primaryLinks: [
      { label: "Nutrition Services", to: "/beneficiary/nutrition" },
      { label: "Share Experience", to: "/beneficiary/feedback" },
      { label: "My Benefits", to: "/beneficiary/my-child#benefits" },
    ],
    benefitIds: ["nutrition", "health_support", "take_home_ration", "other_welfare"],
    grievanceCategories: ["Nutrition", "Worker Visit", "Health Support", "Service Delay"],
  },
  lactating_mother: {
    headline: "Lactating mother nutrition, child support, and visit experience",
    primaryLinks: [
      { label: "Nutrition", to: "/beneficiary/nutrition" },
      { label: "My Services", to: "/beneficiary/my-child" },
      { label: "Share Experience", to: "/beneficiary/feedback" },
    ],
    benefitIds: ["nutrition", "health_support", "meals", "growth"],
    grievanceCategories: ["Nutrition Support", "Child Support", "Visit Experience"],
  },
  guardian: {
    headline: "Guardian view of child services and center support",
    primaryLinks: [
      { label: "Service Visibility", to: "/beneficiary/my-child" },
      { label: "Track Requests", to: "/public/my-requests" },
    ],
    benefitIds: ["preschool", "meals", "growth", "health_support"],
    grievanceCategories: ["Child Services", "Center Support", "General Feedback"],
  },
  citizen_community: {
    headline: "Infrastructure, center observations, and public feedback",
    primaryLinks: [
      { label: "Center Health", to: "/beneficiary/center-health" },
      { label: "Transparency", to: "/public/transparency" },
      { label: "Report Issue", to: "/beneficiary/omnichannel-feedback" },
    ],
    benefitIds: ["other_welfare"],
    grievanceCategories: ["Center Observation", "Infrastructure", "Cleanliness", "Suggestion"],
  },
  other_beneficiary: {
    headline: "General service quality, support, and welfare programs",
    primaryLinks: [
      { label: "My Requests", to: "/public/my-requests" },
      { label: "Share Experience", to: "/beneficiary/feedback" },
    ],
    benefitIds: ["nutrition", "other_welfare", "health_support"],
    grievanceCategories: ["Service Quality", "Support", "General Feedback"],
  },
};

export function getStoredSessionContext(): PublicFeedbackSubmitterType {
  const v = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("angansakti.public.lastFeedbackType");
  return (v as PublicFeedbackSubmitterType) || "parent_caregiver";
}

export function setStoredSessionContext(type: PublicFeedbackSubmitterType) {
  localStorage.setItem(STORAGE_KEY, type);
  localStorage.setItem("angansakti.public.lastFeedbackType", type);
}

export function getSessionFocus(type: PublicFeedbackSubmitterType): PublicSessionFocus {
  return SESSION_CONTEXT_CONFIG[type];
}
