import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function StateImpact() {
  const { impactMetrics, governmentStory } = useApp();
  const m = impactMetrics;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black uppercase">State Impact & Outcomes</h1>
          <p className="text-sm text-slate-500">Outcome KPIs — not only operational metrics</p>
        </div>
        <Link to="/state-admin/story" className="text-xs font-black uppercase text-blue-600 flex items-center gap-1">Government story <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Children served", value: m.childrenServed },
          { label: "Issues resolved", value: m.issuesResolved },
          { label: "Workers improved", value: m.workersImprovedPostCoaching },
          { label: "Satisfaction Δ", value: `${m.satisfactionChangePct > 0 ? "+" : ""}${m.satisfactionChangePct}%` },
          { label: "SQI Δ", value: `${m.serviceQualityChangePct > 0 ? "+" : ""}${m.serviceQualityChangePct}%` },
          { label: "Intervention success", value: `${m.interventionSuccessRate}%` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xl font-black">{k.value}</div>
            <div className="text-[9px] font-black uppercase text-slate-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-slate-50 p-5">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Before ({m.periodLabel})</h3>
          <p className="text-sm">SQI {m.before.sqi}% · Satisfaction {m.before.satisfaction}% · Open complaints {m.before.openComplaints}</p>
        </div>
        <div className="rounded-2xl border bg-emerald-50 p-5">
          <h3 className="text-[10px] font-black uppercase text-emerald-700 mb-3 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> After</h3>
          <p className="text-sm">SQI {m.after.sqi}% · Satisfaction {m.after.satisfaction}% · Open complaints {m.after.openComplaints}</p>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-3">Executive narrative preview</h3>
        {governmentStory.slice(0, 2).map((g) => (
          <p key={g.id} className="text-sm text-slate-700 mb-2">{g.narrative}</p>
        ))}
      </div>
      <Link to="/impact" className="inline-block text-xs font-black uppercase text-blue-600">Full impact dashboard →</Link>
    </div>
  );
}
