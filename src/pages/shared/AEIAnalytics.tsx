import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { GovCard } from "@/components/gov/GovCard";
import { AEI_WEIGHTS } from "@/services/excellence/aei";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MultiRoleProtected } from "@/components/app/MultiRoleProtected";

function AEIContent() {
  const { excellenceIndexes } = useApp();
  const [district, setDistrict] = useState<string>("all");
  const [band, setBand] = useState<string>("all");

  const districts = [...new Set(mockCenters.map((c) => c.district))];
  let rows = excellenceIndexes;
  if (district !== "all") rows = rows.filter((a) => a.district === district);
  if (band !== "all") rows = rows.filter((a) => a.band === band);

  const avg = rows.length ? Math.round(rows.reduce((s, a) => s + a.score, 0) / rows.length) : 0;

  return (
    <div className="space-y-6 pb-20">
      <GovCard title="Anganwadi Excellence Index (AEI)" subtitle="Official statewide center score — replaces fragmented operational metrics">
        <p className="text-sm text-slate-700 mb-4">
          AEI combines worker performance, child engagement, beneficiary satisfaction, grievance closure, attendance,
          service verification confidence, and intervention success. Green, orange, and red bands emphasize improvement and service strengthening.
        </p>
        <div className="grid sm:grid-cols-3 lg:grid-cols-7 gap-2 text-[10px] font-semibold text-slate-600">
          {Object.entries(AEI_WEIGHTS).map(([k, v]) => (
            <div key={k} className="border p-2 bg-slate-50">{k.replace(/([A-Z])/g, " $1")}: {(v * 100).toFixed(0)}%</div>
          ))}
        </div>
      </GovCard>

      <div className="flex flex-wrap gap-2 items-center border border-slate-200 bg-white p-3">
        <span className="text-xs font-semibold">Filters:</span>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="border text-sm px-2 py-1">
          <option value="all">All districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value)} className="border text-sm px-2 py-1">
          <option value="all">All bands</option>
          <option value="green">Green</option>
          <option value="orange">Orange</option>
          <option value="red">Red (supportive intervention)</option>
        </select>
        <span className="text-sm font-bold ml-auto">District avg AEI: {avg}</span>
      </div>

      <div className="h-64 border border-slate-200 bg-white p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows.slice(0, 12)}>
            <XAxis dataKey="centerName" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#1e40af" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm table-zebra">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase">
            <tr>
              <th className="p-3">Center</th>
              <th className="p-3">District</th>
              <th className="p-3">AEI</th>
              <th className="p-3">Band</th>
              <th className="p-3">Trend</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.centerId} className="border-t">
                <td className="p-3 font-semibold">{a.centerName}</td>
                <td className="p-3">{a.district}</td>
                <td className="p-3 font-bold">{a.score}</td>
                <td className="p-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold uppercase",
                    a.band === "green" ? "bg-emerald-100 text-emerald-900" : a.band === "orange" ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-900"
                  )}>{a.band}</span>
                </td>
                <td className="p-3 capitalize">{a.trend}</td>
                <td className="p-3 space-x-2">
                  <Link to={`/center-command/${a.centerId}`} className="text-[#1e40af] text-xs font-semibold">Command</Link>
                  <Link to={`/aei-explanation/${a.centerId}`} className="text-[#1e40af] text-xs font-semibold">Explain</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AEIAnalytics() {
  return (
    <MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}>
      <AEIContent />
    </MultiRoleProtected>
  );
}
