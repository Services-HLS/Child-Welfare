import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { ExplainabilityFramework } from "@/components/explainability";
import { explainAEI } from "@/services/ai/explainability";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function AEIExplanation() {
  const { id } = useParams();
  const { getAEI } = useApp();
  const aei = getAEI(id ?? "");
  const center = mockCenters.find((c) => c.id === id);
  if (!aei || !center) return <div className="p-10">Center not found</div>;

  const explanation = explainAEI(aei);
  const history = aei.trendHistory ?? [{ period: "Current", score: aei.score }];

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to={`/center-command/${id}`} className="text-xs font-semibold text-[#1e40af]">← Center Command</Link>
      <div className={cn(
        "border-2 p-6 text-center bg-white",
        aei.band === "green" ? "border-emerald-600" : aei.band === "orange" ? "border-amber-500" : "border-rose-400"
      )}>
        <p className="text-xs font-semibold uppercase text-slate-600">Explainable Government AI — AEI</p>
        <p className="text-5xl font-bold text-[#0F172A]">{aei.score}</p>
        <p className="text-sm font-semibold mt-2">{aei.band === "red" ? "Supportive intervention path active" : aei.band === "orange" ? "Service strengthening recommended" : "Quality delivery maintained"}</p>
      </div>
      <div className="border border-slate-200 bg-white p-4 h-48">
        <p className="text-xs font-semibold text-slate-600 mb-2">Trend history</p>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={history}>
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis domain={[40, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#1e40af" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ExplainabilityFramework explanation={explanation} />
      <Link to={`/center-score/${id}`} className="gov-btn-outline text-sm inline-block">Component breakdown →</Link>
    </div>
  );
}
