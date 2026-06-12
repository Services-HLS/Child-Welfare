import { AIVerificationMeta } from "@/services/public/evidenceVerification";
import { Sparkles } from "lucide-react";

export function AIExplainabilityPanel({ ai }: { ai: AIVerificationMeta }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <h3 className="text-xs font-bold uppercase text-violet-900 flex items-center gap-2">
        <Sparkles className="h-4 w-4" /> Why AI Decided This
      </h3>
      <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
        <div>
          <span className="text-slate-500">Classification:</span>{" "}
          <strong>{ai.issueClassification}</strong>
        </div>
        <div>
          <span className="text-slate-500">Urgency:</span>{" "}
          <strong className="text-amber-800">{ai.urgencyLabel}</strong>
        </div>
        <div>
          <span className="text-slate-500">Confidence:</span>{" "}
          <strong>{Math.round(ai.confidence * 100)}%</strong>
        </div>
        <div>
          <span className="text-slate-500">Sentiment:</span> <strong className="capitalize">{ai.sentiment}</strong>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {ai.explainability.map((reason, i) => (
          <li key={i} className="text-xs text-slate-700 flex gap-2">
            <span className="text-violet-600 font-bold">{i + 1}.</span>
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
