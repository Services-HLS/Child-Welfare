import { Lang } from "@/types/platform";

const phraseMap: Record<string, Partial<Record<Lang, string>>> = {
  "food quality poor": { en: "Food quality is poor", te: "ఆహార నాణ్యత బాగోలేదు", hi: "भोजन की गुणवत्ता खराब है" },
  "child absent": { en: "Child was absent", te: "పిల్లవాడు హాజరు కాలేదు", hi: "बच्चा अनुपस्थित था" },
};

export async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  await delay(400);
  const key = text.toLowerCase().trim();
  if (phraseMap[key]?.[to]) return phraseMap[key][to]!;
  if (from === to) return text;
  return `[${to.toUpperCase()}] ${text}`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
