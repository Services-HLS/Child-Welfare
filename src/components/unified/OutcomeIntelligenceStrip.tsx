import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";

export function OutcomeIntelligenceStrip() {
  const { platformOutcomes } = useApp();
  const p = platformOutcomes;
  const items = [
    { label: "AEI", value: p.aeiAvg, to: "/impact" },
    { label: "SQI", value: p.sqiAvg, to: "/state-admin/mission-control" },
    { label: "CWI", value: p.cwiAvg, to: "/state-admin/outcomes" },
    { label: "Satisfaction", value: `${p.beneficiarySatisfactionIndex}%`, to: "/voice-of-citizen" },
    { label: "Interventions", value: `${p.interventionSuccessRate}%`, to: "/supervisor/interventions" },
    { label: "Worker growth", value: `${p.workerImprovementRate}%`, to: "/worker/growth" },
    { label: "Closure", value: `${p.complaintClosureRate}%`, to: "/state-admin/complaints" },
    { label: "Trust", value: `${p.trustScore}%`, to: "/public/transparency" },
  ];
  return (
    <div className="rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 overflow-x-auto">
      <div className="text-[10px] font-black uppercase text-slate-400 mb-3">Unified Service Improvement Layer</div>
      <div className="flex flex-wrap gap-3">
        {items.map((it) => (
          <Link key={it.label} to={it.to} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 min-w-[90px]">
            <div className="text-lg font-black">{it.value}</div>
            <div className="text-[9px] font-bold uppercase text-slate-400">{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
