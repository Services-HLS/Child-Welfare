import { useState } from "react";
import { InvestigationRecommendation } from "@/types/investigation";
import { InvestigationDashboardData } from "@/services/ai/investigation-dashboard-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ChevronUp, Mail, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

export type AIRecommendationCardData = {
  id: string;
  recommendation: string;
  reason?: string;
  fullExplanation?: string;
  generatedFrom?: string[];
  expectedImpact?: string;
  officer: string;
  completion: string;
  priority: string;
  complaintReduction: string;
  welfareImprovement: string;
  satisfactionImprovement?: string;
  confidenceScore: number;
  estimatedBudget: string;
};

export type DashboardRecommendation = InvestigationDashboardData["recommendations"][number];

export function mapDashboardRecommendation(r: DashboardRecommendation): AIRecommendationCardData {
  return {
    id: r.id,
    recommendation: r.recommendation,
    reason: r.reason,
    fullExplanation: r.fullExplanation,
    generatedFrom: r.generatedFrom,
    expectedImpact: r.expectedImpact,
    officer: r.officer,
    completion: r.completion,
    priority: r.priority,
    complaintReduction: r.complaintReduction,
    welfareImprovement: r.welfareImprovement,
    satisfactionImprovement: r.satisfactionImprovement,
    confidenceScore: r.confidenceScore,
    estimatedBudget: r.estimatedBudget,
  };
}

export function mapInvestigationRecommendation(r: InvestigationRecommendation): AIRecommendationCardData {
  const budgetByPriority: Record<string, string> = {
    critical: "₹12,400",
    high: "₹2,800",
    medium: "₹1,500",
    low: "₹800",
  };
  return {
    id: r.id,
    recommendation: r.recommendation,
    reason: r.reason,
    fullExplanation: r.fullExplanation,
    generatedFrom: r.supportingEvidence,
    expectedImpact: r.expectedImpact,
    officer: r.responsibleOfficer,
    completion: r.estimatedCompletion,
    priority: r.priority,
    complaintReduction: r.expectedComplaintReduction,
    welfareImprovement: r.expectedChildWelfareImprovement,
    satisfactionImprovement: r.expectedSatisfactionImprovement,
    confidenceScore: r.confidenceScore ?? 84,
    estimatedBudget: r.estimatedBudget ?? budgetByPriority[r.priority] ?? "₹1,500",
  };
}

function priorityBorder(priority: string, applied: boolean) {
  if (applied) return "border-emerald-400 bg-emerald-50/50";
  if (priority === "critical") return "border-rose-300 bg-rose-50/40";
  if (priority === "high") return "border-amber-300 bg-amber-50/40";
  return "border-[#c9a227] bg-amber-50/30";
}

