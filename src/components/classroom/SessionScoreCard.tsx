import { ClassroomAnalyticsIndices } from "@/types/classroom-intelligence";
import { PerformanceBand } from "@/types/session";
import { cn } from "@/lib/utils";

const labels: { key: keyof ClassroomAnalyticsIndices; label: string }[] = [
  { key: "opi", label: "OPI" },
  { key: "tei", label: "TEI" },
  { key: "cei", label: "CEI" },
  { key: "cqi", label: "CQI" },
  { key: "sai", label: "SAI" },
  { key: "ccs", label: "CCS" },
  { key: "ips", label: "IPS" },
];

export function SessionScoreCard({
  indices,
  band,
  compact,
}: {
  indices: ClassroomAnalyticsIndices;
  band: PerformanceBand;
  compact?: boolean;
}) {
  const bandColor =
    band === "green" ? "border-l-emerald-600" : band === "orange" ? "border-l-amber-500" : "border-l-rose-600";
  return (
    <div className={cn("border border-slate-200 bg-white border-l-4", bandColor, compact ? "p-3" : "p-4")}>
      <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4")}>
        {labels.map(({ key, label }) => (
          <div key={key}>
            <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
            <div className="text-lg font-bold text-[#0F172A]">{indices[key]}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
