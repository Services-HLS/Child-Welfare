import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus, ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChildOutcomes() {
  const { getCenterOutcome, childWellnessIndexes, childRiskSignals } = useApp();
  const summaries = mockCenters.map((c) => {
    const o = getCenterOutcome(c.id);
    const cwi = childWellnessIndexes.find((w) => w.centerId === c.id);
    const risks = childRiskSignals.filter((r) => r.centerId === c.id);
    return o ? { ...o, cwi, risks, expected: cwi?.expectedParticipation ?? 85, actual: cwi?.actualParticipation ?? 0 } : null;
  }).filter(Boolean);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">Child Outcome Intelligence</h1>
      <p className="text-sm text-slate-500">CWI vs expected outcomes — AI risk signals when service does not improve children</p>
      {childRiskSignals.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-black uppercase text-amber-900 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> Active risk signals</h3>
          <div className="flex flex-wrap gap-2">
            {childRiskSignals.slice(0, 6).map((r) => (
              <Link key={r.id} to={`/risk-explanation/${r.id}`} className="text-[10px] font-bold bg-white border rounded-lg px-2 py-1 hover:border-amber-400">
                {r.type.replace(/_/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {summaries.map((s) => s && (
          <div key={s.centerId} className={cn("rounded-2xl border p-5 bg-white shadow-sm", s.outcomeTrend === "declining" && "border-red-200 bg-red-50/30")}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{s.centerName}</h3>
                <p className="text-[10px] text-slate-400 uppercase">CWI {s.cwi?.cwiScore ?? "—"} · SQI context in digital twin</p>
              </div>
              {s.outcomeTrend === "improving" ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : s.outcomeTrend === "declining" ? <TrendingDown className="h-5 w-5 text-red-600" /> : <Minus className="h-5 w-5 text-slate-400" />}
            </div>
            <div className="mt-3 text-xs bg-slate-50 rounded-lg p-2">
              <span className="font-bold">Expected participation:</span> {s.expected}% · <span className="font-bold">Actual:</span> {s.actual}%
              {s.actual < s.expected - 10 && <span className="text-red-600 font-black ml-2">GAP</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div><div className="text-lg font-black">{s.attendanceRate}%</div><div className="text-[9px] uppercase text-slate-400">Attendance</div></div>
              <div><div className="text-lg font-black">{s.nutritionCompletionRate}%</div><div className="text-[9px] uppercase text-slate-400">Nutrition</div></div>
              <div><div className="text-lg font-black">{s.developmentScore}</div><div className="text-[9px] uppercase text-slate-400">Dev score</div></div>
            </div>
            <div className="flex gap-3 mt-4">
              <Link to={`/center-digital-view/${s.centerId}`} className="text-xs font-black uppercase text-blue-600">Digital twin</Link>
              <Link to={`/center-timeline/${s.centerId}`} className="text-xs font-black uppercase text-teal-600">Timeline</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
