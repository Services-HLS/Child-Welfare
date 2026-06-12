import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AEI_WEIGHTS } from "@/services/excellence/aei";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CenterScore() {
  const { id } = useParams();
  const { getAEI } = useApp();
  const aei = getAEI(id ?? "");
  if (!aei) return <div className="p-10">Center not found</div>;

  const components = [
    { label: "Worker performance", weight: `${(AEI_WEIGHTS.workerPerformance * 100).toFixed(0)}%`, value: aei.components.workerPerformance },
    { label: "Child engagement", weight: `${(AEI_WEIGHTS.childEngagement * 100).toFixed(0)}%`, value: aei.components.childEngagement },
    { label: "Beneficiary satisfaction", weight: `${(AEI_WEIGHTS.beneficiarySatisfaction * 100).toFixed(0)}%`, value: aei.components.beneficiarySatisfaction },
    { label: "Grievance closure", weight: `${(AEI_WEIGHTS.complaintClosure * 100).toFixed(0)}%`, value: aei.components.complaintClosure },
    { label: "Attendance & compliance", weight: `${(AEI_WEIGHTS.attendanceCompliance * 100).toFixed(0)}%`, value: aei.components.attendanceCompliance },
    { label: "Service verification confidence", weight: `${(AEI_WEIGHTS.serviceVerificationConfidence * 100).toFixed(0)}%`, value: aei.components.serviceVerificationConfidence },
    { label: "Intervention success", weight: `${(AEI_WEIGHTS.interventionSuccess * 100).toFixed(0)}%`, value: aei.components.interventionSuccess },
  ];

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to={`/center-command/${id}`} className="text-xs font-semibold text-[#1e40af]">← Center Command</Link>
      <div className={cn(
        "border-2 p-8 text-center bg-white",
        aei.band === "green" ? "border-emerald-600 bg-emerald-50/30" : aei.band === "orange" ? "border-amber-500 bg-amber-50/30" : "border-rose-400 bg-rose-50/30"
      )}>
        <Award className="h-12 w-12 mx-auto mb-2 text-[#0F172A]" />
        <div className="text-xs font-semibold uppercase text-slate-600">Anganwadi Excellence Index (Official)</div>
        <div className="text-6xl font-bold text-[#0F172A]">{aei.score}</div>
        <div className="text-sm font-semibold mt-2">
          {aei.band === "green" ? "Quality delivery maintained" : aei.band === "orange" ? "Service strengthening recommended" : "Supportive intervention path — not punitive"}
        </div>
      </div>
      {aei.trendHistory && (
        <div className="border border-slate-200 bg-white p-4 h-40">
          <p className="text-xs font-semibold text-slate-600 mb-2">Trend history</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={aei.trendHistory}>
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis domain={[40, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#1e40af" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="border border-slate-200 bg-white p-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase text-slate-600">Weighted components</h3>
        {components.map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>{c.label} ({c.weight})</span>
              <span>{c.value}%</span>
            </div>
            <div className="h-2 bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#1e40af]" style={{ width: `${c.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-xs font-semibold uppercase text-slate-800 mb-2">Department guidance</h3>
        <ul className="text-sm space-y-1">{aei.guidance.map((g, i) => <li key={i}>• {g}</li>)}</ul>
        <h3 className="text-xs font-semibold uppercase text-slate-800 mt-4 mb-2">Recommended actions</h3>
        <ul className="text-sm space-y-1">{aei.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
      </div>
      <Link to={`/aei-explanation/${id}`} className="gov-btn-primary text-sm inline-block">Full explainable AEI report →</Link>
    </div>
  );
}
