import { processFeedbackWithAI } from "@/services/ai";
import { Lang } from "@/types/platform";
import { ExperienceSentiment, ExperienceType } from "@/types/citizen-experience";

export interface ExperienceAnalysisResult {
  sentiment: ExperienceSentiment;
  satisfactionScore: number;
  aiSummary: string;
  suggestedImprovements: string[];
  detectedLanguage: Lang;
  translatedText?: string;
}

const IMPROVEMENT_HINTS: Record<ExperienceSentiment, string[]> = {
  positive: [
    "Continue current meal quality and preschool engagement practices.",
    "Share positive practices with neighboring centers as best-practice notes.",
  ],
  neutral: [
    "Review scheduling communication with beneficiaries.",
    "Monitor consistency of daily service logs.",
  ],
  concern: [
    "Supervisor to review service logs — no formal grievance unless citizen uses Report Issue.",
    "Consider parent communication session at center.",
  ],
};

export async function analyzeShareExperience(
  text: string,
  rating: number,
  lang: Lang,
  category: string
): Promise<ExperienceAnalysisResult> {
  const ai = await processFeedbackWithAI(text, rating, lang);
  const sentiment: ExperienceSentiment =
    rating >= 4 && ai.sentiment.label !== "negative"
      ? "positive"
      : rating <= 2 || ai.sentiment.label === "negative"
        ? "concern"
        : "neutral";
  const satisfactionScore = Math.round((rating / 5) * 100);
  const hints = IMPROVEMENT_HINTS[sentiment];
  return {
    sentiment,
    satisfactionScore,
    aiSummary: `Experience · ${category}: ${ai.translatedText?.slice(0, 200) ?? text.slice(0, 200)}`,
    suggestedImprovements: hints.join(" "),
    detectedLanguage: lang,
    translatedText: ai.translatedText,
  };
}

export function experienceTypeFromRating(
  rating: number,
  sentiment: ExperienceSentiment
): ExperienceType {
  if (rating >= 4 && sentiment === "positive") return "appreciation";
  if (sentiment === "concern") return "concern";
  if (rating >= 4) return "satisfaction";
  return "suggestion";
}
