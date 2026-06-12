import { ReactNode } from "react";

export function PublicPageHeader({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-l-4 border-[#1e3a5f] bg-gradient-to-r from-slate-50 to-white rounded-r-xl p-4 mb-5">
      {badge && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e40af] mb-1">{badge}</p>
      )}
      <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{title}</h1>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}

/** @deprecated Use PublicPageHeader */
export const ParentPageHeader = PublicPageHeader;

export function GovPublicChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral" | "pending";
}) {
  const tones = {
    good: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    pending: "bg-slate-50 border-slate-200 text-slate-700",
    neutral: "bg-blue-50 border-blue-200 text-blue-900",
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${tones[tone]}`}>
      <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

/** @deprecated Use GovPublicChip */
export const GovParentChip = GovPublicChip;
