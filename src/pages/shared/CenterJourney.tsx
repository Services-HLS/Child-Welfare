import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { AEIBadge } from "@/components/unified/AEIBadge";
import { CenterJourneyTimeline } from "@/components/unified/CenterJourneyTimeline";
import { TimelineReplay } from "@/components/timeline/TimelineReplay";
import { buildCenterJourneyPhases } from "@/services/improvement/serviceImprovementEngine";
import { format } from "date-fns";
import {
  ArrowRight,
  Sparkles,
  Users,
  MessageSquare,
  Baby,
  UserCircle,
  Shield,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

export default function CenterJourney() {
  const { id } = useParams();
  const {
    activities,
    sessions,
    feedback,
    complaints,
    coachingAssignments,
    interventions,
    surveys,
    childProgress,
    getAEI,
    getTimeline,
    getCenterOutcome,
    serviceQualityScores,
    user,
  } = useApp();
  const center = mockCenters.find((c) => c.id === id);
  if (!center) return <div className="p-10">Center not found</div>;

  const aei = getAEI(id!);
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
  const sqi = serviceQualityScores.find((s) => s.centerId === id);
  const todayActs = activities.filter(
    (a) => a.centerId === id && new Date(a.timestamp).toDateString() === new Date().toDateString()
  );
  const centerSessions = sessions.filter((s) => s.metadata.centerId === id);
  const latestSession = centerSessions[0];
  const openCmp = complaints.filter((c) => c.centerId === id && c.status !== "closed");
  const closedCmp = complaints.filter((c) => c.centerId === id && c.status === "closed");
  const centerFb = feedback.filter((f) => f.centerId === id);
  const avgRating = centerFb.length
    ? (centerFb.reduce((a, f) => a + f.rating, 0) / centerFb.length).toFixed(1)
    : "—";
  const centerInterventions = interventions.filter((i) => i.centerId === id);
  const workerName = centerSessions[0]?.metadata.workerName ?? center.worker ?? "Assigned worker";

  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] to-slate-800 text-white p-6 lg:p-8">
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div>
            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
              Unified Center Journey · Government Intelligence Loop
            </p>
            <h1 className="text-2xl lg:text-3xl font-black uppercase mt-1">{center.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {center.mandal}, {center.district} · {center.children} children · Worker: {workerName}
            </p>
          </div>
          {aei && <AEIBadge aei={aei} link />}
        </div>
        <p className="text-xs text-slate-300 mt-4 max-w-3xl leading-relaxed">
          One screen for the full operational story — service evidence, AI verification, beneficiary voice,
          grievance resolution, interventions, coaching, and child outcomes connected to AEI.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to={`/center-score/${id}`} className="text-[10px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">
            AEI breakdown
          </Link>
          <Link to={`/center-health/${id}`} className="text-[10px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-lg">
            Health & risk
          </Link>
          <Link to={`/sqi-explanation/${id}`} className="text-[10px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-lg">
            SQI transparency
          </Link>
          <Link to="/voice-of-citizen" className="text-[10px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-lg">
            Voice of beneficiary
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase text-slate-400 mb-4">Lifecycle sequence</h2>
        <CenterJourneyTimeline phases={phases} />
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Today's sessions", value: todayActs.length + centerSessions.length },
          { icon: Sparkles, label: "AI evaluations", value: centerSessions.filter((s) => s.scorecard).length },
          { icon: MessageSquare, label: "Beneficiary rating", value: `${avgRating}/5` },
          { icon: Shield, label: "Grievances", value: `${closedCmp.length} closed · ${openCmp.length} open` },
          { icon: GraduationCap, label: "Interventions", value: centerInterventions.length },
          { icon: Baby, label: "CWI trend", value: outcome?.outcomeTrend ?? "—" },
          { icon: TrendingUp, label: "Attendance", value: outcome ? `${outcome.attendanceRate}%` : "—" },
          { icon: UserCircle, label: "SQI", value: sqi?.overallIndex ?? "—" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-slate-50 p-4 flex items-center gap-3">
            <c.icon className="h-5 w-5 text-slate-500 shrink-0" />
            <div>
              <div className="text-lg font-black">{c.value}</div>
              <div className="text-[9px] font-black uppercase text-slate-400">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Service evidence today
            </h3>
            {todayActs.length === 0 && <p className="text-sm text-slate-500">No logs today yet.</p>}
            {todayActs.map((a) => (
              <div key={a.id} className="flex gap-3 border-b py-3 last:border-0">
                {a.imageUrl && <img src={a.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div>
                  <div className="font-bold text-sm">{a.type}</div>
                  <p className="text-xs text-slate-600">{a.description.slice(0, 120)}</p>
                  <p className="text-[10px] text-slate-400">
                    {format(new Date(a.timestamp), "h:mm a")} · {a.worker} · AI conf{" "}
                    {((a.aiConfidence ?? 0.7) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          {latestSession && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" /> AI session evaluation
              </h3>
              {latestSession.scorecard ? (
                <>
                  <p className="text-sm">
                    OPI {(latestSession.scorecard.overallPerformanceIndex * 100).toFixed(0)}% · Band{" "}
                    <strong>{latestSession.scorecard.band}</strong> · Engagement{" "}
                    {(latestSession.scorecard.childEngagement * 100).toFixed(0)}%
                  </p>
                  <Link
                    to={`/session-explanation/${latestSession.id}`}
                    className="text-xs font-black uppercase text-blue-600 mt-2 inline-flex items-center gap-1"
                  >
                    Explain AI evaluation <ArrowRight className="h-3 w-3" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-500">Processing…</p>
              )}
            </div>
          )}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Beneficiary feedback & grievances</h3>
            {centerFb.slice(0, 3).map((f) => (
              <p key={f.id} className="text-xs py-1 border-b">
                ★{f.rating} — {f.text.slice(0, 80)}
              </p>
            ))}
            {complaints
              .filter((c) => c.centerId === id)
              .slice(0, 3)
              .map((c) => (
                <Link key={c.id} to={`/grievance-explanation/${c.id}`} className="text-xs py-1 block text-blue-700">
                  {c.title} · {c.status}
                </Link>
              ))}
          </div>
        </div>
        <div className="space-y-4">
          {aei && (
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Final center impact (AEI)</h3>
              <p className="text-2xl font-black">{aei.score}</p>
              <p className="text-xs text-slate-600 mt-1">{aei.guidance[0]}</p>
              <ul className="text-[10px] mt-2 space-y-1 text-slate-500">
                <li>Worker: {aei.components.workerPerformance}%</li>
                <li>Engagement: {aei.components.childEngagement}%</li>
                <li>Satisfaction: {aei.components.beneficiarySatisfaction}%</li>
              </ul>
            </div>
          )}
          <div className="rounded-2xl border bg-teal-50 p-5">
            <h3 className="text-[10px] font-black uppercase text-teal-800 flex items-center gap-2 mb-2">
              <Baby className="h-4 w-4" /> Child outcomes
            </h3>
            <p className="text-sm">
              {outcome
                ? `${outcome.outcomeTrend} · attendance ${outcome.attendanceRate}% · dev ${outcome.developmentScore}`
                : "Log child progress for CWI"}
            </p>
            {(user?.role === "worker" || user?.role === "supervisor") && (
              <Link to="/worker/child-progress" className="text-[10px] font-black uppercase text-teal-700 mt-2 inline-block">
                Child progress →
              </Link>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Interventions & coaching</h3>
            {centerInterventions.slice(0, 4).map((i) => (
              <div key={i.id} className="text-xs py-1 border-b">
                {i.title} · {i.status} · {i.owner ?? "District"}
              </div>
            ))}
            {coachingAssignments
              .filter((c) => c.centerId === id)
              .slice(0, 2)
              .map((c) => (
                <div key={c.id} className="text-xs py-1 text-slate-600">
                  Coaching: {c.notes.slice(0, 50)}
                </div>
              ))}
            <Link
              to={user?.role === "district_admin" ? "/district-admin/interventions" : "/supervisor/interventions"}
              className="text-[10px] font-black uppercase text-blue-600 mt-2 inline-block"
            >
              Intervention OS →
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border bg-slate-50 p-6">
        <h2 className="text-sm font-black uppercase text-slate-700 mb-4">Event timeline — all signals in sequence</h2>
        <TimelineReplay events={timeline.slice(0, 24)} />
      </section>
    </div>
  );
}
