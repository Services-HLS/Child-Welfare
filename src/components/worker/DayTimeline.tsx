import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayStep = {
  id: string;
  label: string;
  status: "done" | "current" | "pending";
  time?: string;
};

export function DayTimeline({ steps }: { steps: DayStep[] }) {
  return (
    <ol className="space-y-0 border-l-2 border-slate-200 ml-3">
      {steps.map((s) => (
        <li key={s.id} className="relative pl-6 pb-4 last:pb-0">
          <span
            className={cn(
              "absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center",
              s.status === "done" && "border-emerald-600",
              s.status === "current" && "border-[#1e40af]",
              s.status === "pending" && "border-slate-300"
            )}
          >
            {s.status === "done" ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            ) : s.status === "current" ? (
              <Clock className="h-2.5 w-2.5 text-[#1e40af]" />
            ) : (
              <Circle className="h-2 w-2 text-slate-300" />
            )}
          </span>
          <p className={cn("text-sm font-semibold", s.status === "current" && "text-[#1e40af]")}>{s.label}</p>
          {s.time && <p className="text-[10px] text-slate-500">{s.time}</p>}
        </li>
      ))}
    </ol>
  );
}
