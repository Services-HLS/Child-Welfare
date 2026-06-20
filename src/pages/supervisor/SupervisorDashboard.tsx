import { useApp } from "@/context/AppContext";
import { mockCenters, mockActivities, mockAlerts } from "@/data/mockData";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Bell, 
  ArrowUpRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  MapPin,
  TrendingUp,
  ArrowRight,
  Activity,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
import { AEIDashboardStrip } from "@/components/unified/AEIDashboardStrip";
import { ClassroomDashboardStrip } from "@/components/classroom";
import { SupervisorGrievanceCommand } from "@/components/supervisor/SupervisorGrievanceCommand";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { name: 'Mon', value: 72 },
  { name: 'Tue', value: 78 },
  { name: 'Wed', value: 75 },
  { name: 'Thu', value: 85 },
  { name: 'Fri', value: 82 },
  { name: 'Sat', value: 88 },
  { name: 'Sun', value: 91 },
];

export default function SupervisorDashboard() {
  const { t, user, activities: globalActivities, complaints, feedback, getOperationalClassroom } = useApp();
  const classSnap = getOperationalClassroom("Tirupati");
  
  // Filter data by district (Tirupati) for Supervisor
  const district = "Tirupati";
  const supervisorCenters = mockCenters.filter(c => c.district === district);
  const supervisorCenterIds = supervisorCenters.map(c => c.id);
  const supervisorActivities = globalActivities.filter(a => supervisorCenterIds.includes(a.centerId));
  const supervisorAlerts = mockAlerts.filter(a => supervisorCenterIds.includes(a.centerId));

  return (
    <div className="space-y-6">
      <SupervisorGrievanceCommand />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            {t("welcome")}, {user?.name}
          </h1>
          <p className="text-sm font-medium text-slate-500">{district} District · Performance Monitoring & Verifications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search centers..." 
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 sm:w-64"
            />
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AEIDashboardStrip district={district} />
      <ClassroomDashboardStrip
        title="Classroom health & coaching queue"
        opi={classSnap.avgOpi}
        band={classSnap.avgOpi >= 75 ? "green" : classSnap.avgOpi >= 55 ? "orange" : "red"}
        href="/supervisor/classroom-intelligence"
        detail={`${classSnap.coachingQueue} in coaching queue · ${classSnap.flaggedCount} flagged`}
      />
      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
        <Link to="/supervisor/interventions" className="text-blue-600">Intervention OS →</Link>
        <Link to="/center-journey/AWC-TPT-01" className="text-blue-600">Center journey →</Link>
        <Link to="/voice-of-citizen" className="text-blue-600">Voice of beneficiary →</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Centers Monitored" 
          value={supervisorCenters.length} 
          icon={Building2} 
          trend={12}
          accent="primary"
        />
        <StatCard 
          label="Active Workers" 
          value="32/40" 
          icon={Users} 
          trend={5}
          accent="success"
        />
        <StatCard 
          label="Pending Verification" 
          value={supervisorActivities.filter(a => a.status === "submitted").length} 
          icon={ShieldCheck} 
          accent="warning"
        />
        <StatCard 
          label="Critical Alerts" 
          value={supervisorAlerts.filter(a => a.severity === "high").length} 
          icon={Bell} 
          accent="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance Trend Chart */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Compliance Trend</h2>
            <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={0.05} 
                  fill="#3B82F6" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Live Feed
            </h2>
            <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
            {supervisorActivities.slice(0, 5).map((a) => (
              <div key={a.id} className="flex gap-3 group cursor-pointer border-b border-slate-50 pb-3 last:border-0 dark:border-slate-800">
                <div className="relative shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-slate-800">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate leading-none">{a.centerName}</p>
                    <span className="text-[9px] font-black text-slate-400 whitespace-nowrap uppercase tracking-tighter">{format(new Date(a.timestamp), "h:mm a")}</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-tight">{a.type}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/supervisor/centers" className="mt-6 flex items-center justify-center gap-2 rounded-md border border-slate-200 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all dark:border-slate-800 dark:hover:bg-slate-800">
            Full Center List <ChevronRight className="h-3 w-3" />
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/supervisor/child-outcomes" className="text-[10px] font-black uppercase text-teal-700 border border-teal-200 rounded-md px-3 py-2 hover:bg-teal-50">Child outcomes</Link>
            <Link to="/supervisor/interventions" className="text-[10px] font-black uppercase text-blue-700 border border-blue-200 rounded-md px-3 py-2 hover:bg-blue-50">Interventions</Link>
          </div>
        </div>
      </div>

      {/* Critical Alerts Preview */}
      <div className="rounded-lg border border-red-200 bg-red-50/30 p-6 dark:border-red-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-red-900 dark:text-red-400">Pending Critical Alerts</h2>
              <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest">Immediate Administrative Review Required</p>
            </div>
          </div>
          <Link to="/supervisor/alerts" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">View All Alerts</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {supervisorAlerts.filter(a => a.severity === "high").slice(0, 2).map(alert => (
            <div key={alert.id} className="flex items-center justify-between rounded-md border border-red-100 bg-white p-3 shadow-sm dark:border-red-900/20 dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate leading-none">{alert.message}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 truncate">{alert.centerName} · {format(new Date(alert.time), "h:mm a")}</div>
                </div>
              </div>
              <button className="ml-4 rounded bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-100 dark:bg-red-900/20 transition-all">
                Resolve
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Unified ops: grievances & parent feedback */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Complaint Monitoring · SLA
          </h2>
          <div className="text-3xl font-black text-slate-900">{complaints.filter(c => supervisorCenterIds.includes(c.centerId) && c.status !== "closed").length}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Open grievances in Tirupati</p>
          <Link to="/supervisor/complaints" className="mt-4 inline-block text-[10px] font-black uppercase text-blue-600 hover:underline">Open grievance center →</Link>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold uppercase mb-4">Parent Feedback · Sentiment</h2>
          <div className="flex gap-4">
            <div><div className="text-2xl font-black text-emerald-600">{feedback.filter(f => f.sentiment === "positive").length}</div><div className="text-[10px] uppercase font-bold text-slate-400">Positive</div></div>
            <div><div className="text-2xl font-black text-red-600">{feedback.filter(f => f.sentiment === "negative" || f.sentiment === "critical").length}</div><div className="text-[10px] uppercase font-bold text-slate-400">At risk</div></div>
          </div>
          <p className="text-xs text-slate-500 mt-3">AI detects dissatisfaction patterns before escalation</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-6">
        <h2 className="text-sm font-bold uppercase text-amber-900 mb-3">Risk Centers · Performance Ranking</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {supervisorCenters.sort((a, b) => a.compliance - b.compliance).slice(0, 3).map((c) => (
            <Link key={c.id} to={`/supervisor/centers/${c.id}`} className="rounded-md bg-white border p-3 hover:shadow-md transition">
              <div className="text-xs font-black uppercase truncate">{c.name}</div>
              <div className="text-lg font-black text-amber-700">{c.compliance}%</div>
              <div className="text-[10px] text-slate-400 uppercase">{c.status}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}