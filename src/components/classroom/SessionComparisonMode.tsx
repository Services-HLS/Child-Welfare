import { SessionComparisonResult } from "@/types/classroom-intelligence";
import { SessionScoreCard } from "./SessionScoreCard";
import { TrendingUp, TrendingDown } from "lucide-react";

export function SessionComparisonMode({ result }: { result: SessionComparisonResult }) {
  return (
    <div className="space-y-4 border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-[#0F172A]">Before coaching vs after coaching</h3>
      <p className="text-sm text-slate-700">{result.narrative}</p>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {result.improved ? (
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-amber-600" />
        )}
        OPI Δ {result.opiDelta >= 0 ? "+" : ""}
        {result.opiDelta}% · Engagement Δ {result.ceiDelta >= 0 ? "+" : ""}
        {result.ceiDelta}%
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Before</p>
          <SessionScoreCard indices={result.before.indices} band={result.before.band} compact />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">After</p>
          <SessionScoreCard indices={result.after.indices} band={result.after.band} compact />
        </div>
      </div>
    </div>
  );
}
