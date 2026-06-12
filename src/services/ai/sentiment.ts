import { SentimentLabel } from "@/types/platform";

const negativeWords = ["bad", "poor", "worst", "angry", "unsafe", "dirty", "late", "missing", "చెడు", "खराब"];
const positiveWords = ["good", "excellent", "happy", "thank", "safe", "clean", "బాగుంది", "अच्छा"];

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  await new Promise((r) => setTimeout(r, 350));
  const lower = text.toLowerCase();
  let score = 0.5;
  negativeWords.forEach((w) => { if (lower.includes(w)) score -= 0.15; });
  positiveWords.forEach((w) => { if (lower.includes(w)) score += 0.15; });
  score = Math.max(0, Math.min(1, score));
  let label: SentimentLabel = "neutral";
  if (score < 0.25) label = "critical";
  else if (score < 0.45) label = "negative";
  else if (score > 0.7) label = "positive";
  return { label, score };
}
