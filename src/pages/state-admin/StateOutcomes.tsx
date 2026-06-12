import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Baby, AlertTriangle } from "lucide-react";

export default function StateOutcomes() {
  const { childWellnessIndexes, childRiskSignals, getCenterOutcome, childProgress } = useApp();
  const chartData = mockCenters.slice(0, 10).map((c) => {
    const cwi = childWellnessIndexes.find((w) => w.centerId === c.id);
    const o = getCenterOutcome(c.id);
    return { name: c.name.slice(0, 10), cwi: cwi?.cwiScore ?? 0, expected: cwi?.expectedParticipation ?? 85, actual: cwi?.actualParticipation ?? 0, dev: o?.developmentScore ?? 0 };
  });

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase flex items-center gap-2"><Baby className="h-7 w-7 text-teal-600" /> State Child Outcome Intelligence</h1>
      <p className="text-sm text-slate-500">Child Wellness Index (CWI) alongside Service Quality Index — statewide</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{childProgress.length}</div><div className="text-[10px] uppercase text-slate-400">Outcome records</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black text-teal-600">{Math.round(childWellnessIndexes.reduce((a, w) => a + w.cwiScore, 0) / Math.max(1, childWellnessIndexes.length))}</div><div className="text-[10px] uppercase text-slate-400">Avg CWI</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black text-red-600">{childRiskSignals.length}</div><div className="text-[10px] uppercase text-slate-400">AI risk signals</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{childWellnessIndexes.filter((w) => w.trend === "down").length}</div><div className="text-[10px] uppercase text-slate-400">Declining centers</div></div>
      </div>
      <div className="rounded-2xl border bg-white p-6 h-80">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Expected vs actual participation (CWI components)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="expected" fill="#94a3b8" name="Expected %" />
            <Bar dataKey="actual" fill="#14b8a6" name="Actual %" />
            <Bar dataKey="cwi" fill="#3b82f6" name="CWI" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border bg-red-50 p-5">
        <h3 className="text-xs font-black uppercase text-red-800 flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4" /> Active child risk signals</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {childRiskSignals.slice(0, 8).map((r) => (
            <Link key={r.id} to={`/risk-explanation/${r.id}`} className="text-xs bg-white rounded-lg p-3 border border-red-100 hover:border-red-300">
              <span className="font-bold">{r.type.replace(/_/g, " ")}</span> — {r.summary}
            </Link>
          ))}
        </div>
      </div>
      <Link to="/state-admin/mission-control" className="text-xs font-black uppercase text-blue-600">← Mission Control</Link>
    </div>
  );
}
