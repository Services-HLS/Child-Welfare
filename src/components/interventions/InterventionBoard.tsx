import { useApp } from "@/context/AppContext";
import { DIMENSION_LABELS } from "@/services/interventions/engine";
import { InterventionStatus } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FLOW: InterventionStatus[] = ["proposed", "approved", "active", "completed", "impact_measured"];

export function InterventionBoard({ scope }: { scope: "supervisor" | "district" }) {
  const { interventions, updateIntervention, launchIntervention, refreshInterventions } = useApp();
  const list = [...interventions].sort((a, b) => a.priority - b.priority);

  const nextStatus = (s: InterventionStatus): InterventionStatus | null => {
    const n = s === "recommended" ? "proposed" : s === "in_progress" ? "active" : s;
    const i = STATUS_FLOW.indexOf(n as InterventionStatus);
    return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
  };

  return (
    <div className="space-y-4">
      <button onClick={() => { refreshInterventions(); toast.info("Interventions refreshed from live data"); }} className="text-[10px] font-black uppercase text-blue-600">
        Refresh AI recommendations
      </button>
      {list.map((i) => {
        const st = i.status === "recommended" ? "proposed" : i.status === "in_progress" ? "active" : i.status;
        const next = nextStatus(st);
        return (
          <div key={i.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm">{i.title}</h3>
                <p className="text-[10px] text-slate-500 uppercase">{i.centerName} · {DIMENSION_LABELS[i.dimension]}</p>
              </div>
              <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-full", st === "active" ? "bg-blue-100 text-blue-800" : st === "impact_measured" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100")}>
                {st.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-2">{i.description}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-[10px] font-bold uppercase text-slate-500">
              <div>Impact: <span className="text-emerald-700">{i.expectedImpact}</span></div>
              <div>Owner: {i.owner ?? "District"}</div>
              <div>Due: {i.timelineDue ?? "—"}</div>
              <div>Priority: {i.priority}</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Projected +{i.projectedOutcomeDelta ?? 12}% · {i.evidenceSummary}</p>
            {i.measuredOutcome && <p className="text-xs text-emerald-800 mt-1 font-bold">Measured: {i.measuredOutcome}</p>}
            {scope === "district" && (
              <div className="flex gap-2 mt-4">
                {st === "proposed" && (
                  <button onClick={() => updateIntervention(i.id, "approved")} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-[10px] font-black uppercase">Approve</button>
                )}
                {(st === "approved" || st === "proposed") && (
                  <button onClick={() => launchIntervention(i.id)} className="rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase">Activate</button>
                )}
                {next && st !== "impact_measured" && (
                  <button onClick={() => updateIntervention(i.id, next)} className="rounded-lg border border-emerald-200 text-emerald-800 px-3 py-1.5 text-[10px] font-black uppercase">
                    → {next.replace(/_/g, " ")}
                  </button>
                )}
              </div>
            )}
            {scope === "supervisor" && st === "proposed" && (
              <button onClick={() => launchIntervention(i.id)} className="mt-3 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[10px] font-black uppercase">Launch</button>
            )}
          </div>
        );
      })}
      {list.length === 0 && <p className="text-sm text-slate-500">No interventions — run a demo scenario or refresh.</p>}
    </div>
  );
}