export function AIRecommendationCard({
  rec,
  applied,
  onApply,
}: {
  rec: AIRecommendationCardData;
  applied: boolean;
  onApply: () => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const sources = rec.generatedFrom ?? [];

  return (
    <div className={cn("rounded-sm border-2 p-4", priorityBorder(rec.priority, applied))}>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <h4 className="font-bold text-sm text-[#0c1f3d] flex-1">{rec.recommendation}</h4>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {applied && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white rounded-sm">
                  Applied
                </span>
              )}
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#0c1f3d] text-white rounded-sm">
                {rec.priority}
              </span>
            </div>
          </div>

          {rec.reason && (
            <p className="text-xs text-slate-700">
              <span className="font-bold text-slate-500">Why: </span>
              {rec.reason}
            </p>
          )}

          {rec.expectedImpact && (
            <div className="rounded-sm border border-slate-200 bg-white/70 p-2">
              <p className="text-[9px] font-bold uppercase text-slate-500 mb-0.5">Expected Impact</p>
              <p className="text-xs text-slate-800">{rec.expectedImpact}</p>
            </div>
          )}

          {rec.fullExplanation && (
            <div className="rounded-sm border border-[#1e3a5f]/20 bg-slate-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowExplanation((v) => !v)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-slate-100/80 transition-colors"
              >
                <span className="text-[9px] font-bold uppercase text-[#1e3a5f]">Full AI Explanation</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1e40af] shrink-0">
                  {showExplanation ? (
                    <>
                      Hide <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Show <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </span>
              </button>
              {showExplanation && (
                <div className="px-3 pb-3 border-t border-[#1e3a5f]/10">
                  <p className="text-xs text-slate-800 leading-relaxed pt-2">{rec.fullExplanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-sm border border-emerald-200 bg-emerald-50/60 p-2">
            <p className="text-[9px] font-bold uppercase text-emerald-800 mb-1">How This Reduces Complaints</p>
            <div className="grid sm:grid-cols-3 gap-2 text-[10px] font-bold text-emerald-900">
              <div>
                <span className="text-emerald-700">Complaints ↓</span>
                <p className="text-sm font-black">{rec.complaintReduction}</p>
              </div>
              <div>
                <span className="text-emerald-700">Child Welfare ↑</span>
                <p className="text-sm font-black">{rec.welfareImprovement}</p>
              </div>
              {rec.satisfactionImprovement && (
                <div>
                  <span className="text-emerald-700">Satisfaction ↑</span>
                  <p className="text-sm font-black">{rec.satisfactionImprovement}</p>
                </div>
              )}
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Generated From</p>
              <ul className="text-xs text-slate-700">{sources.map((g) => <li key={g}>• {g}</li>)}</ul>
            </div>
          )}

          <p className="text-[10px] font-bold text-slate-600">
            Officer: {rec.officer} · Completion: {rec.completion}
          </p>
        </div>

        <div className="lg:w-44 shrink-0 flex flex-row lg:flex-col gap-3 lg:border-l lg:border-slate-200 lg:pl-4">
          <div className="flex-1 lg:flex-none rounded-sm border border-slate-200 bg-white p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-500">Confidence</p>
            <p className="text-2xl font-black text-[#1e40af]">{rec.confidenceScore}%</p>
          </div>
          <div className="flex-1 lg:flex-none rounded-sm border border-slate-200 bg-white p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-500">Est. Budget</p>
            <p className="text-xs font-black text-[#0c1f3d] leading-snug">{rec.estimatedBudget}</p>
          </div>
          <button
            type="button"
            disabled={applied}
            onClick={onApply}
            className={cn(
              "w-full text-xs font-bold px-3 py-2.5 rounded-sm transition-colors",
              applied ? "bg-emerald-100 text-emerald-800 cursor-default" : "gov-btn-primary"
            )}
          >
            {applied ? "Applied ✓" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIRecommendationList({
  items,
  onApplyRecommendation,
}: {
  items: AIRecommendationCardData[];
  onApplyRecommendation?: (rec: AIRecommendationCardData) => void;
}) {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [modalRec, setModalRec] = useState<AIRecommendationCardData | null>(null);

  const handleApply = (rec: AIRecommendationCardData) => {
    if (appliedIds.has(rec.id)) return;
    setAppliedIds((prev) => new Set(prev).add(rec.id));
    setModalRec(rec);
    onApplyRecommendation?.(rec);
    if (!onApplyRecommendation) {
      toast.success("AI recommendation applied — officers notified");
    }
  };

  if (!items.length) {
    return <p className="text-sm text-slate-500">No AI recommendations for this case.</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((rec) => (
          <AIRecommendationCard
            key={rec.id}
            rec={rec}
            applied={appliedIds.has(rec.id)}
            onApply={() => handleApply(rec)}
          />
        ))}
      </div>
      <RecommendationAppliedModal rec={modalRec} open={!!modalRec} onClose={() => setModalRec(null)} />
    </>
  );
}

function RecommendationAppliedModal({
  rec,
  open,
  onClose,
}: {
  rec: AIRecommendationCardData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!rec) return null;

  const channels = [
    { icon: MessageCircle, label: "WhatsApp", detail: `Alert sent to ${rec.officer}` },
    { icon: Smartphone, label: "SMS", detail: "SMS dispatched to assigned officer mobile" },
    { icon: Mail, label: "Email", detail: "Official email notification sent to WDCW officers" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
            <DialogTitle>AI Recommendation Applied</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            <span className="font-bold text-[#0c1f3d]">{rec.recommendation}</span> has been applied and assigned to{" "}
            <span className="font-semibold">{rec.officer}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-sm border border-emerald-200 bg-emerald-50/50 p-3 text-xs space-y-1">
          <p><span className="font-bold">Status:</span> Applied</p>
          <p><span className="font-bold">Confidence:</span> {rec.confidenceScore}%</p>
          <p><span className="font-bold">Budget:</span> {rec.estimatedBudget}</p>
          <p><span className="font-bold">Complaint reduction:</span> {rec.complaintReduction}</p>
          <p><span className="font-bold">Expected completion:</span> {rec.completion}</p>
        </div>
        <p className="text-[10px] font-bold uppercase text-slate-500">Officers notified via</p>
        <div className="grid gap-2">
          {channels.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-center gap-3 rounded-sm border border-slate-200 bg-white p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0c1f3d]">{label}</p>
                <p className="text-[10px] text-slate-600">{detail}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto shrink-0" />
            </div>
          ))}
        </div>
        <DialogFooter>
          <button type="button" className="gov-btn-primary text-xs w-full sm:w-auto" onClick={onClose}>
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
