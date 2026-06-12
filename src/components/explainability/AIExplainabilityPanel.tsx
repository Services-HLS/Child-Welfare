import { AIExplanation } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export function AIExplainabilityPanel({ explanation }: { explanation: AIExplanation }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase text-blue-600">AI Explainability</div>
          <p className="text-sm font-bold text-slate-900 mt-1">{explanation.summary}</p>
          <div className="text-[10px] font-bold text-slate-500 mt-1">
            Confidence: {(explanation.confidence * 100).toFixed(0)}%
            {explanation.band && (
              <span className={cn("ml-2 px-2 py-0.5 rounded-full uppercase", explanation.band === "green" ? "bg-emerald-100 text-emerald-800" : explanation.band === "orange" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800")}>
                {explanation.band}
              </span>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Contributing factors</div>
        <div className="space-y-2">
          {explanation.factors.map((f, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className={cn("shrink-0 font-black uppercase", f.impact === "positive" ? "text-emerald-600" : f.impact === "negative" ? "text-red-600" : "text-slate-500")}>
                {(f.weight * 100).toFixed(0)}%
              </span>
              <div>
                <span className="font-bold text-slate-800">{f.label}</span> — {f.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Evidence used</div>
        <ul className="text-xs text-slate-600 list-disc pl-4">{explanation.evidenceUsed.map((e, i) => <li key={i}>{e}</li>)}</ul>
      </div>
      {explanation.thresholds && explanation.thresholds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {explanation.thresholds.map((t, i) => (
            <span key={i} className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-full border", t.met ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 text-slate-500")}>
              {t.label}: {t.value}
            </span>
          ))}
        </div>
      )}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
        <div className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1 mb-2"><Lightbulb className="h-3 w-3" /> Recommended actions</div>
        <ul className="text-xs text-amber-900 space-y-1">{explanation.suggestedActions.map((a, i) => <li key={i}>• {a}</li>)}</ul>
      </div>
    </div>
  );
}
