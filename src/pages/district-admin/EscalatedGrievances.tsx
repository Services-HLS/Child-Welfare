import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { getComplaintEvidence } from "@/lib/complaint-evidence";
import { useState } from "react";
import { toast } from "sonner";

export default function EscalatedGrievances() {
  const { complaints, updateComplaint, addGrievanceAction } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const list = complaints.filter((c) =>
    ["district_escalation", "state_escalation"].includes(c.status)
  );

  const active = list.find((c) => c.id === selected) ?? list[0];

  const districtAct = (action: string, close?: boolean) => {
    if (!active) return;
    addGrievanceAction(active.id, {
      ownerRole: "district_admin",
      officerName: "District Officer · Tirupati",
      notes: action,
      timestamp: new Date().toISOString(),
    });
    if (close) updateComplaint(active.id, { status: "closed" });
    else if (action.includes("Investigate")) updateComplaint(active.id, { status: "supervisor_review" });
    toast.success(action);
  };

  const evidence = active ? getComplaintEvidence(active) : [];

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black text-[#0F172A]">District Action Center</h1>
        <p className="text-sm text-slate-500">Escalated public grievances — supervisor notes, AI analysis, and evidence.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-2 lg:col-span-1">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={`w-full text-left rounded-xl border p-3 ${active?.id === c.id ? "border-[#1e3a5f] bg-blue-50" : "bg-white"}`}
            >
              <p className="text-[10px] font-mono font-bold">{c.id}</p>
              <p className="text-sm font-bold">{c.title}</p>
              <p className="text-xs text-slate-500">{format(new Date(c.updatedAt), "PP")}</p>
            </button>
          ))}
          {list.length === 0 && <p className="text-sm text-slate-500">No escalated grievances.</p>}
        </div>

        {active && (
          <div className="lg:col-span-2 space-y-4">
            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Supervisor notes</h2>
              <ul className="text-sm space-y-1">
                {(active.grievanceActions ?? [])
                  .filter((a) => a.ownerRole === "supervisor")
                  .map((a) => (
                    <li key={a.id}>{a.notes}</li>
                  ))}
              </ul>
            </section>
            {active.grievance?.aiAnalysis && (
              <section className="rounded-xl border bg-white p-4 text-sm">
                <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">AI analysis</h2>
                <p>{active.grievance.aiAnalysis.summary}</p>
                <p className="text-xs mt-1">Severity: {active.grievance.aiAnalysis.severity} · {Math.round(active.grievance.aiAnalysis.confidence * 100)}%</p>
              </section>
            )}
            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Evidence</h2>
              <PublicEvidenceGallery items={evidence} />
            </section>
            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">History</h2>
              <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                {(active.grievanceActions ?? []).map((a) => (
                  <li key={a.id}>
                    {a.officerName}: {a.notes}
                  </li>
                ))}
              </ul>
            </section>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="gov-btn-primary text-xs" onClick={() => districtAct("District approved supervisor resolution")}>
                Approve
              </button>
              <button type="button" className="gov-btn-outline text-xs" onClick={() => districtAct("District field investigation opened")}>
                Investigate
              </button>
              <button type="button" className="gov-btn-outline text-xs" onClick={() => districtAct("District closed case after verification", true)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
