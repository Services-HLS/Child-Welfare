import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExecutiveReportShell({
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="exec-report min-h-screen bg-[#f0f2f5]">
      <div className="exec-report-tricolor h-1 flex" aria-hidden>
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>
      <header className="exec-report-header bg-[#0c1f3d] text-white px-4 sm:px-8 py-6 border-b-4 border-[#c9a227]">
        <div className="max-w-6xl mx-auto">
          {badge && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227] mb-2">{badge}</p>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-300 mt-1 max-w-3xl">{subtitle}</p>}
          <p className="text-[10px] text-slate-400 mt-3">Government of Andhra Pradesh · WDCW · AI Intelligence Platform · Confidential — Official Use</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">{children}</main>
      {footer && (
        <footer className="max-w-6xl mx-auto px-4 sm:px-8 py-4 border-t border-slate-300 text-[10px] text-slate-500">
          {footer}
        </footer>
      )}
    </div>
  );
}

export function ExecutiveSection({
  title,
  number,
  children,
  variant = "default",
}: {
  title: string;
  number?: number;
  children: ReactNode;
  variant?: "default" | "highlight" | "warning";
}) {
  return (
    <section
      className={cn(
        "exec-section rounded-sm border shadow-sm overflow-hidden",
        variant === "highlight" && "border-[#1e40af] bg-white",
        variant === "warning" && "border-amber-400 bg-amber-50/30",
        variant === "default" && "border-slate-300 bg-white"
      )}
    >
      <div className="exec-section-head bg-[#1e3a5f] text-white px-4 py-2.5 flex items-center gap-3">
        {number != null && (
          <span className="h-6 w-6 rounded-sm bg-[#c9a227] text-[#0c1f3d] text-xs font-black flex items-center justify-center shrink-0">
            {number}
          </span>
        )}
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function ExecutiveKpiGrid({ items }: { items: { label: string; value: string | number; tone?: "good" | "warn" | "danger" | "neutral" }[] }) {
  const tones = {
    good: "border-emerald-300 bg-emerald-50 text-emerald-900",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    danger: "border-rose-300 bg-rose-50 text-rose-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-900",
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className={cn("rounded-sm border-2 p-3 text-center", tones[item.tone ?? "neutral"])}>
          <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">{item.label}</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ExecutiveGauge({
  label,
  value,
  max = 100,
  tone = "blue",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: "blue" | "amber" | "rose" | "emerald";
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { blue: "bg-[#1e40af]", amber: "bg-amber-500", rose: "bg-rose-600", emerald: "bg-emerald-600" };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span className="text-slate-600">{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 bg-slate-200 rounded-sm overflow-hidden border border-slate-300">
        <div className={cn("h-full transition-all", colors[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ExecutiveExplainPanel({ block }: { block: { title: string; inputData: string[]; processing: string; reasoning: string; evidenceUsed: string[]; confidence: number; supportingFactors: string[]; expectedImpact: string } }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Input Data</p>
          <ul className="text-xs space-y-0.5">{block.inputData.map((d) => <li key={d}>• {d}</li>)}</ul>
        </div>
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">AI Processing</p>
          <p className="text-xs">{block.processing}</p>
        </div>
      </div>
      <div className="rounded-sm border-l-4 border-[#1e40af] bg-blue-50/50 p-3">
        <p className="text-[9px] font-bold uppercase text-[#1e40af] mb-1">Reasoning</p>
        <p className="text-xs leading-relaxed">{block.reasoning}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <div><span className="font-bold">Confidence:</span> {Math.round(block.confidence * 100)}%</div>
        <div><span className="font-bold">Evidence:</span> {block.evidenceUsed.length} sources</div>
        <div><span className="font-bold">Impact:</span> {block.expectedImpact}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {block.supportingFactors.map((f) => (
          <span key={f} className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#1e3a5f] text-white">{f}</span>
        ))}
      </div>
    </div>
  );
}

import { InvestigationRecommendation } from "@/types/investigation";
import { AIRecommendationList, mapInvestigationRecommendation } from "./AIRecommendationCard";

export function ExecutiveRecommendationCard({ rec }: { rec: InvestigationRecommendation }) {
  return (
    <AIRecommendationList items={[mapInvestigationRecommendation(rec)]} />
  );
}

export function ExecutiveBarChart({ data, color = "#1e40af" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32 pt-4">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
            <div className="w-full max-w-[40px] rounded-t-sm" style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: d.value ? 4 : 0 }} />
          </div>
          <span className="text-[8px] font-bold text-slate-500 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ExecutivePieLegend({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = ["#1e40af", "#c9a227", "#138808", "#dc2626", "#7c3aed"];
  return (
    <div className="space-y--2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2 text-xs">
          <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
          <span className="flex-1 font-medium">{d.label}</span>
          <span className="font-bold">{Math.round((d.value / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export function ExecutiveHeatmap({ data }: { data: { row: string; col: string; value: number }[] }) {
  const rows = [...new Set(data.map((d) => d.row))];
  const cols = [...new Set(data.map((d) => d.col))];
  const max = Math.max(...data.map((d) => d.value), 1);
  const get = (row: string, col: string) => data.find((d) => d.row === row && d.col === col)?.value ?? 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-left font-bold text-slate-500" />
            {cols.map((c) => <th key={c} className="p-1 font-bold text-slate-600">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="p-1 font-bold text-slate-700">{row}</td>
              {cols.map((col) => {
                const v = get(row, col);
                const intensity = v / max;
                return (
                  <td key={col} className="p-1 text-center font-bold text-white" style={{ backgroundColor: `rgba(30, 64, 175, ${0.15 + intensity * 0.85})` }}>
                    {v || "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CitizenTimeline({ currentStep }: { currentStep: number }) {
  const steps = ["Citizen Submitted", "AI Verification", "Supervisor Assigned", "Investigation", "Corrective Action", "Resolution Proposed", "Citizen Confirmation", "Closed"];
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("h-4 w-4 rounded-full border-2 shrink-0", i <= currentStep ? "bg-emerald-600 border-emerald-700" : "bg-white border-slate-300")} />
            {i < steps.length - 1 && <div className={cn("w-0.5 h-8", i < currentStep ? "bg-emerald-500" : "bg-slate-200")} />}
          </div>
          <div className="pb-4">
            <p className={cn("text-xs font-bold", i <= currentStep ? "text-emerald-800" : "text-slate-400")}>{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
