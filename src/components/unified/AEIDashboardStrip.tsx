import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { AEIBadge } from "@/components/unified/AEIBadge";
import { Link } from "react-router-dom";

/** Compact AEI for role dashboards — links to center journey / score */
export function AEIDashboardStrip({ centerId, district, title }: { centerId?: string; district?: string; title?: string }) {
  const { getAEI, excellenceIndexes } = useApp();

  if (centerId) {
    const aei = getAEI(centerId);
    if (!aei) return null;
    return (
      <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400">{title ?? "Anganwadi Excellence Index"}</p>
          <p className="text-xs text-slate-600 mt-0.5">Center health — supportive coaching when orange/red</p>
        </div>
        <div className="flex items-center gap-3">
          <AEIBadge aei={aei} link />
          <Link to={`/center-command/${centerId}`} className="text-[10px] font-black uppercase text-blue-600">Center Command →</Link>
        </div>
      </div>
    );
  }

  const filtered = district
    ? excellenceIndexes.filter((a) => mockCenters.find((c) => c.id === a.centerId)?.district === district)
    : excellenceIndexes;
  const avg = filtered.length ? Math.round(filtered.reduce((s, a) => s + a.score, 0) / filtered.length) : 0;
  const green = filtered.filter((a) => a.band === "green").length;
  const red = filtered.filter((a) => a.band === "red").length;

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-4">
      <p className="text-[10px] font-black uppercase text-slate-400">{title ?? `AEI · ${district ?? "Statewide"}`}</p>
      <div className="flex flex-wrap gap-6 mt-2 items-end">
        <div><span className="text-3xl font-black">{avg}</span><span className="text-xs text-slate-500 ml-1">avg index</span></div>
        <div className="text-xs"><span className="font-black text-emerald-700">{green}</span> green centers</div>
        <div className="text-xs"><span className="font-black text-rose-700">{red}</span> need supportive intervention</div>
        <Link to="/impact" className="text-[10px] font-black uppercase text-blue-600 ml-auto">Impact dashboard →</Link>
      </div>
    </div>
  );
}
