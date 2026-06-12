import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

export default function DistrictOutcomes() {
  const { getCenterOutcome, childProgress } = useApp();
  const data = mockCenters
    .filter((c) => c.district === "Tirupati")
    .map((c) => {
      const o = getCenterOutcome(c.id);
      return { name: c.name.slice(0, 12), score: o?.developmentScore ?? 0, trend: o?.outcomeTrend ?? "stable" };
    });

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">District Outcomes Dashboard</h1>
      <p className="text-sm text-slate-500">Tirupati district — child development vs service delivery</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{childProgress.length}</div><div className="text-[10px] uppercase text-slate-400">Outcome records</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black text-red-600">{data.filter((d) => d.trend === "declining").length}</div><div className="text-[10px] uppercase text-slate-400">Declining centers</div></div>
      </div>
      <div className="rounded-2xl border bg-white p-6 h-72">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Development score by center</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis /><Tooltip /><Bar dataKey="score" fill="#14b8a6" radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {mockCenters.slice(0, 4).map((c) => (
          <Link key={c.id} to={`/center-digital-view/${c.id}`} className="text-xs font-black uppercase text-blue-600 border rounded-lg px-3 py-2 hover:bg-blue-50">
            Twin: {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
