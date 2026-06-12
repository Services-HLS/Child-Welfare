import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useTransparency } from "./TransparencyProvider";
import { ROUTE_META } from "@/lib/govNav";
import { format } from "date-fns";
import { ChevronRight, Download, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export function GovernmentPageFrame({
  children,
  title,
  description,
  hideBreadcrumb,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  hideBreadcrumb?: boolean;
}) {
  const { pathname } = useLocation();
  const { t, lastSync } = useApp();
  const { toggle } = useTransparency();
  const meta = ROUTE_META[pathname];
  const pageTitle = title ?? (meta ? t(meta.titleKey as never) : "");
  const pageDesc = description ?? (meta ? t(meta.descKey as never) : "");

  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="space-y-4">
      {!hideBreadcrumb && crumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#1e40af] font-medium">Home</Link>
          {crumbs.map((seg, i) => {
            const path = "/" + crumbs.slice(0, i + 1).join("/");
            const isLast = i === crumbs.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-slate-400" />
                {isLast ? (
                  <span className="font-semibold text-[#0F172A] capitalize">{seg.replace(/-/g, " ")}</span>
                ) : (
                  <Link to={path} className="hover:text-[#1e40af] capitalize">{seg.replace(/-/g, " ")}</Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {(pageTitle || pageDesc) && (
        <div className="gov-page-header border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">{pageTitle}</h1>
              {pageDesc && <p className="text-sm text-slate-600 mt-1 max-w-none">{pageDesc}</p>}
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Last updated: {format(new Date(), "PPpp")}
                {lastSync && <> · Synced {format(new Date(lastSync), "p")}</>}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={toggle} className="gov-btn-outline text-[10px] py-1.5 px-3 flex items-center gap-1">
                <FileSearch className="h-3.5 w-3.5" /> Transparency
              </button>
              <button type="button" onClick={() => window.print()} className="gov-btn-outline text-[10px] py-1.5 px-3 flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Export / Print
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={cn("gov-page-body")}>{children}</div>
    </div>
  );
}
