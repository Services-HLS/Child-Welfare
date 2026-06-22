import { ComplaintRecord } from "@/types/platform";
import { ChildProgressRecord } from "@/types/intelligence";
import { filterBeneficiaryGrievances } from "@/services/beneficiary/beneficiaryGrievances";
import {
  getChildProgressHistory,
  getPrimaryChild,
  getVaccinationRecords,
  ParentChild,
} from "@/services/beneficiary/parentPortalData";
import type { AppUser } from "@/types/platform";
import {
  ANONYMOUS_TRIGGERS,
  CENTER_TRIGGERS,
  formatGrievanceDetailLocalized,
  getWhatsAppCopy,
  GRIEVANCE_WORD_TRIGGERS,
  resolveQuickReplyIntent,
  SUBMIT_BLOCK_TRIGGERS,
  SUPERVISOR_TRIGGERS,
  THANKS_TRIGGERS,
  translateWaCategory,
  translateWaPriority,
  translateWaStatus,
  WhatsAppCopy,
  WORKER_TRIGGERS,
} from "@/services/beneficiary/whatsappI18n";
import { Lang } from "@/lib/i18n";

export type WhatsAppChatContext = {
  user?: AppUser | null;
  userName?: string;
  centerName?: string;
  centerId?: string;
  phone?: string;
  grievances?: ComplaintRecord[];
  child?: ParentChild | null;
  childProgress?: ChildProgressRecord[];
  copy: WhatsAppCopy;
};

export type WhatsAppGrievanceSummary = {
  id: string;
  title: string;
  status: string;
  category: string;
  centerName: string;
  createdAt: string;
  priority?: string;
  anonymous?: boolean;
};

export type WhatsAppReply =
  | { type: "text"; text: string }
  | { type: "grievance_list"; text: string; grievances: WhatsAppGrievanceSummary[] }
  | { type: "grievance_detail"; text: string; grievance: ComplaintRecord };

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function toSummary(c: ComplaintRecord, copy: WhatsAppCopy): WhatsAppGrievanceSummary {
  return {
    id: c.id,
    title: c.title,
    status: translateWaStatus(copy, c.status),
    category: translateWaCategory(copy, c.category),
    centerName: c.centerName,
    createdAt: c.createdAt,
    priority: translateWaPriority(copy, String(c.priority ?? "medium")),
    anonymous: c.anonymous,
  };
}

export function buildWhatsAppContext(
  user: AppUser | null | undefined,
  complaints: ComplaintRecord[],
  lang: Lang,
  childProgress: ChildProgressRecord[] = []
): WhatsAppChatContext {
  const uid = user?.id ?? "";
  const grievances = filterBeneficiaryGrievances(complaints, uid, user?.phone);
  return {
    user,
    userName: user?.name,
    centerName: user?.centerName,
    centerId: user?.centerId,
    phone: user?.phone,
    grievances,
    child: user ? getPrimaryChild(user) : null,
    childProgress,
    copy: getWhatsAppCopy(lang),
  };
}

function nameParts(ctx: WhatsAppChatContext) {
  const copy = ctx.copy;
  return {
    name: ctx.userName?.split(" ")[0] ?? copy.greetingFallback,
    childName: ctx.child?.name ?? copy.childFallback,
    centerName: ctx.centerName ?? copy.centerFallback,
    count: ctx.grievances?.length ?? 0,
  };
}

export function getWhatsAppWelcome(ctx: WhatsAppChatContext): string {
  const { name, childName, centerName, count } = nameParts(ctx);
  return ctx.copy.welcome({ name, childName, centerName, count });
}

function buildGrievanceListReply(grievances: ComplaintRecord[], copy: WhatsAppCopy): WhatsAppReply {
  if (grievances.length === 0) {
    return { type: "text", text: copy.grievanceListEmpty };
  }
  const sorted = [...grievances].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return {
    type: "grievance_list",
    text: copy.grievanceListHeader({ count: sorted.length, exampleId: sorted[0]?.id ?? "GRV-240001" }),
    grievances: sorted.map((g) => toSummary(g, copy)),
  };
}

function buildGrievanceDetailReply(c: ComplaintRecord, copy: WhatsAppCopy): WhatsAppReply {
  return { type: "grievance_detail", text: copy.grievanceDetailTitle, grievance: c };
}

function findGrievance(grievances: ComplaintRecord[], input: string): ComplaintRecord | undefined {
  const idMatch = input.match(/(GRV-\d+|CMP-\d+)/i);
  if (idMatch) {
    return grievances.find((g) => g.id.toLowerCase() === idMatch[1].toLowerCase());
  }
  return undefined;
}

