import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  MapPin, 
  ClipboardList, 
  Bell, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  Scan,
  Activity,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { StatusBadge } from "@/components/app/StatusBadge";
import { AEIDashboardStrip } from "@/components/unified/AEIDashboardStrip";
import { ClassroomDashboardStrip } from "@/components/classroom";
import { cn } from "@/lib/utils";

export default function WorkerDashboard() {
  const { t, user, activities, online, lastSync, sessions, getClassroomAnalytics } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Simulate loading state for UX
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!user) return null;

  const myActivities = activities.filter(a => a.centerId === user.centerId);
  const todayActs = myActivities.filter(a => 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  const hasCheckedIn = todayActs.some(a => a.type.toLowerCase().includes("attendance") || a.type.toLowerCase().includes("check-in"));
  const pendingReviews = myActivities.filter(a => a.status === "submitted").length;
  const criticalAlerts = 1; // Mock alert count

  const stats = [
    { 
      label: "Attendance", 
      value: hasCheckedIn ? "Present" : "Not Marked", 
      icon: Scan, 
      color: hasCheckedIn ? "text-emerald-600" : "text-rose-600",
      status: hasCheckedIn ? "success" : "danger"
    },
    { 
      label: "Activities", 
      value: `${todayActs.length} of 5`, 
      icon: ClipboardList, 
      color: "text-blue-600",
      status: "info"
    },
    { 
      label: "Pending", 
      value: pendingReviews, 
      icon: UploadCloud, 
      color: "text-purple-600",
      status: "secondary"
    },
    { 
      label: "Alerts", 
      value: criticalAlerts, 
      icon: Bell, 
      color: "text-red-600",
      status: "danger"
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 -mx-4 -mt-8 bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-4 gap-2 px-1">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-32 bg-slate-100 rounded" />
          <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="gov-notice -mx-4 sm:mx-0">
        <strong>Daily Operations Console</strong> — {t("improvement_disclaimer")}
      </div>
      {(() => {
        const latest = sessions.find((s) => s.metadata.workerId === user.id && s.scorecard);
        const intel = latest ? getClassroomAnalytics(latest.id) : null;
        return intel ? (
          <ClassroomDashboardStrip
            title="My session quality"
            opi={intel.indices.opi}
            band={intel.band}
            href={`/worker/session-feedback?id=${latest!.id}`}
            detail="Growth-focused classroom intelligence"
          />
        ) : null;
      })()}
      {/* 1. Header Section */}
      <div className="relative -mx-4 -mt-4 overflow-hidden border-2 border-[#1e3a5f] bg-[#0F172A] px-6 pb-20 pt-8 text-white lg:-mx-0">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent" />
        
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 opacity-80">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Official Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {t("greeting")}, {user.name.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> {user.centerName}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={handleRefresh}
              className={cn("rounded-full bg-white/10 p-2 transition-all active:scale-90", refreshing && "animate-spin")}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 border border-white/10">
              <div className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400")} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{online ? "Synced" : "Offline"}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </div>
      </div>

      {/* 2. Compact Summary Grid */}
      <div className="-mt-14 grid grid-cols-4 gap-2 relative z-10 px-1 lg:gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-3 text-center shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className={cn("mb-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-800", s.color)}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-none">{s.value}</div>
            <div className="mt-1 text-[8px] font-black uppercase tracking-tighter text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {user.centerId && (
        <div className="px-1">
          <AEIDashboardStrip centerId={user.centerId} />
        </div>
      )}

      {/* 3. Quick Actions */}
      <div className="space-y-3 px-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/worker/attendance" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition-all active:scale-95 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/10">
            <Scan className="h-6 w-6 text-blue-600" />
            <span className="text-[9px] font-bold uppercase text-blue-900 dark:text-blue-400">Attendance</span>
          </Link>
          <Link to="/worker/session-monitor" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition-all active:scale-95 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <PlusCircle className="h-6 w-6 text-emerald-600" />
            <span className="text-[9px] font-bold uppercase text-emerald-900 dark:text-emerald-400">Post Activity</span>
          </Link>
          <Link to="/worker/history" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50/50 p-4 transition-all active:scale-95 hover:bg-purple-100 dark:border-purple-900/30 dark:bg-purple-900/10">
            <UploadCloud className="h-6 w-6 text-purple-600" />
            <span className="text-[9px] font-bold uppercase text-purple-900 dark:text-purple-400">Verifications</span>
          </Link>
          <Link to="/worker/growth" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all active:scale-95 hover:bg-indigo-100">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            <span className="text-[9px] font-bold uppercase text-indigo-900">Growth journey</span>
          </Link>
          <Link to="/worker/child-progress" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-teal-100 bg-teal-50/50 p-4 transition-all active:scale-95 hover:bg-teal-100">
            <Activity className="h-6 w-6 text-teal-600" />
            <span className="text-[9px] font-bold uppercase text-teal-900">Child outcomes</span>
          </Link>
        </div>
      </div>

      {/* 4. Recent Activities */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Updates</h2>
          <Link to="/worker/history" className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="space-y-2">
          {todayActs.length > 0 ? (
            todayActs.slice(0, 3).map((a) => (
              <Link to={`/worker/activity/${a.id}`} key={a.id} className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-slate-800">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{a.type}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {format(new Date(a.timestamp), "h:mm a")} · {a.childrenPresent} CHILDREN
                    </div>
                  </div>
                </div>
                <StatusBadge status={a.status} confidence={a.aiConfidence} showConfidence={false} />
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-200" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">No activity recorded today</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Today's Timeline / Task Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 px-1 mx-1">
        <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Task Progress</h2>
        <div className="space-y-6">
          {[
            { label: "Check-in Complete", done: hasCheckedIn, icon: Scan },
            { label: "Activities Logged", done: todayActs.length > 0, icon: ClipboardList },
            { label: "Data Synchronized", done: online && todayActs.length > 0, icon: UploadCloud },
            { label: "Government Verified", done: todayActs.some(a => a.status === 'approved'), icon: CheckCircle },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 relative">
              {i < 3 && (
                <div className={cn(
                  "absolute left-[13px] top-7 w-0.5 h-6",
                  step.done ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
                )} />
              )}
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                step.done 
                  ? "bg-emerald-500 border-emerald-500 text-white" 
                  : "bg-white border-slate-100 text-slate-200 dark:bg-slate-900 dark:border-slate-800"
              )}>
                <step.icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-[11px] font-black uppercase tracking-tight transition-colors",
                  step.done ? "text-slate-900 dark:text-white" : "text-slate-300"
                )}>
                  {step.label}
                </div>
              </div>
              {step.done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Critical Alert Card (If applicable) */}
      {criticalAlerts > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50/50 p-4 dark:border-red-900/20 px-1 mx-1">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-md">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-red-900 dark:text-red-400 uppercase tracking-tight">Priority Message</h4>
              <p className="mt-1 text-[10px] font-medium text-red-700/80 leading-relaxed">
                Immunization drive tomorrow. Please ensure all medical logs are updated before 5:00 PM.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}