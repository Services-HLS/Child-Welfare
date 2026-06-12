import { useState } from "react";
import { Lang } from "@/types/platform";
import { PublicFeedbackSubmitterType, PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { PublicEvidenceItem } from "@/types/public-request";
import { ExperienceType } from "@/types/citizen-experience";
import { analyzeShareExperience, experienceTypeFromRating, ExperienceAnalysisResult } from "@/services/public/experienceAnalysis";
import { PublicEvidenceUpload } from "./PublicEvidenceUpload";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const SHARE_EXPERIENCE_CATEGORIES = [
  "Meals",
  "Preschool Activities",
  "Learning Experience",
  "Nutrition Services",
  "Infrastructure Experience",
  "Worker Support",
  "Communication",
  "Suggestions",
] as const;

const EXPERIENCE_TYPES: { id: ExperienceType; label: string }[] = [
  { id: "appreciation", label: "Appreciation" },
  { id: "suggestion", label: "Suggestion" },
  { id: "concern", label: "Concern (non-actionable)" },
  { id: "satisfaction", label: "Satisfaction" },
  { id: "general", label: "General" },
];

export type ShareExperiencePayload = {
  submittedAs: PublicFeedbackSubmitterType;
  category: string;
  experienceType: ExperienceType;
  rating: number;
  text: string;
  evidence: PublicEvidenceItem[];
};

type Props = {
  lang: Lang;
  submittedAs: PublicFeedbackSubmitterType;
  onSubmittedAsChange: (t: PublicFeedbackSubmitterType) => void;
  onSubmit: (p: ShareExperiencePayload) => Promise<void>;
  loading: boolean;
};

export function ShareExperienceForm({
  lang,
  submittedAs,
  onSubmittedAsChange,
  onSubmit,
  loading,
}: Props) {
  const [category, setCategory] = useState<string>(SHARE_EXPERIENCE_CATEGORIES[0]);
  const [experienceType, setExperienceType] = useState<ExperienceType>("general");
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");
  const [evidence, setEvidence] = useState<PublicEvidenceItem[]>([]);
  const [preview, setPreview] = useState<ExperienceAnalysisResult | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");

  const runPreview = async () => {
    if (!text.trim()) return;
    const analysis = await analyzeShareExperience(text, rating, lang, category);
    setPreview(analysis);
    setStep("preview");
  };

  const finalize = async () => {
    const et = experienceType === "general" ? experienceTypeFromRating(rating, preview?.sentiment ?? "neutral") : experienceType;
    await onSubmit({
      submittedAs,
      category,
      experienceType: et,
      rating,
      text,
      evidence,
    });
    setText("");
    setEvidence([]);
    setPreview(null);
    setStep("form");
  };

  if (step === "preview" && preview) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
        <h3 className="text-sm font-bold text-emerald-900">AI experience summary (no grievance created)</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <p><span className="text-slate-500">Sentiment:</span> <strong className="capitalize">{preview.sentiment}</strong></p>
          <p><span className="text-slate-500">Satisfaction score:</span> <strong>{preview.satisfactionScore}%</strong></p>
        </div>
        <p className="text-sm">{preview.aiSummary}</p>
        <p className="text-xs text-slate-600"><strong>Suggested improvements:</strong> {preview.suggestedImprovements}</p>
        <p className="text-xs text-slate-500">Status will be: Recorded → Acknowledged → may feed Center Trust Score &amp; service analytics.</p>
        <div className="flex gap-2">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => setStep("form")}>Edit</button>
          <button type="button" disabled={loading} className="gov-btn-primary text-xs flex-1" onClick={finalize}>
            {loading ? "Submitting…" : "Submit experience"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        runPreview();
      }}
    >
      <p className="text-xs text-slate-600 border-l-4 border-emerald-500 pl-3">
        How was your experience with the service? Optional evidence is supporting context only — <strong>no supervisor action</strong>.
      </p>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Submitted as</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PUBLIC_FEEDBACK_SUBMITTER_LABELS) as PublicFeedbackSubmitterType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSubmittedAsChange(type)}
              className={cn(
                "text-xs font-bold px-2 py-1 rounded border",
                submittedAs === type ? "bg-[#1e3a5f] text-white" : "bg-slate-50"
              )}
            >
              {PUBLIC_FEEDBACK_SUBMITTER_LABELS[type].replace(" / Caregiver", "")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Category</p>
        <div className="flex flex-wrap gap-1">
          {SHARE_EXPERIENCE_CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={cn("text-xs px-2 py-1 rounded border", category === c ? "bg-[#1e3a5f] text-white" : "")}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Experience type</p>
        <div className="flex flex-wrap gap-1">
          {EXPERIENCE_TYPES.map((t) => (
            <button key={t.id} type="button" onClick={() => setExperienceType(t.id)} className={cn("text-xs px-2 py-1 rounded border", experienceType === t.id ? "bg-slate-800 text-white" : "")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star className={cn("h-8 w-8", n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
          </button>
        ))}
      </div>
      <textarea
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[100px] rounded-xl border p-3 text-sm"
        placeholder="Share appreciation, suggestions, or how services felt today…"
      />
      <PublicEvidenceUpload evidence={evidence} onChange={setEvidence} lang={lang} optional label="Optional evidence" />
      <button type="submit" className="w-full gov-btn-primary text-xs h-11">
        Analyze &amp; continue
      </button>
    </form>
  );
}
