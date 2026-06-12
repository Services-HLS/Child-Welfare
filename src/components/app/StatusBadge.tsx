import { CheckCircle2, AlertTriangle, XCircle, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "approved" | "submitted" | "issue" | "pending";

const map: Record<Status, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", Icon: CheckCircle2 },
  submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800", Icon: FileText },
  issue: { label: "Issue", cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800", Icon: XCircle },
  pending: { label: "Pending Upload", cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700", Icon: Clock },
};

export function StatusBadge({ status, confidence, className, showConfidence = true }: { status: Status; confidence?: number; className?: string; showConfidence?: boolean }) {
  const { label, cls, Icon } = map[status] || map.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", cls, className)}>
      <Icon className="h-3 w-3" />
      {label}
      {showConfidence && confidence !== undefined && status === "approved" && <span className="opacity-70 ml-1">{(confidence * 100).toFixed(0)}%</span>}
    </span>
  );
}