import { CenterJourneyPhase } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export function CenterJourneyTimeline({ phases }: { phases: CenterJourneyPhase[] }) {
  return (
    <div className="space-y-0">
      {phases.map((p, i) => (
        <div key={p.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center border-2",
              p.status === "complete" ? "bg-emerald-500 border-emerald-500 text-white" :
              p.status === "active" ? "bg-amber-100 border-amber-500 text-amber-700" :
              "bg-slate-100 border-slate-200 text-slate-400"
            )}>
              {p.status === "complete" ? <CheckCircle2 className="h-5 w-5" /> :
               p.status === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> :
               <Circle className="h-4 w-4" />}
            </div>
            {i < phases.length - 1 && <div className={cn("w-0.5 flex-1 min-h-[2rem]", p.status === "complete" ? "bg-emerald-300" : "bg-slate-200")} />}
          </div>
          <div className="pb-6 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-black uppercase text-slate-800">{p.label}</h4>
              <span className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                p.status === "complete" ? "bg-emerald-100 text-emerald-800" :
                p.status === "active" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
              )}>{p.status}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.narrative}</p>
            {p.timestamp && <p className="text-[10px] text-slate-400 mt-1">{format(new Date(p.timestamp), "MMM d, h:mm a")}</p>}
            {p.link && (
              <Link to={p.link} className="text-[10px] font-black uppercase text-blue-600 mt-2 inline-flex items-center gap-1">
                Explain AI <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
