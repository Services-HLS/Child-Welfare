import { Link } from "react-router-dom";
import { PerformanceBand } from "@/types/session";
import { cn } from "@/lib/utils";

export function ClassroomSummaryCard({
  title,
  subtitle,
  opi,
  band,
  href,
  meta,
}: {
  title: string;
  subtitle?: string;
  opi: number;
  band: PerformanceBand;
  href?: string;
  meta?: string;
}) {
  const inner = (
    <div className={cn("border border-slate-200 bg-white p-3 hover:border-[#1e40af]/40 transition-colors", href && "cursor-pointer")}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="text-sm font-bold text-[#0F172A]">{title}</div>
          {subtitle && <div className="text-[10px] text-slate-500">{subtitle}</div>}
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-1.5 py-0.5",
            band === "green" ? "bg-emerald-100 text-emerald-800" : band === "orange" ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-800"
          )}
        >
          {band}
        </span>
      </div>
      <div className="mt-2 text-xl font-bold text-[#1e40af]">OPI {opi}%</div>
      {meta && <p className="text-[10px] text-slate-500 mt-1">{meta}</p>}
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}
