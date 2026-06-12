import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicComplaintSteps } from "@/components/beneficiary/ParentComplaintSteps";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function BeneficiaryComplaints() {
  const { user } = useApp();
  const { myComplaints } = usePublicPortal();

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader
        badge="Public grievance center"
        title="Public grievances"
        subtitle={`${myComplaints.length} total — evidence, officer actions, and closure`}
      />

      <div className="flex justify-end">
        <Link to="/beneficiary/feedback" className="flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase">
          <Plus className="h-4 w-4" /> Raise new issue
        </Link>
      </div>

      <div className="space-y-4">
        {myComplaints.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No grievances yet. Concerns from feedback or low ratings are registered automatically.
          </p>
        )}
        {myComplaints.map((c) => (
          <Link
            key={c.id}
            to={`/beneficiary/request/${c.id}`}
            className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-[#1e3a5f]"
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{c.id}</p>
                <h2 className="font-bold text-slate-900">{c.title}</h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-blue-600 shrink-0">
                {c.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="mt-3">
              <PublicComplaintSteps complaint={c} />
            </div>
            <p className="text-xs text-slate-500 mt-2">SLA: {format(new Date(c.slaDueAt), "MMM d")} · Tap for details</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
