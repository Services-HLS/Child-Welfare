import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LangToggle } from "@/components/app/LangToggle";
import { format } from "date-fns";
import { Wifi, WifiOff, RefreshCw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkerFieldLayout({
  children,
  title,
  subtitle,
  hideStatus,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideStatus?: boolean;
}) {
  const { user, online, lastSync, t } = useApp();
  if (!user) return null;

  const childrenCount = user.children?.length ?? 24;

  return (
    <div className="worker-field worker-page w-full pb-24 lg:pb-8">
      {!hideStatus && (
        <div className="worker-field-status border-b-2 border-[#1e3a5f] bg-[#0F172A] text-white px-4 py-2.5 mb-4 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-amber-200/90">WDCW · Andhra Pradesh</p>
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[11px] text-white/80 truncate">{user.centerName} · {user.district ?? "Tirupati"}</p>
            </div>
            <LangToggle variant="light" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
            <span className="bg-white/10 px-2 py-0.5 rounded-sm">{format(new Date(), "EEE, d MMM yyyy")}</span>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-sm", online ? "bg-emerald-600/30" : "bg-amber-600/30")}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? t("online") : t("offline")}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-sm">
              <RefreshCw className="h-3 w-3" />
              {format(lastSync, "HH:mm")}
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded-sm">{childrenCount} children</span>
          </div>
        </div>
      )}

      <header className="mb-4">
        <h1 className="text-xl font-bold text-[#0F172A] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 mt-1 leading-snug">{subtitle}</p>}
      </header>

      {children}

      <Link
        to="/worker/help-support"
        className="fixed bottom-20 right-4 lg:bottom-6 z-30 h-12 w-12 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center shadow-lg border-2 border-white"
        aria-label="Help and voice support"
      >
        <Volume2 className="h-5 w-5" />
      </Link>
    </div>
  );
}

export function WorkerSummaryCard({
  label,
  value,
  hint,
  href,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: "blue" | "green" | "amber" | "rose" | "slate";
}) {
  const border =
    accent === "green"
      ? "border-l-emerald-600"
      : accent === "amber"
        ? "border-l-amber-500"
        : accent === "rose"
          ? "border-l-rose-500"
          : accent === "slate"
            ? "border-l-slate-500"
            : "border-l-[#1e40af]";
  const inner = (
    <div className={cn("worker-card border border-slate-200 bg-white p-3 border-l-4", border)}>
      <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
      <div className="text-xl font-bold text-[#0F172A] mt-0.5">{value}</div>
      {hint && <div className="text-[10px] text-slate-500 mt-1">{hint}</div>}
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

export function WorkerQuickBtn({
  label,
  href,
  icon: Icon,
  primary,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 min-h-[4.5rem] text-center text-[11px] font-bold uppercase leading-tight border-2 transition-colors active:scale-[0.98]",
        primary
          ? "bg-[#1e3a5f] text-white border-[#0f2744]"
          : "bg-white text-[#0F172A] border-slate-300 hover:bg-slate-50"
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
