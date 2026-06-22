export function waFmt(template: string, vars: Record<string, string | number> = {}): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    template
  );
}

export type WaQuickReply = { id: string; label: string; triggers: string[] };

export type WhatsAppCopy = {
  quickReplies: WaQuickReply[];
  greetingFallback: string;
  childFallback: string;
  centerFallback: string;
  defaultSupervisor: string;
  welcome: (p: { name: string; childName: string; centerName: string; count: number }) => string;
  emptyPrompt: string;
  hiReply: (p: { name: string; count: number; childName: string }) => string;
  grievanceListEmpty: string;
  grievanceListHeader: (p: { count: number; exampleId: string }) => string;
  grievanceDetailTitle: string;
  grievanceNotFound: (p: { id: string }) => string;
  submitGrievance: string;
  childNoData: string;
  childSummary: (p: {
    name: string;
    age: number;
    center: string;
    days: number;
    attended: number;
    absent: number;
    mealDays: number;
    vaccinesDone: number;
    vaccinesDue: number;
    siblings: string;
  }) => string;
  nutrition: (p: {
    center: string;
    child: string;
    openId?: string;
    openTitle?: string;
    openStatus?: string;
    hasOpen: boolean;
  }) => string;
  center: (p: { name: string; code: string }) => string;
  supervisor: (p: { count: number }) => string;
  worker: (p: { center: string }) => string;
  anonymous: string;
  help: string;
  thanks: string;
  fallback: (p: { count: number; childName: string }) => string;
  detailLabels: {
    status: string;
    category: string;
    priority: string;
    center: string;
    village: string;
    submitted: string;
    submittedBy: string;
    anonymousBy: string;
    supervisor: string;
    expectedResolution: string;
    latestUpdate: string;
    resolution: string;
    description: string;
  };
  statusLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
  priorityLabels: Record<string, string>;
  ui: {
    headerTitle: string;
    online: (count: number) => string;
    typing: string;
    demoBanner: string;
    typeMessage: string;
    viewDetails: string;
    openFullPage: string;
    trackTimeline: string;
    anonymousTag: string;
    back: string;
  };
};
