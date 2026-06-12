import { PublicFeedbackSubmitterType } from "@/types/public-context";
import { SESSION_CONTEXT_CONFIG } from "./publicSessionContext";

export type BenefitStatus = "available" | "received" | "pending" | "upcoming";

export interface BenefitRow {
  id: string;
  name: string;
  status: BenefitStatus;
  detail: string;
  lastUpdated?: string;
}

const ALL_BENEFITS: Record<string, Omit<BenefitRow, "status" | "detail">> = {
  preschool: { id: "preschool", name: "Preschool Services (0–6 ECCE)" },
  nutrition: { id: "nutrition", name: "Nutrition Services" },
  meals: { id: "meals", name: "Hot Cooked Meal Benefits" },
  take_home_ration: { id: "take_home_ration", name: "Take Home Ration (THR)" },
  growth: { id: "growth", name: "Growth Monitoring" },
  health_support: { id: "health_support", name: "Health Support & Referrals" },
  other_welfare: { id: "other_welfare", name: "Other Welfare Schemes" },
};

function statusFor(id: string, ctx: PublicFeedbackSubmitterType): BenefitStatus {
  const seed = (ctx.length + id.length) % 4;
  if (id === "preschool" && ctx === "parent_caregiver") return "received";
  if (id === "nutrition" && ["pregnant_woman", "lactating_mother"].includes(ctx)) return "received";
  if (seed === 0) return "available";
  if (seed === 1) return "received";
  if (seed === 2) return "pending";
  return "upcoming";
}

export function buildBenefitsForContext(
  ctx: PublicFeedbackSubmitterType,
  centerName: string
): BenefitRow[] {
  const ids = SESSION_CONTEXT_CONFIG[ctx].benefitIds;
  return ids.map((id) => {
    const base = ALL_BENEFITS[id];
    const status = statusFor(id, ctx);
    const detail =
      status === "received"
        ? `Active at ${centerName} — logs updated this week`
        : status === "pending"
          ? "Enrollment verification in progress"
          : status === "upcoming"
            ? "Scheduled per ICDS calendar"
            : "Eligible — contact Anganwadi for enrollment";
    return { ...base, status, detail, lastUpdated: new Date().toISOString() };
  });
}

export function aiServiceRecommendations(ctx: PublicFeedbackSubmitterType): string[] {
  const map: Record<PublicFeedbackSubmitterType, string[]> = {
    parent_caregiver: [
      "Review today's preschool session summary on Center Timeline.",
      "Download weekly attendance report from Service Visibility.",
      "Submit meal feedback with photo evidence if portion was insufficient.",
    ],
    pregnant_woman: [
      "Confirm supplementary nutrition receipt in My Benefits.",
      "Use grievance mode if health visit was missed — include date and ANM reference.",
      "Track THR distribution through My Requests after omnichannel submit.",
    ],
    lactating_mother: [
      "Monitor growth monitoring entries for linked child.",
      "Share visit experience via Share Experience (voice note supported).",
    ],
    guardian: [
      "Check Service Visibility for enrolled child weekly logs.",
      "Raise infrastructure issues via community observation categories.",
    ],
    citizen_community: [
      "Use anonymous mode for sensitive infrastructure complaints.",
      "View district transparency metrics for your mandal.",
      "Submit QR or photo evidence for center cleanliness observations.",
    ],
    other_beneficiary: [
      "Explore eligible schemes under Other Welfare Services.",
      "Track all submissions in unified evidence history.",
    ],
  };
  return map[ctx];
}
