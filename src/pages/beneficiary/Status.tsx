import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicComplaintSteps } from "@/components/beneficiary/ParentComplaintSteps";
import { format } from "date-fns";
import { CheckCircle2, RotateCcw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function BeneficiaryStatus() {
  const { advanceComplaint, updateComplaint } = useApp();
  const { myComplaints } = usePublicPortal();

  const confirm = (id: string) => {
    advanceComplaint(id, "closed", { beneficiaryConfirmed: true });
    toast.success("Thank you", {
      description: "Grievance closed. A short satisfaction survey may appear under Surveys.",
    });
  };

  const reopen = (id: string) => {
    updateComplaint(id, {
      status: "supervisor_review",
      beneficiaryConfirmed: false,
      resolutionNote: undefined,
    });
    toast.info("Issue reopened", { description: "The center team will review your concern again." });
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader
        badge="Track resolution"
        title="Public grievance resolution"
        subtitle="Officer actions, evidence, and citizen confirmation"
      />

      {myComplaints.map((c) => (
        <div key={c.id} className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <Link to={`/beneficiary/request/${c.id}`} className="text-xs font-bold text-[#1e40af]">
            Open full request details →
          </Link>
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{c.id}</p>
              <h2 className="font-bold text-slate-900 text-lg">{c.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{c.description.slice(0, 200)}</p>
            </div>
          </div>

          <PublicComplaintSteps complaint={c} />

          {c.resolutionNote && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-500">Resolution notes</p>
              <p className="text-sm mt-1">{c.resolutionNote}</p>
            </div>
          )}

          {c.resolutionEvidenceUrl && (
            <div className="rounded-xl overflow-hidden border">
              <p className="text-[10px] font-bold uppercase text-slate-500 p-2 bg-slate-50 flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> Action taken evidence
              </p>
              <img src={c.resolutionEvidenceUrl} alt="Resolution evidence" className="w-full h-40 object-cover" />
            </div>
          )}

          <p className="text-[10px] text-slate-400 font-bold uppercase">
            SLA due {format(new Date(c.slaDueAt), "MMM d, h:mm a")}
          </p>

          <div className="flex flex-wrap gap-2">
            {(c.status === "resolution" || c.status === "beneficiary_confirmation") && (
              <>
                <button
                  type="button"
                  onClick={() => confirm(c.id)}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-3 text-xs font-bold uppercase"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirm resolution
                </button>
                <Link
                  to="/beneficiary/surveys"
                  className="flex-1 min-w-[140px] flex items-center justify-center rounded-xl border-2 border-teal-600 text-teal-800 py-3 text-xs font-bold uppercase"
                >
                  Satisfaction survey
                </Link>
              </>
            )}
            {c.status === "closed" && (
              <button
                type="button"
                onClick={() => reopen(c.id)}
                className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-4 py-2 text-xs font-bold uppercase"
              >
                <RotateCcw className="h-4 w-4" /> Reopen if unsatisfied
              </button>
            )}
          </div>
        </div>
      ))}

      {myComplaints.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          No grievances to track. <Link to="/beneficiary/feedback" className="text-[#1e40af] underline">Give feedback</Link>
        </p>
      )}
    </div>
  );
}
