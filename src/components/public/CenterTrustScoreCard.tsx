import { CenterTrustScore } from "@/services/public/centerTrustScore";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function CenterTrustScoreCard({ trust }: { trust: CenterTrustScore }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase text-[#1e3a5f]">Center Trust Score</h2>
          <p className="text-xs text-slate-600 mt-1">{trust.summary}</p>
        </div>
        <div className="text-3xl font-black text-[#1e3a5f]">{trust.overall}</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
        {trust.dimensions.map((d) => (
          <div key={d.id} className="rounded-lg border border-slate-100 p-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">{d.label}</p>
              {d.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : d.trend === "down" ? (
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>
            <p
              className={cn(
                "text-xl font-black mt-1",
                d.color === "emerald" && "text-emerald-700",
                d.color === "amber" && "text-amber-700",
                d.color === "rose" && "text-rose-700",
                d.color === "blue" && "text-blue-700"
              )}
            >
              {d.score}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