function buildChildReply(ctx: WhatsAppChatContext): WhatsAppReply {
  const copy = ctx.copy;
  const child = ctx.child;
  const centerName = ctx.centerName ?? copy.centerFallback;
  if (!child) return { type: "text", text: copy.childNoData };

  const history =
    ctx.centerId && ctx.childProgress
      ? getChildProgressHistory(child.id, ctx.centerId, ctx.childProgress)
      : [];
  const siblings = ctx.user?.children?.slice(1).map((c) => c.name).join(", ") ?? "";

  return {
    type: "text",
    text: copy.childSummary({
      name: child.name,
      age: child.age,
      center: centerName,
      days: history.length || 21,
      attended: history.filter((h) => h.attended).length,
      absent: history.filter((h) => !h.attended).length,
      mealDays: history.filter((h) => h.nutritionCompleted).length,
      vaccinesDone: getVaccinationRecords(child.id, child.age).filter((v) => v.status === "done").length,
      vaccinesDue: getVaccinationRecords(child.id, child.age).filter((v) => v.status === "due").length,
      siblings,
    }),
  };
}

function buildNutritionReply(ctx: WhatsAppChatContext): WhatsAppReply {
  const copy = ctx.copy;
  const open = ctx.grievances?.find(
    (g) =>
      g.category.includes("nutrition") ||
      g.category.includes("meal") ||
      g.title.toLowerCase().includes("meal") ||
      g.title.toLowerCase().includes("egg")
  );
  return {
    type: "text",
    text: copy.nutrition({
      center: ctx.centerName ?? copy.centerFallback,
      child: ctx.child?.name ?? copy.childFallback,
      openId: open?.id,
      openTitle: open?.title,
      openStatus: open ? translateWaStatus(copy, open.status) : undefined,
      hasOpen: Boolean(open),
    }),
  };
}

function replyByIntent(intent: string, ctx: WhatsAppChatContext): WhatsAppReply | null {
  const copy = ctx.copy;
  const grievances = ctx.grievances ?? [];
  const { name, childName, count } = nameParts(ctx);

  switch (intent) {
    case "hi":
      return { type: "text", text: copy.hiReply({ name, count, childName }) };
    case "grievances":
      return buildGrievanceListReply(grievances, copy);
    case "submit":
      return { type: "text", text: copy.submitGrievance };
    case "child":
      return buildChildReply(ctx);
    case "nutrition":
      return buildNutritionReply(ctx);
    case "help":
      return { type: "text", text: copy.help };
    default:
      return null;
  }
}

export function getWhatsAppReply(input: string, ctx: WhatsAppChatContext): WhatsAppReply {
  const q = input.trim().toLowerCase();
  const copy = ctx.copy;
  const grievances = ctx.grievances ?? [];
  const { childName, count } = nameParts(ctx);

  if (!q) return { type: "text", text: copy.emptyPrompt };

  const byId = findGrievance(grievances, input);
  if (byId) return buildGrievanceDetailReply(byId, copy);

  const intent = resolveQuickReplyIntent(input, copy);
  if (intent) {
    const reply = replyByIntent(intent, ctx);
    if (reply) return reply;
  }

  if (
    includesAny(q, GRIEVANCE_WORD_TRIGGERS) &&
    !includesAny(q, SUBMIT_BLOCK_TRIGGERS)
  ) {
    return buildGrievanceListReply(grievances, copy);
  }

  if (includesAny(q, CENTER_TRIGGERS)) {
    return {
      type: "text",
      text: copy.center({ name: ctx.centerName ?? copy.centerFallback, code: ctx.centerId ?? "AWC-TPT-01" }),
    };
  }

  if (includesAny(q, SUPERVISOR_TRIGGERS)) {
    return { type: "text", text: copy.supervisor({ count: grievances.length }) };
  }

  if (includesAny(q, WORKER_TRIGGERS)) {
    return { type: "text", text: copy.worker({ center: ctx.centerName ?? copy.centerFallback }) };
  }

  if (includesAny(q, ANONYMOUS_TRIGGERS)) {
    return { type: "text", text: copy.anonymous };
  }

  if (includesAny(q, THANKS_TRIGGERS)) {
    return { type: "text", text: copy.thanks };
  }

  const partial = grievances.find(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.category.replace(/_/g, " ").toLowerCase().includes(q)
  );
  if (partial && q.length >= 4) return buildGrievanceDetailReply(partial, copy);

  return { type: "text", text: copy.fallback({ count, childName }) };
}

export function formatGrievanceDetailText(c: ComplaintRecord, copy: WhatsAppCopy): string {
  return formatGrievanceDetailLocalized(c, copy);
}

export function getGrievanceDetailReply(grievanceId: string, ctx: WhatsAppChatContext): WhatsAppReply {
  const g = findGrievance(ctx.grievances ?? [], grievanceId);
  if (!g) {
    return { type: "text", text: ctx.copy.grievanceNotFound({ id: grievanceId }) };
  }
  return buildGrievanceDetailReply(g, ctx.copy);
}
