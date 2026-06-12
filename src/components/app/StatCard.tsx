import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Official government metric panel */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: number;
  accent?: "primary" | "success" | "warning" | "danger" | "accent";
}) {
  const borderAccent: Record<string, string> = {
    primary: "border-l-[#1e40af]",
    success: "border-l-emerald-700",
    warning: "border-l-amber-600",
    danger: "border-l-red-700",
    accent: "border-l-teal-700",
  };

  return (
    <div className={cn("border border-slate-200 bg-white border-l-4 p-4", borderAccent[accent])}>
      <div className="flex items-start justify-between gap-2">
        <Icon className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-[11px] font-semibold", trend >= 0 ? "text-emerald-800" : "text-red-700")}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-[#0F172A] tabular-nums leading-none">{value}</div>
      <div className="mt-1.5 text-xs font-semibold text-slate-800">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-slate-600 leading-snug">{sub}</div>}
    </div>
  );
}
