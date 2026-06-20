import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { EvidenceStrip } from "@/components/public/EvidenceMediaTile";
import { getComplaintEvidence } from "@/lib/complaint-evidence";
import {
  aiSeverityLabel,
  isPublicSupervisorGrievance,
  priorityLabel,
  supervisorBucket,
  SupervisorGrievanceBucket,
} from "@/services/grievance/publicGrievanceService";
import { toast } from "sonner";

export default function PublicGrievanceCenter() {
  const { complaints, updateComplaint, addGrievanceAction } = useApp();
  const [tab, setTab] = useState<SupervisorGrievanceBucket>("new");

  const list = useMemo(
    () =>
      complaints
        .filter((c) => c.district === "Tirupati" && isPublicSupervisorGrievance(c))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [complaints]
  );

  const counts = useMemo(() => {
    const m: Record<SupervisorGrievanceBucket, number> = { new: 0, in_review: 0, need_evidence: 0, resolved: 0 };
    list.forEach((c) => {
      m[supervisorBucket(c)]++;
    });
    return m;
  }, [list]);

  const filtered = list.filter((c) => supervisorBucket(c) === tab);

  const quickAction = (id: string, action: string, status?: typeof list[0]["status"]) => {
    if (status) updateComplaint(id, { status });
    addGrievanceAction(id, {
      ownerRole: "supervisor",
      officerName: "Supervisor · Tirupati",
      notes: action,
      timestamp: new Date().toISOString(),
    });
    toast.success(action);
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <p className="text-[10px] font-bold uppercase text-[#1e40af]">WDCW · Supervisor · Primary queue</p>
        <h1 className="text-2xl font-black text-[#0F172A]">Public Grievance Center</h1>
        <p className="text-sm text-slate-500">
          Citizen evidence and AI summaries route here directly — Anganwadi workers are not grievance handlers.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(
          [
            ["new", "New", counts.new],
            ["in_review", "In Review", counts.in_review],
            ["need_evidence", "Need Evidence", counts.need_evidence],
            ["resolved", "Resolved", counts.resolved],
          ] as [SupervisorGrievanceBucket, string, number][]
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-xl border p-3 text-left",
              tab === id ? "border-[#1e3a5f] bg-blue-50" : "bg-white"
            )}
          >
            <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
            <p className="text-2xl font-black">{n}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-500">{c.id}</p>
                <h2 className="font-bold text-slate-900">{c.title}</h2>
                <p className="text-xs text-slate-600 mt-1">
                  {c.category.replace(/_/g, " ")} · {c.beneficiaryName} · {format(new Date(c.createdAt), "PP")}
                  {c.anonymous && (
                    <span className="ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200">
                      Anonymous
                    </span>
                  )}
                </p>
                <p className="text-xs mt-1">
                  Priority: <strong>{priorityLabel(c.grievance?.citizenPriority ?? c.priority)}</strong> · AI severity:{" "}
                  <strong className="capitalize">{aiSeverityLabel(c)}</strong>
                </p>
              </div>
              <span className="text-[9px] font-bold uppercase px-2 py-1 h-fit rounded bg-amber-50 text-amber-900 border">
                {c.status.replace(/_/g, " ")}
              </span>
            </div>
            {(c.citizenEvidence?.length ?? 0) > 0 && (
              <div className="mt-2">
                <p className="text-xs text-emerald-700 flex items-center gap-1 mb-2">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {getComplaintEvidence(c).length} evidence file(s)
                </p>
                <EvidenceStrip items={getComplaintEvidence(c)} />
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-3">
              <Link to={`/supervisor/grievance/${c.id}`} className="gov-btn-primary text-[10px] py-1.5 px-3">
                Open Details
              </Link>
              <button
                type="button"
                className="gov-btn-outline text-[10px] py-1.5"
                onClick={() => quickAction(c.id, "Supervisor assigned to case", "supervisor_review")}
              >
                Assign
              </button>
              <button type="button" className="gov-btn-outline text-[10px] py-1.5" onClick={() => quickAction(c.id, "Additional evidence requested from citizen", "need_evidence")}>
                Request Evidence
              </button>
              <button type="button" className="gov-btn-outline text-[10px] py-1.5 border-amber-300" onClick={() => quickAction(c.id, "Escalated to district", "district_escalation")}>
                Escalate
              </button>
              <button type="button" className="gov-btn-outline text-[10px] py-1.5" onClick={() => quickAction(c.id, "Marked resolved pending citizen confirmation", "beneficiary_confirmation")}>
                Resolve
              </button>
            </div>
            <Link to={`/supervisor/grievance/${c.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]">
              Full investigation <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-500">No grievances in this queue.</p>}
      </div>
    </div>
  );
}
