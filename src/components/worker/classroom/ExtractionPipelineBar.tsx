import { SessionProcessingState } from "@/types/session-extraction";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExtractionPipelineBar({ state }: { state: SessionProcessingState }) {
  return (
    <div className="worker-card border border-[#1e3a5f]/20 bg-slate-50 p-4">
      <h3 className="text-xs font-bold uppercase text-[#1e3a5f] mb-3">Classroom intelligence pipeline</h3>
      <ol className="space-y-2">
        {state.stages.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            {s.status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : s.status === "active" ? (
              <Loader2 className="h-4 w-4 text-[#1e40af] animate-spin shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(s.status === "active" && "font-semibold text-[#0F172A]", s.status === "done" && "text-slate-600")}>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
