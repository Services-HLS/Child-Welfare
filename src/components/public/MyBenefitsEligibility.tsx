import { PublicFeedbackSubmitterType } from "@/types/public-context";
import { aiServiceRecommendations, buildBenefitsForContext, BenefitRow } from "@/services/public/benefitsEligibility";
import { cn } from "@/lib/utils";
import { Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLE: Record<BenefitRow["status"], string> = {
  available: "bg-blue-50 text-blue-900 border-blue-200",
  received: "bg-emerald-50 text-emerald-900 border-emerald-200",
  pending: "bg-amber-50 text-amber-900 border-amber-200",
  upcoming: "bg-slate-50 text-slate-700 border-slate-200",
};

export function MyBenefitsEligibility({
  contextType,
  centerName,
}: {
  contextType: PublicFeedbackSubmitterType;
  centerName: string;
}) {
  const benefits = buildBenefitsForContext(contextType, centerName);
  const recs = aiServiceRecommendations(contextType);

  return (
    <section id="benefits" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase text-[#1e3a5f]">My Benefits &amp; Eligibility</h2>
          <p className="text-xs text-slate-600 mt-1">Services available, received, pending, and upcoming for your profile context.</p>
        </div>
        <button
          type="button"
          className="gov-btn-outline text-xs flex items-center gap-1"
          onClick={() => toast.success("Service entitlement report ready", { description: "WDCW demo PDF export" })}
        >
          <Download className="h-3.5 w-3.5" /> Download report
        </button>
      </div>
      <div className="space-y-2">
        {benefits.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2">
            <div>
              <p className="text-sm font-bold text-slate-900">{b.name}</p>
              <p className="text-xs text-slate-500">{b.detail}</p>
            </div>
            <span className={cn("text-[9px] font-bold uppercase px-2 py-1 rounded border", STATUS_STYLE[b.status])}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-blue-50/80 border border-blue-100 p-3">
        <p className="text-[10px] font-bold uppercase text-blue-800 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> AI service recommendations
        </p>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {recs.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
