import { PerformanceBand } from "@/types/session";
import { cn } from "@/lib/utils";
import { Leaf, TrendingUp, HeartHandshake } from "lucide-react";

const config: Record<PerformanceBand, { label: string; sub: string; className: string; icon: typeof Leaf }> = {
  green: {
    label: "Performing Well",
    sub: "Keep up the excellent work",
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: Leaf,
  },
  orange: {
    label: "Improvement Recommended",
    sub: "Coaching modules suggested — supportive path",
    className: "bg-amber-50 border-amber-200 text-amber-900",
    icon: TrendingUp,
  },
  red: {
    label: "Training Support Available",
    sub: "Not a penalty — mentorship & practice resources offered",
    className: "bg-rose-50 border-rose-200 text-rose-900",
    icon: HeartHandshake,
  },
};

export function PerformanceBandBadge({ band, score }: { band: PerformanceBand; score?: number }) {
  const c = config[band];
  const Icon = c.icon;
  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", c.className)}>
      <Icon className="h-6 w-6 shrink-0" />
      <div>
        <div className="text-sm font-black uppercase">{c.label}</div>
        {score !== undefined && <div className="text-2xl font-black">{(score * 100).toFixed(0)}% OPI</div>}
        <div className="text-[10px] font-medium mt-1 opacity-80">{c.sub}</div>
      </div>
    </div>
  );
}

export function ScorecardGrid({ scorecard }: { scorecard: import("@/types/session").SessionScorecard }) {
  const rows = [
    { label: "Teaching Effectiveness", value: scorecard.teachingEffectiveness },
    { label: "Child Engagement", value: scorecard.childEngagement },
    { label: "Communication", value: scorecard.communication },
    { label: "Activity Compliance", value: scorecard.activityCompliance },
    { label: "Classroom Management", value: scorecard.classroomManagement },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-lg border border-slate-100 bg-white p-3">
          <div className="text-[9px] font-black uppercase text-slate-400">{r.label}</div>
          <div className="text-lg font-black text-slate-900">{(r.value * 100).toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
}
