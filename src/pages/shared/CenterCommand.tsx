import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { AEIBadge } from "@/components/unified/AEIBadge";
import { CenterJourneyTimeline } from "@/components/unified/CenterJourneyTimeline";
import { TimelineReplay } from "@/components/timeline/TimelineReplay";
import { buildCenterJourneyPhases } from "@/services/improvement/serviceImprovementEngine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GovCard } from "@/components/gov/GovCard";
import { format } from "date-fns";
import { Printer, Building2, Radio, Download } from "lucide-react";
import { toast } from "sonner";

const DEMO_CHILDREN = 24;

export default function CenterCommand() {
  const { id } = useParams();
  const {
    activities,
    sessions,
    feedback,
    complaints,
    coachingAssignments,
    interventions,
    childProgress,
    notifications,
    getAEI,
    getCenterHealth,
    getTimeline,
    getCenterOutcome,
    getOperationalFlow,
    serviceQualityScores,
    childWellnessIndexes,
    user,
  } = useApp();

  const center = mockCenters.find((c) => c.id === id);
  if (!center) return <div className="p-10">Center not found</div>;

  const aei = getAEI(id!);
  const health = getCenterHealth(id!);
  const phases = buildCenterJourneyPhases(id!, {
    sessions,
    activities,
    feedback,
    complaints,
    coaching: coachingAssignments,
    childProgress,
    interventions,
  });
  const timeline = getTimeline(id!, "month");
  const outcome = getCenterOutcome(id!);
  const flow = getOperationalFlow(id!);
  const sqi = serviceQualityScores.find((s) => s.centerId === id);
  const cwi = childWellnessIndexes.find((w) => w.centerId === id);
  const centerSessions = sessions.filter((s) => s.metadata.centerId === id);
  const workerName = centerSessions[0]?.metadata.workerName ?? center.worker;
  const todayActs = activities.filter(
    (a) => a.centerId === id && new Date(a.timestamp).toDateString() === new Date().toDateString()
  );
  const centerCmp = complaints.filter((c) => c.centerId === id);
  const centerInts = interventions.filter((i) => i.centerId === id);
  const centerNotifs = notifications.slice(0, 6);

  return (
    <div className="space-y-4 pb-24">
      <div className="sticky top-0 z-10 border border-slate-300 bg-white px-4 py-3 flex flex-wrap gap-2 justify-between items-center shadow-sm print:static">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Unified Center Command</p>
          <h1 className="text-lg font-bold text-[#0F172A]">{center.name}</h1>
          <p className="text-xs text-slate-600">{center.mandal}, {center.district} · Worker: {workerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {aei && <AEIBadge aei={aei} link />}
          <button type="button" onClick={() => window.print()} className="gov-btn-outline text-xs py-1.5 flex items-center gap-1">
            <Printer className="h-3.5 w-3.5" /> Print summary
          </button>
          <Link to={`/center-timeline/${id}`} className="gov-btn-outline text-xs py-1.5">Timeline replay</Link>
          <button type="button" onClick={() => toast.success("Situation report exported (demo)")} className="gov-btn-primary text-xs py-1.5 flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1 border border-slate-200">
          {["overview", "operations", "citizen", "health", "coaching", "intervention", "timeline", "impact"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs font-semibold capitalize data-[state=active]:bg-white data-[state=active]:text-[#1e40af]">
              {t === "citizen" ? "Citizen Voice" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Enrolled children", value: center.children || DEMO_CHILDREN },
              { label: "Today's services", value: todayActs.length },
              { label: "Open grievances", value: centerCmp.filter((c) => c.status !== "closed").length },
              { label: "AEI score", value: aei?.score ?? "—" },
            ].map((m) => (
              <div key={m.label} className="border border-slate-200 bg-white p-4 border-l-4 border-l-[#1e40af]">
                <div className="text-xl font-bold">{m.value}</div>
                <div className="text-xs font-semibold text-slate-700">{m.label}</div>
              </div>
            ))}
          </div>
          <GovCard title="Operational lifecycle" subtitle="Service → AI → citizen → grievance → resolution → coaching → impact" className="mt-4">
            <CenterJourneyTimeline phases={phases} />
          </GovCard>
          {aei && (
            <p className="text-sm text-slate-700 mt-3 gov-notice">{aei.guidance[0]}</p>
          )}
        </TabsContent>

        <TabsContent value="operations">
          <GovCard title="Today's service evidence" subtitle="Attendance, nutrition, preschool — GPS and verification">
            {todayActs.length === 0 && <p className="text-sm text-slate-500">No logs today.</p>}
            {todayActs.map((a) => (
              <div key={a.id} className="border-b border-slate-100 py-2 text-sm">
                <strong>{a.type}</strong> — {a.description.slice(0, 100)}
                <span className="text-[10px] text-slate-500 block">{format(new Date(a.timestamp), "h:mm a")} · Verification {(a.aiConfidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </GovCard>
          <GovCard title="Preschool sessions & service insights" className="mt-4">
            {centerSessions.slice(0, 6).map((s) => (
              <div key={s.id} className="flex justify-between py-2 border-b text-sm">
                <span>{format(new Date(s.createdAt), "MMM d")} · {s.metadata.sessionType}</span>
                <Link to={`/session-explanation/${s.id}`} className="text-[#1e40af] font-semibold text-xs">
                  {s.scorecard ? `OPI ${(s.scorecard.overallPerformanceIndex * 100).toFixed(0)}% · ${s.scorecard.band}` : "Processing"}
                </Link>
              </div>
            ))}
          </GovCard>
        </TabsContent>

        <TabsContent value="citizen">
          <GovCard title="Beneficiary satisfaction" subtitle="Feedback and grievance trends">
            {feedback.filter((f) => f.centerId === id).slice(0, 5).map((f) => (
              <p key={f.id} className="text-sm py-1 border-b">★{f.rating} — {f.text.slice(0, 90)}</p>
            ))}
            {centerCmp.map((c) => (
              <Link key={c.id} to={`/grievance-explanation/${c.id}`} className="block text-sm py-1 text-[#1e40af]">
                {c.title} · {c.status}
              </Link>
            ))}
          </GovCard>
          <Link to="/voice-of-citizen" className="text-xs font-semibold text-[#1e40af] mt-2 inline-block">Open Voice of Beneficiary Command →</Link>
        </TabsContent>

        <TabsContent value="health">
          {health && (
            <>
              <GovCard title="Attention indicators" subtitle={`Risk ${health.riskScore} · Confidence ${(health.confidence * 100).toFixed(0)}% · ${health.trendDirection}`}>
                <p className="text-sm mb-3">{health.summary}</p>
                {health.factors.map((f, i) => (
                  <div key={i} className="text-xs py-1 border-b"><strong>{f.label}</strong> — {f.detail}</div>
                ))}
              </GovCard>
              <Link to={`/center-health/${id}`} className="text-xs font-semibold text-[#1e40af]">Full health engine →</Link>
              <Link to={`/risk-explanation/${id}`} className="text-xs font-semibold text-[#1e40af] ml-4">Explainable risk →</Link>
            </>
          )}
        </TabsContent>

        <TabsContent value="coaching">
          <GovCard title="Training & workforce development">
            {coachingAssignments.filter((c) => c.centerId === id).map((c) => (
              <div key={c.id} className="text-sm py-2 border-b">{c.notes} · {c.status}</div>
            ))}
            {coachingAssignments.filter((c) => c.centerId === id).length === 0 && <p className="text-sm text-slate-500">No active coaching assignments.</p>}
          </GovCard>
        </TabsContent>

        <TabsContent value="intervention">
          <GovCard title="Intervention history" subtitle="Government intervention OS">
            {centerInts.map((i) => (
              <div key={i.id} className="text-sm py-2 border-b">
                <strong>{i.title}</strong> · {i.status} · {i.owner ?? "District"}
                <span className="block text-xs text-slate-500">{i.expectedImpact}</span>
              </div>
            ))}
          </GovCard>
        </TabsContent>

        <TabsContent value="timeline">
          <GovCard title="Event replay" subtitle="Filterable timeline — open full engine for playback">
            <TimelineReplay events={timeline.slice(0, 15)} />
            <Link to={`/center-timeline/${id}`} className="gov-btn-outline text-xs mt-3 inline-flex">Open Timeline Replay Engine</Link>
          </GovCard>
        </TabsContent>

        <TabsContent value="impact">
          <GovCard title="Child outcomes (CWI)" subtitle={cwi ? `CWI ${cwi.cwiScore} · trend ${cwi.trend}` : "Log child progress"}>
            {outcome && (
              <ul className="text-sm space-y-1">
                <li>Attendance rate: {outcome.attendanceRate}%</li>
                <li>Development score: {outcome.developmentScore}</li>
                <li>Trend: {outcome.outcomeTrend}</li>
              </ul>
            )}
            {childProgress.filter((p) => p.centerId === id).slice(0, 5).map((p) => (
              <div key={p.id} className="text-xs py-1 border-b">{p.childName} · participation {(p.preschoolParticipation * 100).toFixed(0)}%</div>
            ))}
          </GovCard>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Link to={`/center-score/${id}`} className="border p-4 hover:bg-slate-50 text-sm font-semibold text-[#1e40af]">AEI breakdown →</Link>
            <Link to={`/aei-explanation/${id}`} className="border p-4 hover:bg-slate-50 text-sm font-semibold text-[#1e40af]">Explain AEI →</Link>
            <Link to={`/sqi-explanation/${id}`} className="border p-4 hover:bg-slate-50 text-sm font-semibold text-[#1e40af]">SQI {sqi?.overallIndex ?? "—"} →</Link>
            <Link to="/impact" className="border p-4 hover:bg-slate-50 text-sm font-semibold text-[#1e40af]">Statewide impact →</Link>
          </div>
        </TabsContent>
      </Tabs>

      <GovCard title="Operational recommendations" subtitle="AI supports human officials — final decisions remain with department staff">
        <ul className="text-sm list-disc pl-5 space-y-1">
          {aei?.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          {flow.filter((f) => f.status === "active").map((f) => (
            <li key={f.id}>Active step: {f.label}</li>
          ))}
        </ul>
      </GovCard>

      {centerNotifs.length > 0 && (
        <GovCard title="Notifications" className="mt-4">
          {centerNotifs.map((n) => (
            <div key={n.id} className="text-xs py-1 border-b">{n.title}: {n.body}</div>
          ))}
        </GovCard>
      )}
    </div>
  );
}
