import { PerformanceBand } from "@/types/session";
import { cn } from "@/lib/utils";

const LABELS: Record<PerformanceBand, string> = {
  green: "Strong support level",
  orange: "Growing support level",
  red: "Extra support available",
};

export function SupportLevelBadge({ band }: { band: PerformanceBand }) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-bold uppercase px-3 py-1.5 border-2",
        band === "green" && "bg-emerald-50 text-emerald-900 border-emerald-400",
        band === "orange" && "bg-amber-50 text-amber-900 border-amber-400",
        band === "red" && "bg-sky-50 text-sky-900 border-sky-400"
      )}
    >
      {LABELS[band]}
    </span>
  );
}
