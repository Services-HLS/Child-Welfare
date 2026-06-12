import { ClassroomTimelineStep } from "@/types/classroom-intelligence";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SessionTimeline({ steps }: { steps: ClassroomTimelineStep[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          {s.status === "done" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : s.status === "active" ? (
            <Loader2 className="h-4 w-4 text-amber-600 animate-spin shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
          )}
          <div>
            <span className={cn("font-semibold", s.status === "active" && "text-[#1e40af]")}>{s.step}</span>
            {s.detail && <p className="text-xs text-slate-500">{s.detail}</p>}
            {s.at && <p className="text-[10px] text-slate-400">{new Date(s.at).toLocaleString()}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
