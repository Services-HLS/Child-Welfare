import { AIExplanation } from "@/types/intelligence";
import { AIExplainabilityPanel } from "./AIExplainabilityPanel";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function ExplainabilityFramework({
  explanation,
  detailHref,
  compact,
}: {
  explanation: AIExplanation;
  detailHref?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-3", compact && "text-sm")}>
      {explanation.score !== undefined && (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-slate-900 text-white px-4 py-2">
            <div className="text-[9px] font-black uppercase opacity-70">Score</div>
            <div className="text-xl font-black">{typeof explanation.score === "number" ? explanation.score.toFixed(0) : explanation.score}{explanation.sourceType === "sqi" ? "" : "%"}</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-2">
            <div className="text-[9px] font-black uppercase text-slate-400">Confidence</div>
            <div className="text-xl font-black text-blue-600">{(explanation.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      )}
      {explanation.thresholds && explanation.thresholds.length > 0 && (
        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Thresholds</div>
          <div className="flex flex-wrap gap-2">
            {explanation.thresholds.map((t, i) => (
              <span key={i} className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-full", t.met ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                {t.label}: {t.value} {t.met ? "✓" : "—"}
              </span>
            ))}
          </div>
        </div>
      )}
      <AIExplainabilityPanel explanation={explanation} />
      {detailHref && (
        <Link to={detailHref} className="text-[10px] font-black uppercase text-blue-600">Full explanation →</Link>
      )}
    </div>
  );
}
