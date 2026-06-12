import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  Clock,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/app/StatusBadge";

export default function History() {
  const { activities, user } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const myActivities = activities.filter(a => a.centerId === user?.centerId);
  
  const filtered = myActivities.filter(a => {
    const matchesSearch = a.type.toLowerCase().includes(search.toLowerCase()) || 
                         a.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = myActivities.length;
  const approvedCount = myActivities.filter(a => a.status === "approved").length;
  const submittedCount = myActivities.filter(a => a.status === "submitted").length;

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <div>
        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Activity Ledger</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Track submissions and supervisor approvals</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</div>
          <div className="text-3xl font-black text-[#0F172A]">{totalCount}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm text-center">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Approved</div>
          <div className="text-3xl font-black text-emerald-600">{approvedCount}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm text-center">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">In Review</div>
          <div className="text-3xl font-black text-amber-600">{submittedCount}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search ledger..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
          />
          <button className="absolute right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["all", "submitted", "approved", "issue", "pending"].map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === s ? "bg-[#0F172A] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              )}
            >
              {s === 'submitted' ? 'In Review' : s === 'issue' ? 'Issues' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((a) => (
          <Link key={a.id} to={`/worker/activity/${a.id}`} className="block relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#0F172A] uppercase tracking-tight">{a.type}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <Calendar className="h-3.5 w-3.5" /> {format(new Date(a.timestamp), "d MMM, h:mm a")}
                </div>
              </div>
              <StatusBadge status={a.status} showConfidence={false} />
            </div>

            <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-1">
              "{a.description}"
            </p>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock className={cn("h-3.5 w-3.5", a.synced ? "text-emerald-500" : "text-amber-500")} />
                  {a.synced ? "Secured" : "Pending Sync"}
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {a.childrenPresent} Children
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                View Status <Info className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        )) : (
          <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
            <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Submissions Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
