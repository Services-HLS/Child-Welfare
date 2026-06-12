import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function GrievanceAnalytics({ scope }: { scope: "supervisor" | "district" | "state" }) {
  const { complaints, feedback, serviceQualityScores } = useApp();
  let list = complaints;
  if (scope === "supervisor") list = complaints.filter((c) => c.district === "Tirupati");
  const open = list.filter((c) => c.status !== "closed");
  const byCategory = open.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  const avgRating = feedback.length ? feedback.reduce((a, f) => a + f.rating, 0) / feedback.length : 4;
  const satisfaction = ((avgRating / 5) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-black">{open.length}</div>
          <div className="text-[10px] font-black uppercase text-slate-400">Unresolved</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-black text-red-600">{list.filter((c) => new Date(c.slaDueAt) < new Date() && c.status !== "closed").length}</div>
          <div className="text-[10px] font-black uppercase text-slate-400">SLA Breach</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{satisfaction}%</div>
          <div className="text-[10px] font-black uppercase text-slate-400">Satisfaction</div>
        </div>
        {scope === "state" && (
          <div className="rounded-xl border bg-white p-4 text-center">
            <div className="text-2xl font-black text-blue-600">{serviceQualityScores[0]?.overallIndex ?? "—"}</div>
            <div className="text-[10px] font-black uppercase text-slate-400">Top SQI</div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Complaint heatmap by category</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCategory).map(([cat, n]) => (
            <span key={cat} className={cn("px-3 py-2 rounded-lg text-[10px] font-black uppercase", n >= 2 ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600")}>
              {cat.replace(/_/g, " ")} ({n})
            </span>
          ))}
          {Object.keys(byCategory).length === 0 && <span className="text-xs text-slate-400">No open complaints</span>}
        </div>
      </div>
    </div>
  );
}
