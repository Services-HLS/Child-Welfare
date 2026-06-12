import { useApp } from "@/context/AppContext";
import { useTransparency } from "./TransparencyProvider";
import { X, Database, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function TransparencyDrawer() {
  const { open, setOpen } = useTransparency();
  const { lastSync, online, demoModeActive } = useApp();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden />
      <aside className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-white border-l border-slate-300 shadow-lg flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Transparency & Accountability</h2>
            <p className="text-[11px] text-slate-600">Data sources and AI usage (plain language)</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-1 rounded border border-slate-200 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-slate-700">
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2"><Database className="h-4 w-4" /> Data source</h3>
            <p>Operational records from Anganwadi centers, beneficiary feedback channels, session recordings, and grievance registers stored in secure local/offline databases with sync to state systems.</p>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2"><Clock className="h-4 w-4" /> Last synchronization</h3>
            <p className={cn(online ? "text-emerald-800" : "text-amber-800")}>
              {online ? "Connected" : "Offline mode"} — {lastSync ? format(new Date(lastSync), "PPpp") : "Pending first sync"}
            </p>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4" /> AI recommendations</h3>
            <p>AI provides <strong>Service Insights</strong> and <strong>Suggested Improvements</strong> to support coaching and service quality. Scores are not punitive rankings.</p>
            <ul className="list-disc pl-5 mt-2 text-xs space-y-1">
              <li>Session observation explains engagement and syllabus coverage</li>
              <li>Grievance routing shows confidence and SLA thresholds</li>
              <li>AEI/SQI/CWI use published weights with supportive guidance</li>
            </ul>
          </section>
          <section className="rounded border border-teal-200 bg-teal-50/80 p-4">
            <h3 className="text-xs font-bold uppercase text-teal-900 flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4" /> Service commitment</h3>
            <p className="text-xs leading-relaxed">This platform supports operational improvement, beneficiary trust, and workforce development — not punitive evaluation of workers or parents.</p>
          </section>
          {demoModeActive && (
            <p className="text-[10px] font-semibold uppercase text-amber-800 border border-amber-200 bg-amber-50 p-2 rounded">Pilot environment — sample data may be displayed</p>
          )}
        </div>
      </aside>
    </>
  );
}
