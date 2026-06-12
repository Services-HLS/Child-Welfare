import { useApp } from "@/context/AppContext";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GovernmentStory() {
  const { governmentStory } = useApp();

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase flex items-center gap-2"><Sparkles className="h-6 w-6 text-blue-600" /> Government Story Dashboard</h1>
      <p className="text-sm text-slate-500">AI narrative insights for executive decision-making — not charts alone</p>
      <div className="grid md:grid-cols-2 gap-4">
        {governmentStory.map((ins) => (
          <div key={ins.id} className="rounded-2xl border bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-blue-600">{ins.category}</span>
              {ins.trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : ins.trend === "down" ? <TrendingDown className="h-4 w-4 text-red-600" /> : <Minus className="h-4 w-4 text-slate-400" />}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{ins.headline}</h3>
            {ins.metric && <p className={cn("text-sm font-black mt-1", ins.trend === "up" ? "text-emerald-600" : "text-slate-600")}>{ins.metric}</p>}
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{ins.narrative}</p>
            {ins.recommendedAction && (
              <p className="text-xs font-bold text-blue-800 bg-blue-50 rounded-lg p-3 mt-3 border border-blue-100">
                Recommended: {ins.recommendedAction}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
