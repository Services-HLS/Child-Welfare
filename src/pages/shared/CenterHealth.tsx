import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AEIBadge } from "@/components/unified/AEIBadge";
import { cn } from "@/lib/utils";
import { HeartPulse, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function CenterHealth() {
  const { id } = useParams();
  const { getCenterHealth, getAEI } = useApp();
  const health = getCenterHealth(id ?? "");
  const aei = getAEI(id ?? "");
  if (!health || !aei) return <div className="p-10">Center not found</div>;

  const TrendIcon = health.trendDirection === "improving" ? TrendingUp : health.trendDirection === "declining" ? TrendingDown : Minus;

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to={`/center-command/${id}`} className="text-xs font-semibold text-[#1e40af]">← Center Command</Link>
      <h1 className="text-2xl font-black uppercase flex items-center gap-2">
        <HeartPulse className="h-7 w-7 text-rose-600" /> Center Health & Risk Engine
      </h1>
      <AEIBadge aei={aei} />
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-[10px] font-black uppercase text-slate-400">Risk score</div>
          <div className="text-2xl font-black">{health.riskScore}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-[10px] font-black uppercase text-slate-400">Confidence</div>
          <div className="text-2xl font-black">{(health.confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center flex flex-col items-center">
          <div className="text-[10px] font-black uppercase text-slate-400">Trend</div>
          <TrendIcon className={cn("h-6 w-6 mt-1", health.trendDirection === "improving" ? "text-emerald-600" : health.trendDirection === "declining" ? "text-red-500" : "text-slate-400")} />
          <span className="text-xs font-bold uppercase">{health.trendDirection}</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{health.summary}</p>
      <Link to={`/risk-explanation/${id}`} className="text-xs font-black uppercase text-blue-600">Explainable risk breakdown →</Link>
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-3">Contributing factors</h3>
        {health.factors.length === 0 && <p className="text-sm text-slate-500">No elevated risk factors — maintain current cadence.</p>}
        {health.factors.map((f, i) => (
          <div key={i} className={cn("py-3 border-b last:border-0", f.severity === "high" ? "border-l-4 border-l-amber-500 pl-3" : "")}>
            <div className="flex justify-between">
              <span className="font-bold text-sm">{f.label}</span>
              <span className="text-[10px] font-black uppercase text-slate-400">{f.severity}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{f.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-amber-50 p-5">
        <h3 className="text-xs font-black uppercase text-amber-900 mb-3">Recommended actions (supportive)</h3>
        <ul className="text-sm space-y-2">{health.recommendedActions.map((a, i) => <li key={i}>• {a}</li>)}</ul>
      </div>
    </div>
  );
}
