import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Building2,
  User,
  Download,
  Info,
  ExternalLink,
  Activity,
  MoreVertical,
  FileText,
  Phone,
  Mail,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
import { toast } from "sonner";

export default function AdminCompliance() {
  const { t } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const centers = mockCenters
    .filter(c => filter === "all" || (filter === "non-compliant" && c.compliance < 75) || (filter === "compliant" && c.compliance >= 90))
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mandal.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    toast.promise(new Promise((res) => setTimeout(res, 2000)), {
      loading: "Generating Compliance Matrix...",
      success: "Matrix Exported Successfully",
      error: "Export Failed"
    });
  };

  const handleInfo = (center: any) => {
    toast.info(`Center Intelligence: ${center.name}`, {
      description: `Compliance: ${center.compliance}%. Last audit completed by Supervisor on ${format(new Date(), "MMM dd")}.`,
      action: {
        label: "Full Audit",
        onClick: () => console.log("Full Audit View")
      }
    });
  };

  const handleMoreActions = (center: any) => {
    toast(`Governance Actions: ${center.id}`, {
      description: "Direct personnel communication and report generation enabled.",
      action: {
        label: "Contact Worker",
        onClick: () => toast.success(`Calling ${center.worker}...`)
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Compliance Monitoring</h1>
          <p className="text-sm font-medium text-slate-500">Center-wise Governance & Official Performance Tracking</p>
        </div>
        <button onClick={handleExport} className="btn-primary h-9 px-4 text-[10px]">
          <Download className="h-4 w-4" /> Export Compliance Matrix
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          label="Average Compliance" 
          value="92%" 
          icon={Activity} 
          trend={4.2}
          accent="success"
        />
        <StatCard 
          label="Low-Performing Centers" 
          value="12" 
          icon={AlertCircle} 
          trend={-1.5}
          accent="danger"
        />
        <StatCard 
          label="Verification Rate" 
          value="98.4%" 
          icon={ShieldCheck} 
          trend={2.1}
          accent="primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Center ID or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "compliant", "non-compliant"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border",
                filter === s
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
              )}
            >
              {s}
            </button>
          ))}
          <div className="h-6 w-px bg-slate-200 mx-2 dark:bg-slate-800" />
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-zebra">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3">Center Details</th>
                <th className="px-6 py-3">Mandal / Sector</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Worker Info</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {centers.map((center) => (
                <tr key={center.id} className="group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white transition-all dark:bg-slate-800">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">{center.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{center.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{center.mandal}</div>
                    <div className="text-[10px] font-medium text-slate-500">{center.district} District</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-[120px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            center.compliance >= 90 ? "text-emerald-600" : center.compliance >= 75 ? "text-amber-600" : "text-red-600"
                          )}>
                            {center.compliance >= 90 ? "Excellent" : center.compliance >= 75 ? "Moderate" : "Action"}
                          </span>
                          <span className="text-[10px] font-black">{center.compliance}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000",
                              center.compliance >= 90 ? "bg-emerald-500" : center.compliance >= 75 ? "bg-amber-500" : "bg-red-500"
                            )} 
                            style={{ width: `${center.compliance}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <User className="h-3 w-3 text-slate-400" /> {center.worker}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">+91 98765 432XX</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleInfo(center)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all dark:bg-slate-800"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleMoreActions(center)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all dark:bg-slate-800"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {centers.length === 0 && (
          <div className="py-20 text-center bg-slate-50/30 dark:bg-slate-900/30">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-800" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">No matching centers found</p>
          </div>
        )}
      </div>
    </div>
  );
}

const format = (date: Date, fmt: string) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};
