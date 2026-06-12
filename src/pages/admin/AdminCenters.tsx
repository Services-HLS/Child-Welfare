import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  MoreVertical,
  ArrowUpRight,
  ChevronDown,
  X,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCenters() {
  const { t } = useApp();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const centers = mockCenters.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mandal.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(new Promise((res) => setTimeout(res, 1500)), {
      loading: "Registering Center in Ledger...",
      success: "Center Successfully Registered",
      error: "Registration Failed"
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Registration Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Register New Center</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official State Registry Entry</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Center Name</label>
                  <input type="text" required placeholder="e.g., Alipiri Center" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Center ID</label>
                  <input type="text" required placeholder="AWC-TPT-XX" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Mandal / Sector</label>
                  <input type="text" required placeholder="e.g., Tirupati Urban" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Assigned Worker</label>
                  <input type="text" required placeholder="Worker Name" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Total Enrollment</label>
                <input type="number" required placeholder="0" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-[#0F172A] py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-slate-800">
                  Register Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Center Registry</h1>
          <p className="text-sm font-medium text-slate-500">Official State-wide Database of {mockCenters.length} District Anganwadi Centers</p>
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
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" /> Register Center
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
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Mandal: All <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {centers.map((center) => (
            <div 
              key={center.id}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    center.compliance >= 90 ? "bg-emerald-500" : center.compliance >= 75 ? "bg-amber-500" : "bg-red-500"
                  )} 
                  style={{ width: `${center.compliance}%` }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all dark:bg-slate-800">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={cn(
                      "rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest",
                      center.status === "healthy" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : center.status === "warning" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {center.status}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" /> {center.compliance}%
                    </div>
                  </div>
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white uppercase truncate">{center.name}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {center.mandal} Sector
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-50 pt-4 dark:border-slate-800">
                   <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Worker</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{center.worker}</div>
                   </div>
                   <div className="text-right">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Enrollment</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">{center.children} Children</div>
                   </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">ID: {center.id}</span>
                  <div className="flex items-center gap-1">
                    <button className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all dark:bg-slate-800">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                <th className="px-6 py-3">Staff / Enrollment</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {centers.map((center) => (
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {center.children} Children
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </button>
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