import { Lang } from "@/lib/i18n";
import { ComplaintRecord } from "@/types/platform";
import { format } from "date-fns";
import { enCopy } from "./en";
import { teCopy } from "./te";
import { hiCopy } from "./hi";
import { WhatsAppCopy } from "./types";

const copies: Record<Lang, WhatsAppCopy> = { en: enCopy, te: teCopy, hi: hiCopy };

export function getWhatsAppCopy(lang: Lang): WhatsAppCopy {
  return copies[lang] ?? enCopy;
}

export function translateWaStatus(copy: WhatsAppCopy, status: string): string {
  const key = status.replace(/\s+/g, "_").toLowerCase();
  return copy.statusLabels[key] ?? status.replace(/_/g, " ");
}

export function translateWaCategory(copy: WhatsAppCopy, category: string): string {
  return copy.categoryLabels[category.toLowerCase()] ?? category.replace(/_/g, " ");
}

export function translateWaPriority(copy: WhatsAppCopy, priority: string): string {
  return copy.priorityLabels[priority.toLowerCase()] ?? priority;
}

export function formatGrievanceDetailLocalized(c: ComplaintRecord, copy: WhatsAppCopy): string {
  const latestAction = c.grievanceActions?.[c.grievanceActions.length - 1];
  const L = copy.detailLabels;
  return [
    `*${c.id}*`,
    c.title,
    ``,
    `${L.status}: *${translateWaStatus(copy, c.status)}*`,
    `${L.category}: ${translateWaCategory(copy, c.category)}`,
    `${L.priority}: ${translateWaPriority(copy, String(c.priority ?? "medium"))}`,
    `${L.center}: ${c.centerName}`,
    c.village ? `${L.village}: ${c.village}` : null,
    `${L.submitted}: ${format(new Date(c.createdAt), "PPp")}`,
    c.anonymous ? L.anonymousBy : `${L.submittedBy}: ${c.beneficiaryName}`,
    `${L.supervisor}: ${c.supervisorName ?? copy.defaultSupervisor}`,
    c.slaDueAt ? `${L.expectedResolution}: ${format(new Date(c.slaDueAt), "PPP")}` : null,
    latestAction ? `${L.latestUpdate}: ${latestAction.notes}` : null,
    c.resolutionNote ? `${L.resolution}: ${c.resolutionNote}` : null,
    ``,
    `*${L.description}:*`,
    c.description.length > 320 ? `${c.description.slice(0, 317)}…` : c.description,
  ]
    .filter(Boolean)
    .join("\n");
}

export function resolveQuickReplyIntent(input: string, copy: WhatsAppCopy): string | null {
  const q = input.trim().toLowerCase();
  for (const qr of copy.quickReplies) {
    if (qr.triggers.some((t) => q === t.toLowerCase() || q.startsWith(`${t.toLowerCase()} `))) {
      return qr.id;
    }
  }
  return null;
}

export const CENTER_TRIGGERS = ["center", "anganwadi", "timing", "timings", "time", "location", "address", "when open", "working hours", "కేంద్రం", "సమయం", "केंद्र", "समय", "पता"];
export const SUPERVISOR_TRIGGERS = ["supervisor", "officer", "who is handling", "ravi", "contact", "helpline", "పర్యవేక్షక", "పర్యవేక్షకుడు", "पर्यवेक्षक", "संपर्क"];
export const WORKER_TRIGGERS = ["worker", "lakshmi", "aww", "teacher", "కార్యకర్త", "లక్ష్మీ", "कार्यकर्ता", "लक्ष्मी"];
export const ANONYMOUS_TRIGGERS = ["anonymous", "hide name", "privacy", "అనామక", "गुमनाम", "गोपनीयता"];
export const THANKS_TRIGGERS = ["thank", "thanks", "dhanyavad", "ok", "okay", "bye", "good night", "ధన్యవాద", "शुक्रिया", "अलविदा"];
export const GRIEVANCE_WORD_TRIGGERS = ["grievance", "grievances", "complaint", "complaints", "ఫిర్యాదు", "ఫిర్యాదులు", "शिकायत", "शिकायतें"];
export const SUBMIT_BLOCK_TRIGGERS = ["submit", "file", "new", "register", "report", "దాఖలు", "సమర్పించ", "दर्ज", "नई"];

export type { WhatsAppCopy, WaQuickReply } from "./types";
export { waFmt } from "./types";
