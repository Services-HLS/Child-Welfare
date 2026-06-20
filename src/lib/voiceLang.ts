import { Lang } from "@/types/platform";

export const VOICE_LANG_LABELS: Record<Lang, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
};

export const VOICE_LANG_NATIVE: Record<Lang, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिंदी",
};

export function getVoiceLanguageLabel(lang: Lang): string {
  return VOICE_LANG_LABELS[lang] ?? "English";
}

export function getVoiceLanguageBcp47(lang: Lang): string {
  if (lang === "te") return "te-IN";
  if (lang === "hi") return "hi-IN";
  return "en-IN";
}
