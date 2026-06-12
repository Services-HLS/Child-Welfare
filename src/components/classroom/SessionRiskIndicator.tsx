import { cn } from "@/lib/utils";

export function SessionRiskIndicator({
  level,
  flagged,
  tags,
}: {
  level: "low" | "medium" | "high";
  flagged?: boolean;
  tags?: string[];
}) {
  const color =
    level === "high" ? "bg-rose-50 text-rose-800 border-rose-200" : level === "medium" ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200";
  return (
    <div className={cn("border px-3 py-2 text-xs font-semibold", color)}>
      Risk: {level.toUpperCase()}
      {flagged && " · Flagged for review"}
      {tags && tags.length > 0 && (
        <ul className="mt-1 font-normal text-[11px] space-y-0.5">
          {tags.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
