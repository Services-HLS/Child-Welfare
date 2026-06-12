import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  MoreVertical, 
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  TrendingUp,
  Star,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";

export default function AdminWorkers() {
  const { t } = useApp();
  const [search, setSearch] = useState("");

  // Extract unique workers from mockCenters
  const workers = mockCenters.map(c => ({
    id: `W-${c.id}`,
    name: c.worker,
    center: c.name,
    mandal: c.mandal,
    attendance: Math.floor(Math.random() * 20) + 80,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    status: Math.random() > 0.1 ? "active" : "on-leave"
  })).filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.center.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Staff Directory</h1>
          <p className="text-sm font-medium text-slate-500">Official Personnel Records & Performance Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all uppercase tracking-widest">
            <UserPlus className="h-4 w-4" /> Register Staff
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          label="Total Staff" 
          value={workers.length} 
          icon={Users} 
          accent="primary"
          sub="Krishna District Pool"
        />
        <StatCard 
          label="Avg. Attendance" 
          value="89.2%" 
          icon={Activity} 
          trend={2.1}
          accent="success"
        />
        <StatCard 
          label="High Performers" 
          value="24" 
          icon={Star} 
          accent="warning"
          sub="Rating above 4.5"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Staff Name, Center or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((worker) => (
          <div 
            key={worker.id}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400 font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all dark:bg-slate-800">
                {worker.name.charAt(0)}
              </div>
              <div className="flex flex-col items-end">
                 <div className={cn(
                  "rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                  worker.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {worker.status}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-black text-slate-900 dark:text-white">{worker.rating}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase group-hover:text-primary transition-colors">{worker.name}</h3>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-4">PERSONNEL ID: {worker.id}</div>
              
              <div className="space-y-2 border-t border-slate-50 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {worker.center}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {worker.mandal} Sector
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <Activity className="h-3.5 w-3.5 text-slate-400" /> ATTENDANCE: <span className="font-bold text-slate-900 dark:text-white">{worker.attendance}%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                  <Phone className="h-3 w-3" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                  <Mail className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:border-slate-800">
                  Profile <ExternalLink className="h-2.5 w-2.5" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workers.length === 0 && (
        <div className="py-20 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
          <Users className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-800" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">No staff records found</p>
        </div>
      )}
    </div>
  );
}