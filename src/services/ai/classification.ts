import { ComplaintCategory } from "@/types/platform";

const rules: { keywords: string[]; category: ComplaintCategory; urgency: number }[] = [
  { keywords: ["food", "meal", "nutrition", "ఆహార", "भोजन"], category: "nutrition", urgency: 0.7 },
  { keywords: ["absent", "attendance", "హాజరు", "उपस्थिति"], category: "attendance", urgency: 0.6 },
  { keywords: ["toilet", "water", "clean", "hygiene", "శుభ్ర"], category: "hygiene", urgency: 0.75 },
  { keywords: ["building", "roof", "infrastructure"], category: "infrastructure", urgency: 0.8 },
  { keywords: ["rude", "staff", "behavior"], category: "staff_behavior", urgency: 0.85 },
  { keywords: ["teach", "education", "school", "విద్య"], category: "education", urgency: 0.55 },
];

export interface ClassificationResult {
  category: ComplaintCategory;
  urgencyScore: number;
  isComplaint: boolean;
  summary: string;
}

export async function classifyFeedback(text: string, rating: number): Promise<ClassificationResult> {
  await new Promise((r) => setTimeout(r, 500));
  const lower = text.toLowerCase();
  let category: ComplaintCategory = "other";
  let urgency = 0.4;
  for (const rule of rules) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      category = rule.category;
      urgency = rule.urgency;
      break;
    }
  }
  if (rating <= 2) urgency = Math.min(1, urgency + 0.25);
  const isComplaint = rating <= 3 || urgency >= 0.65 || /complaint|issue|problem|ఫిర్యాద/.test(lower);
  return {
    category,
    urgencyScore: Math.round(urgency * 100) / 100,
    isComplaint,
    summary: `Classified as ${category} with urgency ${(urgency * 100).toFixed(0)}%`,
  };
}
