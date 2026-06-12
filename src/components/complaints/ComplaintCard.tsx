import { ComplaintRecord } from "@/types/platform";
import { format } from "date-fns";
import { ComplaintTimeline } from "./ComplaintTimeline";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { AIExplainabilityPanel } from "@/components/explainability/AIExplainabilityPanel";
import { explainGrievance } from "@/services/ai/explainability";

export function ComplaintCard({
  complaint,
  detailPath,
  actions,
}: {
  complaint: ComplaintRecord;
  detailPath?: string;
  actions?: React.ReactNode;
}) {
  const overdue = new Date(complaint.slaDueAt) < new Date() && complaint.status !== "closed";
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{complaint.id}</div>
          <h3 className="text-sm font-black text-slate-900 uppercase">{complaint.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{complaint.centerName} · {complaint.category}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-black uppercase",
            overdue ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
          )}
        >
          {overdue ? "SLA Breach" : complaint.status.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-xs text-slate-600 mt-3 line-clamp-2">{complaint.description}</p>
      {complaint.aiClassification && (
        <div className="mt-3">
          <AIExplainabilityPanel explanation={explainGrievance(complaint)} />
        </div>
      )}
      <div className="mt-4 overflow-x-auto">
        <ComplaintTimeline status={complaint.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
        <span>Updated {format(new Date(complaint.updatedAt), "MMM d, h:mm a")}</span>
        {detailPath && (
          <Link to={detailPath} className="text-blue-600 hover:underline">
            View details
          </Link>
        )}
      </div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
