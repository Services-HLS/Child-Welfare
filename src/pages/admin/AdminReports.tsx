import { useApp } from "@/context/AppContext";
import { 
  ClipboardList, 
  Download, 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  Building2, 
  Search, 
  Filter, 
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  PieChart as PieIcon,
  CheckCircle2,
  Printer,
  Share2,
  MoreVertical,
  AlertCircle,
  Maximize2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function GovReportHeader({ period }: { period: string }) {
  return (
    <div className="border-2 border-[#1e3a5f] bg-white p-5 mb-6 print:block">
      <div className="text-center border-b border-slate-200 pb-3 mb-3">
        <div className="text-xs font-semibold text-slate-600">Women Development and Child Welfare Department</div>
        <div className="text-sm font-bold text-[#0F172A]">Government of Andhra Pradesh</div>
        <div className="text-lg font-bold mt-1">AnganSakti 360 — Official Report</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
        <div><span className="font-semibold">Reporting period:</span> {period}</div>
        <div><span className="font-semibold">Generated:</span> {new Date().toLocaleString()}</div>
        <div><span className="font-semibold">Approval:</span> _________________ (CDPO / Director)</div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const { t } = useApp();

  const handleDownload = (type: string) => {
    toast.success(`${type} Report generating...`, {
      description: "Ready for official download shortly."
    });
  };

  const reportCards = [
    { title: "District Compliance Monthly", date: "Apr 2024", type: "Analytical", status: "Ready" },
    { title: "Attendance Aggregate Weekly", date: "Week 16, 2024", type: "Operational", status: "Ready" },
    { title: "Nutrition Distribution Log", date: "15 Apr - 22 Apr", type: "Inventory", status: "Draft" },
    { title: "Worker Performance Audit", date: "Q1 2024", type: "Personnel", status: "Archived" },
  ];

  return (
    <div className="space-y-6">
      <GovReportHeader period="April 2024 · Pilot" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Reports & Records</h1>
          <p className="text-sm font-medium text-slate-500">Official District-wide Documentation & Analytical Exports</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
             Schedule Automation
          </button>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all uppercase tracking-widest">
            <Plus className="h-4 w-4" /> New Audit Report
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Generation Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Official Exports
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Daily Operational Brief", desc: "Today's district activities and attendance.", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Mandal Performance Matrix", desc: "Comparative analytical matrix of all sectors.", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
                { title: "Violation Audit Log", desc: "Full list of non-compliant centers.", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
                { title: "Child Nutrition Summary", desc: "Distribution logs and inventory balance.", icon: PieIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((report, idx) => (
                <div key={idx} className="flex flex-col justify-between rounded-md border border-slate-100 p-4 transition-all hover:border-primary/20 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30">
                  <div>
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-3", report.bg, report.color)}>
                      <report.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{report.title}</h3>
                    <p className="mt-1 text-[10px] font-medium text-slate-500 leading-normal">{report.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FORMAT: PDF/XLS</span>
                    <button onClick={() => handleDownload(report.title)} className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">Recent Documents Cache</h2>
            <div className="space-y-2">
              {reportCards.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md border border-slate-50 bg-slate-50/30 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-white border border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate max-w-[200px]">{report.title}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{report.type} · {report.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest",
                      report.status === "Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                      report.status === "Draft" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-400"
                    )}>
                      {report.status}
                    </span>
                    <button className="h-7 w-7 rounded flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-7 w-7 rounded flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview Column */}
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Document Preview</h3>
              <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="aspect-[3/4.2] rounded-md bg-slate-50 border border-dashed border-slate-200 p-4 relative overflow-hidden group dark:bg-slate-950 dark:border-slate-800">
              <div className="space-y-4 opacity-30 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0">
                <div className="h-6 w-3/4 rounded bg-slate-200 mb-6 dark:bg-slate-800" />
                <div className="grid grid-cols-3 gap-1.5">
                   <div className="h-12 rounded bg-blue-100 dark:bg-blue-900/30" />
                   <div className="h-12 rounded bg-emerald-100 dark:bg-emerald-900/30" />
                   <div className="h-12 rounded bg-amber-100 dark:bg-amber-900/30" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-1.5 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-24 rounded border border-slate-100 mt-4 bg-white/50 dark:bg-slate-900/50 dark:border-slate-800" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] group-hover:opacity-0 transition-opacity dark:bg-slate-900/40">
                <button className="rounded bg-primary px-5 py-2 text-[10px] font-black text-white shadow-sm uppercase tracking-widest">
                  Preview Official Doc
                </button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-md border border-slate-200 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:opacity-90">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">GOVERNANCE PROTOCOL</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Report generation is currently <span className="font-bold text-slate-900 dark:text-slate-200 italic underline">Verified</span>. All exports are logged with administrative timestamps for audit compliance.
            </p>
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Digital Sign Active</span>
               </div>
               <Info className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
