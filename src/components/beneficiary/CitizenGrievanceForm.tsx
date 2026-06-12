import { useState } from "react";
import { ComplaintCategory, Lang } from "@/types/platform";
import { PublicFeedbackSubmitterType, PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { PublicGrievancePriority } from "@/types/grievance";
import { GrievanceAIAnalysis } from "@/types/grievance";
import { PublicEvidenceItem } from "@/types/public-request";
import { analyzePublicGrievance } from "@/services/ai/grievance-engine";
import { PARENT_FEEDBACK_CATEGORIES } from "@/services/beneficiary/parentPortalData";
import { speechToText } from "@/services/ai/speech";
import { Mic, Loader2, Image as ImageIcon, FileText, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "form" | "ai" | "summary";

export type CitizenSubmitPayload = {
  text: string;
  rating: number;
  category: ComplaintCategory;
  submittedAs: PublicFeedbackSubmitterType;
  publicCategory: string;
  priority: PublicGrievancePriority;
  evidence: PublicEvidenceItem[];
  consent: boolean;
  aiAnalysis: GrievanceAIAnalysis;
  linkedChild?: string;
  linkedCenter?: string;
  anonymous?: boolean;
};

const PRIORITIES: { id: PublicGrievancePriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

export function CitizenGrievanceForm({
  lang,
  submittedAs,
  onSubmittedAsChange,
  typeCategories,
  publicCategory,
  onPublicCategoryChange,
  onSubmit,
  loading,
}: {
  lang: Lang;
  submittedAs: PublicFeedbackSubmitterType;
  onSubmittedAsChange: (t: PublicFeedbackSubmitterType) => void;
  typeCategories: string[];
  publicCategory: string;
  onPublicCategoryChange: (c: string) => void;
  onSubmit: (payload: CitizenSubmitPayload) => Promise<void>;
  loading: boolean;
}) {
  const [step, setStep] = useState<Step>("form");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(3);
  const [category, setCategory] = useState<ComplaintCategory>("other_concerns");
  const [priority, setPriority] = useState<PublicGrievancePriority>("medium");
  const [consent, setConsent] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [evidence, setEvidence] = useState<PublicEvidenceItem[]>([]);
  const [ai, setAi] = useState<GrievanceAIAnalysis | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  const addEvidence = (item: Omit<PublicEvidenceItem, "id" | "uploadedAt">) => {
    setEvidence((p) => [
      ...p,
      { ...item, id: `ev-${Date.now()}-${p.length}`, uploadedAt: new Date().toISOString() },
    ]);
  };

  const runAi = async () => {
    if (!text.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!consent) {
      toast.error("Consent is required to submit grievances with evidence");
      return;
    }
    const body = `[${publicCategory}] ${text}`;
    const result = analyzePublicGrievance(body, rating, "mobile_app", lang);
    setAi(result);
    setStep("ai");
  };

  const goSummary = () => setStep("summary");

  const finalSubmit = async () => {
    if (!ai || !consent) return;
    const body = `[${publicCategory}] [Priority: ${priority}] ${text}`;
    await onSubmit({
      text: body,
      rating,
      category,
      submittedAs,
      publicCategory,
      priority,
      evidence,
      consent,
      aiAnalysis: ai,
      anonymous,
    });
    setStep("form");
    setText("");
    setEvidence([]);
    setAi(null);
    setConsent(false);
  };

  if (step === "ai" && ai) {
    return (
      <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
        <h3 className="text-sm font-bold uppercase text-[#1e3a5f]">AI analysis (before submit)</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">Category:</span> <strong>{ai.issueClassification.replace(/_/g, " ")}</strong></div>
          <div><span className="text-slate-500">Severity:</span> <strong className="capitalize">{ai.severity}</strong></div>
          <div><span className="text-slate-500">Language:</span> <strong>{ai.detectedLanguage.toUpperCase()}</strong></div>
          <div><span className="text-slate-500">Confidence:</span> <strong>{Math.round(ai.confidence * 100)}%</strong></div>
        </div>
        <p className="text-sm"><strong>Extracted context:</strong> {ai.extractedContext}</p>
        <p className="text-sm"><strong>Suggested path:</strong> {ai.suggestedResolutionPath.join(" → ")}</p>
        <p className="text-xs text-slate-600">Cases route to <strong>Supervisor</strong> first — workers are not contacted for clarification.</p>
        <div className="flex gap-2">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => setStep("form")}>Edit</button>
          <button type="button" className="gov-btn-primary text-xs" onClick={goSummary}>Continue to summary</button>
        </div>
      </div>
    );
  }

  if (step === "summary" && ai) {
    return (
      <div className="space-y-4 rounded-2xl border-2 border-[#1e3a5f] bg-white p-6">
        <h3 className="text-sm font-bold uppercase text-[#1e3a5f]">Citizen submission summary</h3>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><dt className="text-slate-500">Submitted as</dt><dd className="font-bold">{PUBLIC_FEEDBACK_SUBMITTER_LABELS[submittedAs]}</dd></div>
          <div><dt className="text-slate-500">Issue</dt><dd className="font-bold">{publicCategory}</dd></div>
          <div><dt className="text-slate-500">Evidence count</dt><dd className="font-bold">{evidence.length}</dd></div>
          <div><dt className="text-slate-500">Priority</dt><dd className="font-bold capitalize">{priority}</dd></div>
        </dl>
        <p className="text-xs bg-slate-50 p-2 rounded border">{ai.extractedContext.slice(0, 200)}…</p>
        <p className="text-xs text-amber-800">After submit: Supervisor review (no worker assignment).</p>
        <div className="flex gap-2">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => setStep("ai")}>Back</button>
          <button type="button" disabled={loading} className="gov-btn-primary text-xs flex-1" onClick={finalSubmit}>
            {loading ? "Submitting…" : "Confirm & submit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase text-red-700">Mandatory for grievances — provide full context for supervisor review</p>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Issue category *</p>
        <div className="flex flex-wrap gap-2">
          {PARENT_FEEDBACK_CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setCategory(c.id as ComplaintCategory)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", category === c.id ? "bg-[#1e3a5f] text-white" : "bg-slate-50")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Context category *</p>
        <div className="flex flex-wrap gap-2">
          {typeCategories.map((c) => (
            <button key={c} type="button" onClick={() => onPublicCategoryChange(c)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", publicCategory === c ? "bg-[#0F172A] text-white" : "bg-slate-50")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Priority *</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", priority === p.id ? "bg-amber-600 text-white" : "bg-slate-50")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Description *</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} required className="w-full min-h-[120px] rounded-xl border p-4 text-sm" placeholder="Describe the issue in full — supervisors will not contact workers for clarification." />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Evidence upload *</p>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
            <ImageIcon className="h-4 w-4" /> Photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addEvidence({ type: "photo", url: URL.createObjectURL(f), label: f.name });
            }} />
          </label>
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
            <Video className="h-4 w-4" /> Video
            <input type="file" accept="video/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addEvidence({ type: "video", url: URL.createObjectURL(f), label: f.name });
            }} />
          </label>
          <button type="button" disabled={voiceMode} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold" onClick={async () => {
            setVoiceMode(true);
            const t = await speechToText(undefined, lang);
            addEvidence({ type: "voice", text: t, label: "Voice note" });
            setText((prev) => prev || t);
            setVoiceMode(false);
          }}>
            {voiceMode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />} Voice
          </button>
          <button type="button" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold" onClick={() => addEvidence({ type: "ocr", text: text || "Handwritten note — meal not delivered on schedule.", label: "OCR note" })}>
            <FileText className="h-4 w-4" /> OCR note
          </button>
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
            <FileText className="h-4 w-4" /> Document
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addEvidence({ type: "document", url: URL.createObjectURL(f), label: f.name });
            }} />
          </label>
        </div>
        {evidence.length > 0 && <p className="text-xs text-emerald-700 mt-2">{evidence.length} file(s) attached</p>}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>I consent to WDCW processing my grievance, evidence, and AI-assisted classification for supervisor resolution (DPDP). *</span>
      </label>
      <label className="flex items-start gap-2 text-sm border border-violet-100 bg-violet-50/50 rounded-lg p-3">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-1" />
        <span>
          <strong>Anonymous submission</strong> — hide my name from field staff; tracking ID and internal traceability retained for supervisor review only.
        </span>
      </label>

      <button type="button" onClick={runAi} className="w-full gov-btn-primary text-xs h-12">
        Run AI analysis & continue
      </button>
    </div>
  );
}
