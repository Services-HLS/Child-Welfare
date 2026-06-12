import { Link } from "react-router-dom";
import { GOV_BRAND } from "@/lib/govBranding";
import { LangToggle } from "@/components/app/LangToggle";

export function PublicGovHeader() {
  return (
    <header className="border-b-2 border-[#1e3a5f] bg-[#0F172A] text-white">
      <div className="w-full max-w-none flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border-2 border-[#c9a227] bg-white text-[#0F172A] text-[8px] font-bold text-center leading-tight">
            AP<br />GOVT
          </div>
          <div>
            <div className="text-sm font-semibold">{GOV_BRAND.title}</div>
            <div className="text-[11px] text-white/75">{GOV_BRAND.department}, {GOV_BRAND.government}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase border border-amber-500/40 px-2 py-0.5 text-amber-100">Public Portal</span>
          <LangToggle variant="gov" />
          <Link to="/" className="text-[11px] font-semibold border border-white/25 px-3 py-1.5 hover:bg-white/10">
            Official Login
          </Link>
        </div>
      </div>
    </header>
  );
}
