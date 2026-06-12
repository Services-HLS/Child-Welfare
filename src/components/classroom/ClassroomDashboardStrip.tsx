import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";

export function ClassroomDashboardStrip({
  title,
  opi,
  band,
  href,
  detail,
}: {
  title: string;
  opi: number;
  band: string;
  href: string;
  detail?: string;
}) {
  return (
    <Link
      to={href}
      className="block border border-slate-200 bg-white p-4 border-l-4 border-l-[#1e40af] hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#1e40af]" />
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
            <p className="text-lg font-bold text-[#0F172A]">
              OPI {opi}% · <span className="capitalize">{band}</span>
            </p>
            {detail && <p className="text-[10px] text-slate-500">{detail}</p>}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-[#1e40af]" />
      </div>
    </Link>
  );
}
