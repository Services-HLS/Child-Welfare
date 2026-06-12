import { ComplaintStatus } from "@/types/platform";
import { PUBLIC_GRIEVANCE_TIMELINE, publicTimelineIndex } from "@/services/grievance/publicGrievanceService";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function PublicGrievanceTimeline({ status }: { status: ComplaintStatus | string }) {
  const current = publicTimelineIndex(status as ComplaintStatus);
  return (
    <ol className="space-y-0">
      {PUBLIC_GRIEVANCE_TIMELINE.map((label, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className={cn("h-5 w-5", active ? "text-amber-500" : "text-slate-300")} />
              )}
              {i < PUBLIC_GRIEVANCE_TIMELINE.length - 1 && (
                <div className={cn("w-0.5 flex-1 min-h-[20px] my-0.5", done ? "bg-emerald-300" : "bg-slate-200")} />
              )}
            </div>
            <div className="pb-4">
              <p className={cn("text-sm font-bold", done ? "text-emerald-900" : active ? "text-amber-900" : "text-slate-400")}>
                {label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
