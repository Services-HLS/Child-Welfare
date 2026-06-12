import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { normalizeRole } from "@/lib/rolePaths";
import { GOV_NAV, GovNavItem } from "@/lib/govNav";
import { GovernmentHeader } from "@/components/gov/GovernmentHeader";
import { GovernmentPageFrame } from "@/components/gov/GovernmentPageFrame";
import { TransparencyProvider } from "@/components/gov/TransparencyProvider";
import { TransparencyDrawer } from "@/components/gov/TransparencyDrawer";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TKey } from "@/lib/i18n";
import { WorkerFlowProvider } from "@/context/worker/WorkerFlowContext";
import { TrainingProgressProvider } from "@/context/worker/TrainingProgressContext";

const SIDEBAR_BG = "bg-[#0F172A]";
const SIDEBAR_BORDER = "border-white/10";

function SidebarNavLink({
  item,
  label,
  description,
  collapsed,
  onNavigate,
}: {
  item: GovNavItem;
  label: string;
  description?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { to, icon: Icon } = item;
  const end = to.split("/").filter(Boolean).length <= 2;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 overflow-hidden",
          isActive
            ? "bg-blue-600/15 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-0 h-full w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-in slide-in-from-left duration-300"
              aria-hidden
            />
          )}
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-all duration-300",
              isActive ? "text-blue-400 scale-110" : "text-slate-500 group-hover:text-white group-hover:scale-105"
            )}
          />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate transition-all duration-300",
                  isActive ? "font-bold tracking-tight" : "font-medium"
                )}
              >
                {label}
              </span>
              {description && (
                <span className="block truncate text-[10px] font-normal text-slate-500 group-hover:text-slate-400 leading-tight mt-0.5">
                  {description}
                </span>
              )}
            </span>
          )}
          {isActive && !collapsed && (
            <span
              className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)] animate-pulse"
              aria-hidden
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarNav({
  sections,
  t,
  collapsed,
  onItemClick,
}: {
  sections: typeof GOV_NAV.beneficiary;
  t: (k: TKey) => string;
  collapsed?: boolean;
  onItemClick?: () => void;
}) {
  return (
    <nav className={cn("space-y-4", collapsed ? "px-2" : "px-3")}>
      {sections.map((sec) => (
        <div key={sec.sectionKey}>
          {!collapsed && (
            <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/10 pb-1.5">
              {t(sec.sectionKey as TKey)}
            </div>
          )}
          <div className="space-y-0.5">
            {sec.items.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                label={t(item.labelKey as TKey)}
                description={item.descriptionKey ? t(item.descriptionKey as TKey) : undefined}
                collapsed={collapsed}
                onNavigate={onItemClick}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, t } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;
  const role = normalizeRole(user.role);
  const sections = GOV_NAV[role] ?? [];

  return (
    <TransparencyProvider>
      <div className="min-h-screen bg-[#f4f6f8] gov-shell">
        <GovernmentHeader onMenuToggle={() => setIsMobileMenuOpen((o) => !o)} showMenu />
        <TransparencyDrawer />

        <div className="flex pt-[3.25rem]">
          {/* Desktop sidebar — same navy as header */}
          <aside
            className={cn(
              "fixed left-0 top-[3.25rem] z-40 hidden h-[calc(100vh-3.25rem)] lg:block transition-all duration-300 shadow-md",
              SIDEBAR_BG,
              SIDEBAR_BORDER,
              "border-r",
              isCollapsed ? "w-16" : "w-64"
            )}
          >
            <div className="flex h-full flex-col py-4 overflow-y-auto">
              <SidebarNav sections={sections} t={t} collapsed={isCollapsed} />
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "mx-2 mt-auto flex items-center justify-center rounded-md border py-2 transition-all duration-300",
                  "border-white/10 text-slate-500 hover:bg-white/5 hover:text-white",
                  isCollapsed ? "px-2" : "gap-2 px-3"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          <main
            id="app-main-content"
            className={cn(
              "flex-1 min-h-[calc(100vh-3.25rem)] transition-all duration-300",
              "lg:ml-64",
              isCollapsed && "lg:ml-16",
              "pb-20 lg:pb-8",
              role === "worker" && "bg-[#eef2f6]"
            )}
          >
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
              <GovernmentPageFrame hideBreadcrumb={role === "worker"}>
                {role === "worker" ? (
                  <WorkerFlowProvider>
                    <TrainingProgressProvider>{children}</TrainingProgressProvider>
                  </WorkerFlowProvider>
                ) : (
                  children
                )}
              </GovernmentPageFrame>
            </div>
          </main>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[55] w-72 transition-transform duration-300 ease-in-out lg:hidden pt-[3.25rem]",
            SIDEBAR_BG,
            SIDEBAR_BORDER,
            "border-r shadow-xl",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className={cn("flex justify-end p-2 border-b", SIDEBAR_BORDER)}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-4rem)] py-2">
            <SidebarNav sections={sections} t={t} onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </aside>

        {(role === "worker" || role === "beneficiary") && (
          <nav
            className={cn(
              "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
              SIDEBAR_BG,
              "border-t-2",
              SIDEBAR_BORDER
            )}
          >
            <div className="flex justify-around px-1 py-1.5">
              {sections[0]?.items.slice(0, 5).map(({ to, labelKey, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to.split("/").filter(Boolean).length <= 2}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all duration-300",
                      isActive
                        ? "text-blue-400 scale-105 bg-blue-600/20"
                        : "text-slate-500 hover:text-white"
                    )
                  }
                >
                  <Icon className={cn("h-5 w-5 transition-transform duration-300")} />
                  <span className="text-[9px] font-bold uppercase tracking-wider max-w-[4rem] truncate">
                    {t(labelKey as TKey).split(" ")[0]}
                  </span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </TransparencyProvider>
  );
}
