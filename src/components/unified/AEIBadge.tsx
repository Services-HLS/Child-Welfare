import { AnganwadiExcellenceIndex } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";

export function AEIBadge({ aei, link }: { aei: AnganwadiExcellenceIndex; link?: boolean }) {
  const inner = (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-xl px-3 py-2 border",
      aei.band === "green" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : aei.band === "orange" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-rose-50 border-rose-200 text-rose-900"
    )}>
      <Award className="h-4 w-4 shrink-0" />
      <div>
        <div className="text-[9px] font-black uppercase opacity-70">AEI</div>
        <div className="text-lg font-black leading-none">{aei.score}</div>
        <div className="text-[8px] font-bold uppercase">{aei.band} · {aei.band === "red" ? "intervention support" : aei.band === "orange" ? "improvement path" : "quality delivery"}</div>
      </div>
    </div>
  );
  if (link) return <Link to={`/center-score/${aei.centerId}`}>{inner}</Link>;
  return inner;
}
