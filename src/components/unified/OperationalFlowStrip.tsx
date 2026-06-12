import { OperationalFlowStep } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export function OperationalFlowStrip({ steps }: { steps: OperationalFlowStep[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "rounded-xl border px-3 py-2 w-[140px] shrink-0",
              s.status === "complete" ? "bg-emerald-50 border-emerald-200" : s.status === "active" ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-center gap-1.5 mb-1">
                {s.status === "complete" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : s.status === "active" ? <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" /> : <Circle className="h-3.5 w-3.5 text-slate-300" />}
                <span className="text-[9px] font-black uppercase truncate">{s.label}</span>
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-2">{s.narrative}</p>
            </div>
            {i < steps.length - 1 && <div className="w-4 h-0.5 bg-slate-200 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
