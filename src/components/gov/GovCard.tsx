import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Official panel — flat border, minimal shadow */
export function GovCard({
  children,
  title,
  subtitle,
  className,
  headerAction,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
}) {
  return (
    <section className={cn("border border-slate-200 bg-white", className)}>
      {(title || headerAction) && (
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <div>
            {title && <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
