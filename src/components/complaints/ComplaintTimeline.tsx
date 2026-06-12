import { ComplaintStatus } from "@/types/platform";
import { ESCALATION_FLOW, mapLegacyStatus } from "@/services/escalation/workflow";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

const LABELS: Record<ComplaintStatus, string> = {
  channel_intake: "Input Channel",
  ai_processing: "AI Processing",
  classified: "Classification",
  worker_review: "Worker Review",
  supervisor_review: "Supervisor Review",
  district_escalation: "District",
  state_escalation: "State",
  resolution: "Resolution",
  beneficiary_confirmation: "Confirmation",
  closed: "Closed",
  submitted: "Submitted",
  ai_classification: "AI",
  assigned: "Assigned",
  worker_response: "Worker",
  supervisor_approval: "Supervisor",
};

export function ComplaintTimeline({ status }: { status: ComplaintStatus }) {
  const mapped = mapLegacyStatus(status);
  const idx = ESCALATION_FLOW.indexOf(mapped);
  const displaySteps = ESCALATION_FLOW;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displaySteps.map((step, i) => {
        const done = idx >= 0 ? i <= idx : false;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-bold uppercase tracking-wide",
              done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400"
            )}
          >
            {done ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
            {LABELS[step] ?? step}
          </div>
        );
      })}
    </div>
  );
}
