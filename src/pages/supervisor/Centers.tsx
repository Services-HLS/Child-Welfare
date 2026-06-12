import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Centers() {
  const { t } = useApp();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const district = "Tirupati";
  const filteredCenters = mockCenters
    .filter(c => c.district === district)
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mandal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Center Management</h1>
          <p className="text-sm font-medium text-slate-500">Overseeing {filteredCenters.length} Anganwadi Centers in {district} District</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button 
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded transition", view === "grid" ? "bg-slate-100 text-primary dark:bg-slate-800" : "text-slate-400")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded transition", view === "list" ? "bg-slate-100 text-primary dark:bg-slate-800" : "text-slate-400")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all uppercase tracking-widest">
            Register New Center
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Center Name, ID, or Mandal..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "healthy", "warning", "critical"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border",
                filter === s
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
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

      {view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCenters.map((center) => (
            <Link 
              key={center.id} 
              to={`/supervisor/centers/${center.id}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={cn(
                "h-1.5 w-full transition-colors",
                center.status === "healthy" ? "bg-emerald-500" : center.status === "warning" ? "bg-amber-500" : "bg-red-500"
              )} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all dark:bg-slate-800">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className={cn(
                    "rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                    center.status === "healthy" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : center.status === "warning" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    {center.status}
                  </div>
                </div>
                
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white uppercase truncate group-hover:text-primary transition-colors">{center.name}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {center.mandal} Sector
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-50 pt-4 dark:border-slate-800">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Compliance</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-black text-slate-900 dark:text-white">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {center.compliance}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Enrollment</div>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-black text-slate-900 dark:text-white">
                      <Users className="h-3 w-3 text-blue-500" /> {center.children}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">ID: {center.id}</span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left table-zebra">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3">Center Details</th>
                <th className="px-6 py-3">Mandal</th>
                <th className="px-6 py-3">Compliance</th>
                <th className="px-6 py-3">Worker Info</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCenters.map((center) => (
                <tr key={center.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        center.status === "healthy" ? "bg-emerald-500" : center.status === "warning" ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">{center.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{center.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{center.mandal}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black w-8">{center.compliance}%</span>
                       <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                          className={cn("h-full", center.compliance >= 90 ? "bg-emerald-500" : "bg-primary")} 
                          style={{ width: `${center.compliance}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{center.worker}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/supervisor/centers/${center.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}