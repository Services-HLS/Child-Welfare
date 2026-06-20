import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ExecutiveKpiGrid, ExecutiveBarChart } from "@/components/executive/ExecutiveReport";
import { format } from "date-fns";
import { Shield, ChevronRight } from "lucide-react";

export function SupervisorGrievanceCommand() {
  const { complaints, user } = useApp();
  const district = "Tirupati";
  const mine = complaints.filter((c) => c.district === district);
  const pending = mine.filter((c) => c.status !== "closed");
  const critical = mine.filter((c) => (c.urgencyScore ?? 0) > 0.8);

  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  mine.forEach((c) => {
    byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
    const pri = String(c.priority ?? "medium");
    byPriority[pri] = (byPriority[pri] ?? 0) + 1;
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
  });

  const catChart = Object.entries(byCategory).map(([label, value]) => ({ label: label.replace(/_/g, " ").slice(0, 10), value }));
  const priChart = Object.entries(byPriority).map(([label, value]) => ({ label, value }));
  const statusChart = Object.entries(byStatus).map(([label, value]) => ({ label: label.replace(/_/g, " ").slice(0, 8), value }));
  const monthChart = [{ label: "Jan", value: 2 }, { label: "Feb", value: 4 }, { label: "Mar", value: 6 }, { label: "Apr", value: 8 }, { label: "May", value: 7 }, { label: "Jun", value: mine.length }];

  return (
    <section className="space-y-5 rounded-sm border-2 border-[#0c1f3d] bg-white p-5 shadow-md">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c9a227]">AI Investigation Command</p>
        <h2 className="text-xl font-bold text-[#0c1f3d]">{user?.name} · Investigation Officer</h2>
        <p className="text-sm text-slate-600">{district} District · Public Grievance Intelligence</p>
      </div>

      <ExecutiveKpiGrid
        items={[
          { label: "Total Grievances", value: mine.length, tone: "neutral" },
          { label: "Pending Investigation", value: pending.length, tone: "warn" },
          { label: "Critical Priority", value: critical.length, tone: "danger" },
          { label: "Resolved", value: mine.length - pending.length, tone: "good" },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-sm border border-slate-200 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Category Distribution</p>
          <ExecutiveBarChart data={catChart.length ? catChart : [{ label: "None", value: 0 }]} />
        </div>
        <div className="rounded-sm border border-slate-200 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Priority Distribution</p>
          <ExecutiveBarChart data={priChart.length ? priChart : [{ label: "—", value: 0 }]} color="#c9a227" />
        </div>
        <div className="rounded-sm border border-slate-200 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Monthly Trends</p>
          <ExecutiveBarChart data={monthChart} color="#138808" />
        </div>
        <div className="rounded-sm border border-slate-200 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Status Distribution</p>
          <ExecutiveBarChart data={statusChart.length ? statusChart : [{ label: "—", value: 0 }]} color="#7c3aed" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-[#1e3a5f]">Recent Grievances — AI Investigation Reports</h3>
          <Link to="/supervisor/public-grievance-center" className="text-xs font-bold text-[#1e40af]">View all →</Link>
        </div>
        <div className="space-y-2">
          {mine.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              to={`/supervisor/grievance/${c.id}`}
              className="flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-3 hover:border-[#1e40af] hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Shield className="h-5 w-5 text-[#1e40af] shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold text-slate-500">{c.id}</p>
                  <p className="text-sm font-bold text-[#0c1f3d] truncate">{c.title}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{c.category.replace(/_/g, " ")} · {c.centerName}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-[10px] font-bold uppercase text-amber-700">{c.status.replace(/_/g, " ")}</p>
                <p className="text-[9px] text-slate-400">{format(new Date(c.createdAt), "d MMM")}</p>
                <ChevronRight className="h-4 w-4 text-[#1e40af] ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link to="/supervisor/anganwadi-analytics" className="block text-center gov-btn-outline text-sm py-2.5">
        Open Anganwadi Executive Analytics →
      </Link>
    </section>
  );
}
