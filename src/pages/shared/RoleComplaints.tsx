import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useComplaints } from "@/context/worker/hooks";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { ComplaintRecord } from "@/types/platform";
import { GrievanceAnalytics } from "@/components/analytics/GrievanceAnalytics";
import { toast } from "sonner";

type Mode = "worker" | "supervisor" | "district" | "state";

export default function RoleComplaints({ mode, useWorkerFlow }: { mode: Mode; useWorkerFlow?: boolean }) {
  const { complaints, user, advanceComplaint, updateComplaint } = useApp();
  const workerFlow = useWorkerFlow ? useComplaints() : null;

  let list: ComplaintRecord[] = complaints;
  if (mode === "worker") {
    list = complaints.filter(
      (c) =>
        c.assignedWorkerId === user?.id &&
        c.grievance?.ownerRole !== "supervisor" &&
        !c.feedbackId
    );
  } else if (mode === "supervisor") {
    list = complaints.filter((c) => c.district === "Tirupati");
  } else if (mode === "district") {
    list = complaints.filter((c) => c.district === user?.assignedDistrict || c.district === "Tirupati");
  }

  const workerRespond = (id: string) => {
    if (workerFlow) {
      workerFlow.resolveIssue(id, "/evidence.jpg");
      return;
    }
    advanceComplaint(id, "worker_review", {
      resolutionNote: "Field visit completed; issue addressed per SOP.",
      resolutionEvidenceUrl: "/evidence.jpg",
    });
    toast.success("Response submitted for supervisor review");
  };

  const supervisorApprove = (id: string) => {
    advanceComplaint(id, "supervisor_review");
    setTimeout(() => advanceComplaint(id, "resolution"), 500);
    toast.success("Approved — awaiting beneficiary confirmation");
  };

  const escalate = (id: string) => {
    updateComplaint(id, { urgencyScore: 0.95, status: "assigned" });
    toast.warning("Escalated to district administration");
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black uppercase text-[#0F172A]">Grievance Resolution</h1>
        <p className="text-sm text-slate-500">
          {mode === "state" ? "Statewide SLA & intervention view" : mode === "district" ? "District complaint aging & volume" : "Operational grievance queue"}
        </p>
      </div>
      {(mode === "supervisor" || mode === "district" || mode === "state") && (
        <GrievanceAnalytics scope={mode === "state" ? "state" : mode === "district" ? "district" : "supervisor"} />
      )}
      {mode === "district" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border p-4 text-center"><div className="text-2xl font-black">{list.length}</div><div className="text-[10px] font-black uppercase text-slate-400">Total</div></div>
            <div className="rounded-xl bg-white border p-4 text-center"><div className="text-2xl font-black text-amber-600">{list.filter((c) => c.status !== "closed").length}</div><div className="text-[10px] font-black uppercase text-slate-400">Open</div></div>
            <div className="rounded-xl bg-white border p-4 text-center"><div className="text-2xl font-black text-red-600">{list.filter((c) => new Date(c.slaDueAt) < new Date() && c.status !== "closed").length}</div><div className="text-[10px] font-black uppercase text-slate-400">SLA Breach</div></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Supervisor decisions</h3>
              <ul className="text-sm space-y-1">
                {list
                  .flatMap((c) => (c.grievanceActions ?? []).filter((a) => a.ownerRole === "supervisor").map((a) => ({ c, a })))
                  .slice(0, 5)
                  .map(({ c, a }) => (
                    <li key={a.id}>
                      <span className="font-mono text-[10px]">{c.id}</span> — {a.notes.slice(0, 40)}
                    </li>
                  ))}
                {list.every((c) => !(c.grievanceActions ?? []).some((a) => a.ownerRole === "supervisor")) && (
                  <li className="text-slate-500 text-xs">No supervisor actions logged yet.</li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Repeated complaints</h3>
              <ul className="text-sm space-y-1">
                {Object.entries(
                  list.reduce<Record<string, number>>((acc, c) => {
                    const k = c.centerId;
                    acc[k] = (acc[k] ?? 0) + 1;
                    return acc;
                  }, {})
                )
                  .filter(([, n]) => n > 1)
                  .slice(0, 5)
                  .map(([centerId, n]) => (
                    <li key={centerId}>
                      {centerId}: <strong>{n}</strong> cases
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Intervention</h3>
              <p className="text-sm text-slate-600">
                {list.filter((c) => ["district_escalation", "state_escalation"].includes(c.status)).length} escalated
                cases require district intervention.
              </p>
            </div>
          </div>
        </>
      )}
      {mode === "supervisor" && (
        <Link to="/supervisor/public-grievance-center" className="inline-flex text-xs font-bold text-[#1e40af]">
          Open Public Grievance Center →
        </Link>
      )}
      <div className="space-y-4">
        {list.map((c) => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            actions={
              <>
                {mode === "worker" && (c.status === "assigned" || c.status === "classified") && (
                  <button onClick={() => workerRespond(c.id)} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[10px] font-black uppercase">Submit Response</button>
                )}
                {mode === "supervisor" && (c.status === "worker_review" || c.status === "worker_response" || c.status === "supervisor_review" || c.status === "supervisor_approval") && (
                  <>
                    <button onClick={() => supervisorApprove(c.id)} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-[10px] font-black uppercase">Approve</button>
                    <button onClick={() => escalate(c.id)} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-[10px] font-black uppercase">Escalate</button>
                  </>
                )}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
