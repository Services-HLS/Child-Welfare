import { useApp } from "@/context/AppContext";
import { mockAlerts } from "@/data/mockData";
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  ArrowRight, 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  Forward,
  MoreVertical,
  Filter,
  Search,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminAlerts() {
  const { t } = useApp();
  
  const handleAction = (id: string, action: string) => {
    toast.success(`Action Logged: ${action}`, {
      description: `Reference ID: ${id}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Alerts & Escalations</h1>
          <p className="text-sm font-medium text-slate-500">Critical Priority Issues Escalated to District Administration</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all uppercase tracking-widest">
            <CheckCircle2 className="h-4 w-4" /> Bulk Resolve
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by center, mandal or issue type..." 
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "Critical", "Escalated"].map((s) => (
            <button
              key={s}
              className={cn(
                "rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border",
                s === "All" ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
          <div className="h-6 w-px bg-slate-200 mx-1 dark:bg-slate-800" />
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {mockAlerts.filter(a => a.severity === "high").map((alert) => (
          <div 
            key={alert.id} 
            className="group relative overflow-hidden rounded-lg border border-red-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-red-900/30 dark:bg-slate-900"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-600 text-white">
                      Critical
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">{alert.type.replace("-", " ")}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(alert.time), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">
                    {alert.message}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    <Building2 className="h-3.5 w-3.5" /> {alert.centerName} · ID: {alert.centerId}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                <button 
                  onClick={() => handleAction(alert.id, "Assign to Supervisor")}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Assign
                </button>
                <button 
                  onClick={() => handleAction(alert.id, "Forward to State Office")}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <Forward className="h-3.5 w-3.5" /> Forward
                </button>
                <button 
                  onClick={() => handleAction(alert.id, "District Review")}
                  className="rounded-md bg-primary px-4 py-2 text-[10px] font-black text-white shadow-sm hover:opacity-90 transition-all uppercase tracking-widest flex items-center gap-2"
                >
                  Action <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-md bg-slate-50/50 p-3 border border-slate-100 dark:bg-slate-800/20 dark:border-slate-800">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              <div className="text-[11px] font-medium text-slate-500">
                <span className="font-bold text-slate-900 dark:text-slate-300">ADMIN CONTEXT:</span> Repeated violations detected. Escalation protocol active.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
