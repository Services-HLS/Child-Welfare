import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Radio,
  AlertTriangle,
  Users,
  MessageSquare,
  TrendingUp,
  Zap,
  Download,
  Megaphone,
  Shield,
  Baby,
  Building2,
  FileText,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MissionControl({ scope = "state" }: { scope?: "state" | "district" }) {
  const navigate = useNavigate();
  const {
    missionControl,
    getOperationalClassroom,
    getExecutiveClassroom,
    sessions,
    complaints,
    serviceQualityScores,
    childWellnessIndexes,
    childRiskSignals,
    interventions,
    feedback,
    notifications,
    excellenceIndexes,
    voiceOfCitizen,
    refreshInterventions,
    launchIntervention,
    advanceComplaint,
  } = useApp();

  useEffect(() => {
    refreshInterventions();
  }, [refreshInterventions]);

  const m = missionControl;
  const classSnap = scope === "state" ? null : getOperationalClassroom("Tirupati");
  const execClass = scope === "state" ? getExecutiveClassroom() : null;
  const activePreschool = sessions.filter((s) => s.status === "completed").slice(0, 6);
  const liveCmp = complaints.filter((c) => c.status !== "closed").slice(0, 8);

  const action = (label: string) => {
    toast.success(`${label} queued`, { description: "Mission Control operational action (demo)" });
  };

  const title = scope === "district" ? "District Mission Control" : "State Mission Control";

  return (
    <div className="space-y-5 -mt-2">
      <div className="flex flex-wrap justify-between items-start gap-4 border border-slate-200 bg-white px-4 py-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Radio className="h-6 w-6 text-[#1e40af]" /> {title}
          </h2>
          <p className="text-sm text-slate-600 mt-1">Government command layout — live operations, grievances, and recommendations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Assign Team", icon: Users, fn: () => action("Assign Team") },
            { label: "Trigger Escalation", icon: AlertTriangle, fn: () => advanceComplaint(liveCmp[0]?.id ?? "", "district_escalation") },
            { label: "Broadcast Advisory", icon: Megaphone, fn: () => action("Broadcast Advisory") },
            { label: "Launch Intervention", icon: Zap, fn: () => interventions[0] && launchIntervention(interventions[0].id) },
            { label: "Export Situation Report", icon: Download, fn: () => { action("Export Situation Report"); window.print(); } },
            { label: "Open Center Command", icon: Building2, fn: () => navigate("/center-command/AWC-TPT-01") },
          ].map((a) => (
            <button key={a.label} type="button" onClick={a.fn} className="gov-btn-outline text-[11px] py-1.5 px-2 flex items-center gap-1">
              <a.icon className="h-3.5 w-3.5" /> {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Service delivery", value: `${m.sessionCompletionRate}%`, sub: "Sessions completed" },
          { label: "Grievance closure", value: `${m.grievanceClosureRate}%`, sub: "Resolved grievances" },
          { label: "Beneficiary satisfaction", value: `${m.satisfactionScore}%`, sub: "Citizen feedback index" },
          { label: "Intervention status", value: `${m.interventionCompletionRate}%`, sub: "Completed interventions" },
          { label: "Attention required", value: m.slaAtRisk, sub: "SLA at risk" },
          { label: "Platform health", value: m.platformHealth, sub: "Operational status" },
        ].map((k) => (
          <div key={k.label} className="border border-slate-200 bg-white border-l-4 border-l-[#1e40af] p-3">
            <div className="text-xl font-bold text-[#0F172A]">{k.value}</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">{k.label}</div>
            <div className="text-[10px] text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Executive summary" icon={FileText}>
          <p className="text-sm leading-relaxed">
            {scope === "state" ? "Statewide" : "District"} operations: {m.activeSessions} active sessions, {m.liveComplaints} live grievances,
            {m.interventionQueue} interventions in queue. Beneficiary sentiment: {m.sentimentLabel}.
            Average AEI: {excellenceIndexes.length ? Math.round(excellenceIndexes.reduce((a, x) => a + x.score, 0) / excellenceIndexes.length) : "—"}.
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Export-ready briefing · audit metadata on reports</p>
        </Panel>
        <Panel title="Notification center" icon={Bell}>
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="text-xs py-1 border-b">{n.title}</div>
          ))}
          <Link to={scope === "state" ? "/state-admin/notifications" : "/district-admin/complaints"} className="text-[10px] font-semibold text-[#1e40af] mt-2 inline-block">Open communication center →</Link>
        </Panel>
        <Panel title="Voice of beneficiary" icon={Shield}>
          <p className="text-sm">{voiceOfCitizen.aiSummary.slice(0, 180)}…</p>
          <Link to="/voice-of-citizen" className="text-[10px] font-semibold text-[#1e40af] mt-2 inline-block">Command center →</Link>
        </Panel>
      </div>

      <div className="grid xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-4">
          <Panel title="Live session intelligence" icon={Radio}>
            <p className="text-xs text-slate-600 mb-2">
              {scope === "state"
                ? `State avg OPI ${execClass?.stateAvgOpi ?? "—"}% · ${execClass?.totalSessionsRecorded ?? 0} sessions`
                : `District avg OPI ${classSnap?.avgOpi ?? "—"}% · ${classSnap?.coachingQueue ?? 0} coaching queue`}
            </p>
            {activePreschool.map((s) => (
              <div key={s.id} className="text-xs border-b border-slate-100 py-2 flex justify-between">
                <span>{s.metadata.centerName}</span>
                <Link
                  to={
                    scope === "state"
                      ? `/state-admin/session-insights/${s.id}`
                      : scope === "district"
                        ? `/district-admin/session-review/${s.id}`
                        : `/supervisor/session-analysis/${s.id}`
                  }
                  className="text-[#1e40af] font-semibold text-[10px]"
                >
                  {s.scorecard?.band ?? s.status}
                </Link>
              </div>
            ))}
            <Link
              to={scope === "state" ? "/state-admin/classroom-intelligence" : "/district-admin/classroom-intelligence"}
              className="text-[10px] font-semibold text-[#1e40af] mt-2 inline-block"
            >
              Classroom intelligence center →
            </Link>
          </Panel>
          <Panel title="Worker performance bands" icon={TrendingUp}>
            <div className="flex gap-4 text-center">
              <Band n={m.workerBands.green} label="Green" c="bg-emerald-500" />
              <Band n={m.workerBands.orange} label="Orange" c="bg-amber-500" />
              <Band n={m.workerBands.red} label="Red" c="bg-red-500" />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Supportive coaching — not punitive scoring</p>
          </Panel>
        </div>

        <div className="xl:col-span-5 space-y-4">
          <Panel title="Live complaints & SLA" icon={MessageSquare}>
            {liveCmp.map((c) => {
              const breach = new Date(c.slaDueAt) < new Date();
              return (
                <div key={c.id} className="text-xs py-2 border-b border-slate-100 flex justify-between gap-2">
                  <div>
                    <span className="font-bold">{c.id}</span> · {c.centerName}
                    <div className="text-slate-500">{c.status.replace(/_/g, " ")}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <Link to={`/grievance-explanation/${c.id}`} className="text-[#1e40af] text-[10px] font-semibold">Explain</Link>
                    {breach && <div className="text-red-700 text-[10px] font-semibold">SLA RISK</div>}
                  </div>
                </div>
              );
            })}
          </Panel>
          <Panel title="Beneficiary sentiment" icon={Shield}>
            <p className="text-sm">{m.sentimentLabel}</p>
            <p className="text-[10px] text-slate-500 mt-2">{feedback.length} feedback signals indexed</p>
          </Panel>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <Panel title="High-risk centers" icon={AlertTriangle}>
            {m.highRiskCenters.map((h) => (
              <Link key={h.centerId} to={`/center-digital-view/${h.centerId}`} className="block text-xs py-2 border-b border-slate-100 hover:text-[#1e40af]">
                <div className="font-bold">{h.centerName}</div>
                <div className="text-slate-500 line-clamp-2">{h.reason}</div>
              </Link>
            ))}
          </Panel>
          <Panel title="Intervention queue" icon={Zap}>
            <div className="text-2xl font-bold text-amber-800">{m.interventionQueue}</div>
            <Link to={scope === "district" ? "/district-admin/interventions" : "/supervisor/interventions"} className="text-[10px] font-semibold text-[#1e40af]">Open queue →</Link>
          </Panel>
          <Panel title="Child risk signals" icon={Baby}>
            {childRiskSignals.slice(0, 4).map((r) => (
              <Link key={r.id} to={`/risk-explanation/${r.id}`} className="block text-[10px] py-1 text-red-800 hover:underline">
                {r.summary.slice(0, 50)}…
              </Link>
            ))}
          </Panel>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="District rankings (SQI + CWI)" icon={TrendingUp}>
          <table className="w-full text-xs">
            <thead><tr className="text-slate-600 text-[10px] font-semibold"><th className="text-left py-1">District</th><th>SQI</th><th>CWI</th></tr></thead>
            <tbody>
              {m.districtRankings.map((d) => (
                <tr key={d.district} className="border-t border-slate-100">
                  <td className="py-2 font-semibold">{d.district}</td>
                  <td className="text-center text-[#1e40af]">{d.sqi}</td>
                  <td className="text-center text-teal-800">{d.cwi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Service quality trend (top centers)" icon={TrendingUp}>
          {serviceQualityScores.slice(0, 8).map((s) => {
            const cwi = childWellnessIndexes.find((w) => w.centerId === s.centerId);
            return (
              <div key={s.centerId} className="flex justify-between text-xs py-2 border-b border-slate-100">
                <Link to={`/sqi-explanation/${s.centerId}`} className="font-semibold hover:text-[#1e40af]">{s.centerName}</Link>
                <span>SQI {s.overallIndex} · CWI {cwi?.cwiScore ?? "—"}</span>
              </div>
            );
          })}
        </Panel>
      </div>

      <div className="text-[11px] text-slate-600 border border-slate-200 bg-slate-50 p-3">
        District alerts: {m.districtAlerts} · Live complaints: {m.liveComplaints} · Active sessions: {m.activeSessions}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Radio; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <Icon className="h-4 w-4 text-[#1e40af]" /> {title}
      </div>
      <div className="p-3 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Band({ n, label, c }: { n: number; label: string; c: string }) {
  return (
    <div className="flex-1">
      <div className={cn("h-2 rounded-full mb-1", c)} style={{ opacity: Math.min(1, n / 5 + 0.2) }} />
      <div className="font-black text-lg">{n}</div>
      <div className="text-[9px] uppercase text-slate-500">{label}</div>
    </div>
  );
}
