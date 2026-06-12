import { Link } from "react-router-dom";
import { TrainingModule } from "@/types/session";
import { TrainingCourseProgress } from "@/types/training-course";
import { sectionProgressPercent } from "@/services/worker/trainingCourseService";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Sparkles, UserCheck, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export function TrainingModuleCard({
  module,
  assignedBy,
  relatedSessionLabel,
  expectedImpact,
  dueAt,
  statusLabel,
  progress,
  recommendationId,
}: {
  module: TrainingModule;
  assignedBy: "ai" | "supervisor";
  relatedSessionLabel?: string;
  expectedImpact: string;
  dueAt?: string;
  statusLabel: string;
  progress?: TrainingCourseProgress | null;
  recommendationId?: string;
}) {
  const pct = progress ? sectionProgressPercent(progress.completedSections) : 0;
  const continueLearning = progress && pct > 0 && pct < 100;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm hover:border-[#1e3a5f]/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
          <BookOpen className="h-6 w-6 text-[#1e3a5f]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase text-slate-500">{statusLabel}</p>
          <h3 className="font-bold text-[#0F172A] mt-0.5">{module.title}</h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{module.description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          {assignedBy === "ai" ? <Sparkles className="h-3.5 w-3.5 text-blue-600" /> : <UserCheck className="h-3.5 w-3.5 text-indigo-600" />}
          <span>Assigned by {assignedBy === "ai" ? "AI (session)" : "Supervisor"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="h-3.5 w-3.5" />
          <span>{module.durationMinutes} min estimated</span>
        </div>
        {relatedSessionLabel && (
          <div className="col-span-2 text-slate-600">Related session: {relatedSessionLabel}</div>
        )}
        <div className="col-span-2 text-emerald-800 font-medium">Expected impact: {expectedImpact}</div>
        {dueAt && (
          <div className="col-span-2 text-amber-800">Due {format(new Date(dueAt), "PP")}</div>
        )}
      </div>

      {progress && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#1e40af] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <Link
        to={`/worker/training/${module.id}${recommendationId ? `?rec=${recommendationId}` : ""}`}
        className={cn(
          "mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase",
          continueLearning ? "bg-amber-500 text-white" : "bg-[#0F172A] text-white"
        )}
      >
        {continueLearning ? "Continue Learning" : "Open Learning Module"}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
