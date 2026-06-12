import { PARENT_COMPLAINT_STEPS, parentComplaintStep } from "@/services/beneficiary/parentPortalData";
import { ComplaintRecord } from "@/types/platform";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function PublicComplaintSteps({ complaint }: { complaint: ComplaintRecord }) {
  const current = parentComplaintStep(complaint.status);
  return (
    <div className="flex flex-wrap gap-1">
      {PARENT_COMPLAINT_STEPS.map((label, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div
            key={label}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-bold uppercase",
              done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-100 bg-slate-50 text-slate-400",
              active && !done && "border-amber-300 bg-amber-50 text-amber-900"
            )}
          >
            {done && <CheckCircle2 className="h-2.5 w-2.5" />}
            {label}
          </div>
        );
      })}
    </div>
  );
}

/** @deprecated Use PublicComplaintSteps */
export const ParentComplaintSteps = PublicComplaintSteps;
