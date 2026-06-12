import { useState } from "react";
import { ComplaintCategory, Lang } from "@/types/platform";
import { PublicFeedbackSubmitterType, PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { PublicEvidenceItem } from "@/types/public-request";
import { PublicGrievancePriority } from "@/types/grievance";
import { GrievanceAIAnalysis } from "@/types/grievance";
import { analyzePublicGrievance } from "@/services/ai/grievance-engine";
import { PublicEvidenceUpload } from "./PublicEvidenceUpload";
import { cn } from "@/lib/utils";

export const REPORT_ISSUE_CATEGORIES: { id: string; label: string; mapTo?: ComplaintCategory }[] = [
  { id: "meals_not_delivered", label: "Meals Not Delivered", mapTo: "hot_cooked_meals" },
  { id: "worker_conduct", label: "Worker Conduct", mapTo: "worker_behavior" },
  { id: "nutrition_missing", label: "Nutrition Missing", mapTo: "nutrition_quality" },
  { id: "water", label: "Water Issue", mapTo: "drinking_water" },
  { id: "toilet", label: "Toilet Issue", mapTo: "cleanliness" },
  { id: "safety", label: "Safety Concern", mapTo: "child_safety" },
  { id: "infrastructure", label: "Infrastructure Problem", mapTo: "infrastructure" },
  { id: "delay", label: "Delay in Service", mapTo: "service_delivery" },
  { id: "other", label: "Other Public Issues", mapTo: "other_concerns" },
];

const PRIORITIES: { id: PublicGrievancePriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

const RESOLUTION_PREFS = ["Supervisor investigation", "Urgent same-day action", "District escalation if needed"];

export type ReportIssuePayload = {
  submittedAs: PublicFeedbackSubmitterType;
  issueCategoryId: string;
  issueCategoryLabel: string;
  complaintCategory: ComplaintCategory;
  priority: PublicGrievancePriority;
  resolutionPreference: string;
  text: string;
  evidence: PublicEvidenceItem[];
  consent: boolean;
  anonymous: boolean;
  aiAnalysis: GrievanceAIAnalysis;
};

type Props = {
  lang: Lang;
  submittedAs: PublicFeedbackSubmitterType;
  onSubmittedAsChange: (t: PublicFeedbackSubmitterType) => void;
  onSubmit: (p: ReportIssuePayload) => Promise<void>;
  loading: boolean;
};

export function ReportIssueForm({ lang, submittedAs, onSubmittedAsChange, onSubmit, loading }: Props) {
  const [issueId, setIssueId] = useState(REPORT_ISSUE_CATEGORIES[0].id);
  const [priority, setPriority] = useState<PublicGrievancePriority>("medium");
  const [resolutionPref, setResolutionPref] = useState(RESOLUTION_PREFS[0]);
  const [text, setText] = useState("");
  const [evidence, setEvidence] = useState<PublicEvidenceItem[]>([]);
  const [consent, setConsent] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [ai, setAi] = useState<GrievanceAIAnalysis | null>(null);
  const [step, setStep] = useState<"form" | "ai" | "summary">("form");

  const issueMeta = REPORT_ISSUE_CATEGORIES.find((c) => c.id === issueId) ?? REPORT_ISSUE_CATEGORIES[0];

  const runAi = async () => {
    if (!text.trim() || !consent) return;
    const body = `[${issueMeta.label}] [${resolutionPref}] ${text}`;
    const rating =
      priority === "critical" ? 1 : priority === "high" ? 2 : priority === "medium" ? 3 : 4;
    setAi(analyzePublicGrievance(body, rating, "mobile_app", lang));
    setStep("ai");
  };

  const finalSubmit = async () => {
    if (!ai) return;
    await onSubmit({
      submittedAs,
      issueCategoryId: issueId,
      issueCategoryLabel: issueMeta.label,
      complaintCategory: issueMeta.mapTo ?? "other_concerns",
      priority,
      resolutionPreference: resolutionPref,
      text: `[${issueMeta.label}] ${text}`,
      evidence,
      consent,
      anonymous,
      aiAnalysis: ai,
    });
    setText("");
    setEvidence([]);
    setAi(null);
    setStep("form");
  };

  if (step === "ai" && ai) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <h3 className="text-sm font-bold text-amber-900">AI issue analysis — grievance will be created</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <p><strong>Classification:</strong> {ai.issueClassification.replace(/_/g, " ")}</p>
          <p><strong>Severity:</strong> {ai.severity}</p>
          <p><strong>Confidence:</strong> {Math.round(ai.confidence * 100)}%</p>
        </div>
        <p className="text-sm">{ai.extractedContext}</p>
        <p className="text-xs">Route: {ai.suggestedResolutionPath.join(" → ")}</p>
        <div className="flex gap-2">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => setStep("form")}>Edit</button>
          <button type="button" className="gov-btn-primary text-xs" onClick={() => setStep("summary")}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === "summary" && ai) {
    return (
      <div className="space-y-4 rounded-2xl border-2 border-[#1e3a5f] bg-white p-6">
        <h3 className="text-sm font-bold uppercase text-[#1e3a5f]">Official issue submission</h3>
        <p className="text-xs text-slate-600">A grievance ID and supervisor investigation timeline will be generated.</p>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><dt className="text-slate-500">Issue</dt><dd className="font-bold">{issueMeta.label}</dd></div>
          <div><dt className="text-slate-500">Evidence</dt><dd className="font-bold">{evidence.length} files</dd></div>
        </dl>
        <div className="flex gap-2">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => setStep("ai")}>Back</button>
          <button type="button" disabled={loading} className="gov-btn-primary text-xs flex-1" onClick={finalSubmit}>
            {loading ? "Submitting…" : "Submit & track issue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-sm">
      <p className="text-xs text-amber-900 border-l-4 border-amber-500 pl-3">
        Did something happen that needs action? Creates a tracked grievance — supervisor review (not worker).
      </p>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Submitted as *</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PUBLIC_FEEDBACK_SUBMITTER_LABELS) as PublicFeedbackSubmitterType[]).map((type) => (
            <button key={type} type="button" onClick={() => onSubmittedAsChange(type)} className={cn("text-xs font-bold px-2 py-1 rounded border", submittedAs === type ? "bg-[#1e3a5f] text-white" : "bg-slate-50")}>
              {PUBLIC_FEEDBACK_SUBMITTER_LABELS[type].replace(" / Caregiver", "")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Issue category *</p>
        <div className="flex flex-wrap gap-1">
          {REPORT_ISSUE_CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setIssueId(c.id)} className={cn("text-xs px-2 py-1 rounded border", issueId === c.id ? "bg-amber-700 text-white" : "")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Severity *</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={cn("text-xs font-bold px-3 py-1.5 rounded border", priority === p.id ? "bg-amber-600 text-white" : "bg-slate-50")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Resolution preference *</p>
        <div className="flex flex-wrap gap-2">
          {RESOLUTION_PREFS.map((r) => (
            <button key={r} type="button" onClick={() => setResolutionPref(r)} className={cn("text-xs px-2 py-1 rounded border", resolutionPref === r ? "bg-slate-800 text-white" : "")}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <textarea required value={text} onChange={(e) => setText(e.target.value)} className="w-full min-h-[120px] rounded-xl border p-4 text-sm" placeholder="Describe what happened and what action you expect…" />
      <PublicEvidenceUpload evidence={evidence} onChange={setEvidence} lang={lang} label="Evidence (encouraged)" />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>DPDP consent for grievance processing and AI classification. *</span>
      </label>
      <label className="flex items-start gap-2 text-sm border border-violet-100 bg-violet-50/50 rounded-lg p-3">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-1" />
        <span><strong>Anonymous</strong> — identity hidden from field staff; tracking ID retained for supervisors.</span>
      </label>
      <button type="button" onClick={runAi} className="w-full gov-btn-primary text-xs h-12">
        Run AI analysis &amp; continue
      </button>
    </div>
  );
}
