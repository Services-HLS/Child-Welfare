import { useApp } from "@/context/AppContext";
import { useGrowth } from "@/context/worker/hooks";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function WorkerGrowth() {
  const { t } = useApp();
  const { growth, progressPercent } = useGrowth();

  return (
    <div className="space-y-6 pb-20 w-full">
      <h1 className="text-xl font-bold text-[#0F172A]">{t("my_growth_journey")}</h1>
      <p className="text-sm text-slate-600">
        Event-driven from attendance, sessions, services, training & issues · {progressPercent}% today
      </p>

      <div className={cn(
        "rounded-2xl border p-5",
        growth.currentBand === "green" ? "bg-emerald-50 border-emerald-200" : growth.currentBand === "orange" ? "bg-amber-50" : "bg-rose-50"
      )}>
        <div className="text-[10px] font-bold uppercase">Current support level</div>
        <div className="text-2xl font-bold uppercase">{growth.currentBand}</div>
        <p className="text-xs mt-2">{growth.expectedImpactLabel}</p>
        <p className="text-xs mt-1 text-slate-600">Projected pathway: {growth.projectedGrowth}%</p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Growth timeline</h3>
        <ol className="space-y-2">
          {growth.timeline.map((step) => (
            <li key={step.phase} className="flex justify-between text-sm border-b border-slate-100 py-2">
              <span className="font-medium">{step.phase}</span>
              <span className="text-slate-500 text-xs">{step.status} — {step.detail}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-3">Before vs after coaching</h3>
        <div className="flex items-end gap-6">
          <div><div className="text-3xl font-black text-slate-400">{growth.beforeAfter.before}%</div><div className="text-[10px] uppercase">Before</div></div>
          <ArrowRight className="h-6 w-6 text-blue-500 mb-2" />
          <div><div className="text-3xl font-black text-emerald-700">{growth.beforeAfter.after}%</div><div className="text-[10px] uppercase">{growth.beforeAfter.label}</div></div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 h-64">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Weekly trajectory</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={growth.trajectory}>
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis domain={[40, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border p-4"><div className="text-2xl font-black">{growth.sessionsEvaluated}</div><div className="text-[9px] uppercase text-slate-400">Sessions</div></div>
        <div className="rounded-xl border p-4"><div className="text-2xl font-black">{growth.trainingCompleted}</div><div className="text-[9px] uppercase text-slate-400">Training</div></div>
        <div className="rounded-xl border p-4"><div className="text-2xl font-black">{growth.interventionsJoined}</div><div className="text-[9px] uppercase text-slate-400">Coaching</div></div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-5">
        <h3 className="text-xs font-black uppercase text-blue-800 flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4" /> Recommendations</h3>
        <ul className="text-sm space-y-2">{growth.aiRecommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
      </div>
      <Link to="/worker/training" className="text-xs font-black uppercase text-blue-600">Open training modules →</Link>
    </div>
  );
}
