import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  ArrowRight,
  Video,
  Box,
  Filter,
  Calendar
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Verifications() {
  const { activities } = useApp();
  const [filter, setFilter] = useState<"submitted" | "approved" | "issue">("submitted");
  const [search, setSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const centers = useMemo(() => {
    const names = activities.map(a => a.centerName);
    return ["all", ...Array.from(new Set(names))];
  }, [activities]);

  const filteredActivities = activities
    .filter(a => a.status === filter)
    .filter(a => selectedCenter === "all" || a.centerName === selectedCenter)
    .filter(a => !selectedDate || a.timestamp.startsWith(selectedDate))
    .filter(a => a.centerName.toLowerCase().includes(search.toLowerCase()) || 
                 a.type.toLowerCase().includes(search.toLowerCase()) ||
                 a.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 w-full max-w-none pb-20 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#0F172A] uppercase tracking-tight">Governance Audit Portal</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Administrative Review & Neural Extraction</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 border border-blue-100">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Audit Status: ACTIVE</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[{ id: "submitted", label: "Pending Reviews" }, { id: "approved", label: "Approved Logs" }, { id: "issue", label: "Flagged Issues" }].map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id as any)} className={cn("whitespace-nowrap rounded-lg px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border", filter === s.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-md" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}>
              {s.label} ({activities.filter(a => a.status === s.id).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by activity or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 shadow-sm" />
          </div>

          <div className="md:col-span-4 relative">
             <Building2 className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <select 
               value={selectedCenter} 
               onChange={(e) => setSelectedCenter(e.target.value)}
               className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-blue-600/5 shadow-sm"
             >
                <option value="all">All Anganwadi Centers</option>
                {centers.filter(c => c !== "all").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
             </select>
          </div>

          <div className="md:col-span-3 relative">
             <Calendar className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <input 
               type="date" 
               value={selectedDate} 
               onChange={(e) => setSelectedDate(e.target.value)}
               className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/5 shadow-sm"
             />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((a) => (
            <div key={a.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                    {a.imageUrl ? (
                      a.imageUrl.startsWith('data:video') || a.imageUrl.includes('video') ? (
                        <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white">
                          <Video className="h-6 w-6 opacity-50" />
                        </div>
                      ) : (
                        <img src={a.imageUrl} alt={a.type} className="h-full w-full object-cover" />
                      )
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{a.centerName} · #{a.id}</span>
                      <StatusBadge status={a.status} showConfidence={false} />
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">{a.type}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-blue-600" /> {a.worker}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="flex items-center gap-1.5 text-slate-400"><Clock className="h-3.5 w-3.5" /> {format(new Date(a.timestamp), "h:mm a")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link 
                    to={`/supervisor/audit/${a.id}`}
                    className="flex h-12 items-center gap-2 rounded-xl bg-[#0F172A] px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                  >
                    View Submission <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50 py-24 text-center">
             <Box className="mx-auto h-16 w-16 text-slate-200 mb-4" />
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
