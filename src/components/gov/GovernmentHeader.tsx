import { useApp } from "@/context/AppContext";
import { LangToggle } from "@/components/app/LangToggle";
import { SyncIndicator } from "@/components/app/SyncIndicator";
import { AccessibilityControls } from "./AccessibilityControls";
import { useTransparency } from "./TransparencyProvider";
import { GOV_BRAND, getEnvironmentLabel } from "@/lib/govBranding";
import { LogOut, UserCircle, FileSearch, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function GovernmentHeader({
  onMenuToggle,
  showMenu,
}: {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}) {
  const { user, logout, t, demoModeActive } = useApp();
  const { toggle } = useTransparency();
  const env = getEnvironmentLabel(demoModeActive);
  const district = user?.district ?? user?.centerName?.split(" ")[0] ?? "Andhra Pradesh";

  return (
    <header className="fixed top-0 z-50 w-full border-b-2 border-[#1e3a5f] bg-[#0F172A] text-white">
      <div className="gov-header-bar flex min-h-[3.25rem] flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-1.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showMenu && (
            <button type="button" onClick={onMenuToggle} className="lg:hidden p-1.5 rounded border border-white/15 hover:bg-white/5">
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#c9a227] bg-white text-[#0F172A] text-[8px] font-bold text-center leading-tight">
            AP<br />GOVT
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="text-[11px] font-semibold tracking-wide text-white/95 truncate">
              {GOV_BRAND.title} — {GOV_BRAND.department}
            </div>
            <div className="text-[10px] text-white/70 truncate">{GOV_BRAND.government}</div>
          </div>
          <div className="sm:hidden text-[11px] font-bold truncate">{GOV_BRAND.title}</div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 text-[10px]">
          <span className="hidden md:inline rounded border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 font-semibold uppercase text-amber-100">
            {env}
          </span>
          <span className="hidden lg:inline text-white/70 font-medium">District: <strong className="text-white">{district}</strong></span>
          <SyncIndicator />
          <LangToggle variant="gov" />
          <AccessibilityControls variant="header" />
          <button
            type="button"
            onClick={toggle}
            className="hidden sm:flex items-center gap-1 rounded border border-white/20 px-2 py-1 font-semibold hover:bg-white/10"
          >
            <FileSearch className="h-3.5 w-3.5" /> Transparency
          </button>
          {user && (
            <>
              <div className="hidden md:block text-right leading-tight">
                <div className="text-[11px] font-semibold">{user.name}</div>
                <div className="text-[10px] text-white/60 capitalize">{t(user.role as never)}</div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center border border-white/20 bg-white/5">
                <UserCircle className="h-5 w-5 text-white/70" />
              </div>
              <button type="button" onClick={logout} className={cn("p-1.5 rounded border border-white/15 hover:bg-red-950/40 hover:border-red-400/40")} title={t("logout")}>
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
