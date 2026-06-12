import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { WorkerFieldLayout } from "@/components/worker/WorkerFieldLayout";
import { ClassroomExtractedReport } from "@/components/worker/classroom/ClassroomExtractedReport";
import { SupportLevelBadge } from "@/components/worker/SupportLevel";
import { EngagementTrendChart } from "@/components/worker/EngagementTrendChart";
import { DayTimeline } from "@/components/worker/DayTimeline";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SessionFeedback() {
  const { id: paramId } = useParams();
  const [params] = useSearchParams();
  const id = paramId ?? params.get("id");
  const navigate = useNavigate();
  const { sessions, updateSession, getClassroomAnalytics, user, t } = useApp();
  const session = sessions.find((s) => s.id === id) ?? sessions.filter((s) => s.metadata.workerId === user?.id && s.scorecard)[0];
  const intel = session ? getClassroomAnalytics(session.id) : null;
  const [comment, setComment] = useState(session?.workerComment ?? "");

  const historyChart = useMemo(() => {
    return sessions
      .filter((s) => s.metadata.workerId === user?.id && s.scorecard)
      .slice(0, 3)
      .reverse()
      .map((s) => ({
        label: format(new Date(s.createdAt), "MMM d"),
        value: Math.round((s.scorecard?.overallPerformanceIndex ?? 0) * 100),
      }));
  }, [sessions, user?.id]);

  if (!session?.scorecard && !session?.extractedAnalysis) {
    return (
      <WorkerFieldLayout title={t("session_support_summary")} subtitle="">
        <p className="text-slate-600 text-sm">Session not found or still processing.</p>
        <button type="button" onClick={() => navigate("/worker/session-monitor")} className="mt-4 gov-btn-primary text-sm">
          Back to workspace
        </button>
      </WorkerFieldLayout>
    );
  }

  if (session.extractedAnalysis) {
    return (
      <WorkerFieldLayout title={t("session_support_summary")} subtitle="Government-style classroom observation report">
        <ClassroomExtractedReport
          extracted={session.extractedAnalysis}
          metadata={session.metadata}
          videoUrl={session.videoBlobUrl}
          uploadedAt={session.processedAt ?? session.createdAt}
          saved={session.analysisSaved}
          transcriptSaved={session.analysisSaved || !!session.extractedAnalysis.transcriptSavedAt}
          onSaveTranscript={() => {
            const savedAt = new Date().toISOString();
            updateSession(session.id, {
              extractedAnalysis: { ...session.extractedAnalysis!, transcriptSavedAt: savedAt },
              analysisSaved: true,
            });
            toast.success("Transcript saved — available offline and in session history");
          }}
        />
        <Link to="/worker/session-monitor" state={{ openSessionId: session.id }} className="text-sm font-semibold text-[#1e40af] mt-4 inline-block">
          Open in workspace →
        </Link>
      </WorkerFieldLayout>
    );
  }

  const sc = session.scorecard!;
  const wv = intel?.workerView;
  const metrics = [
    { label: "Overall session quality", value: `${intel?.indices.opi ?? Math.round(sc.overallPerformanceIndex * 100)}%` },
    { label: "Child engagement", value: `${intel?.indices.cei ?? Math.round(sc.childEngagement * 100)}%` },
    { label: "Teaching communication", value: `${intel?.indices.cqi ?? Math.round(sc.communication * 100)}%` },
    { label: "Activity completion", value: `${intel?.indices.sai ?? Math.round(sc.activityCompliance * 100)}%` },
    { label: "Classroom readiness", value: `${intel?.indices.tei ?? Math.round(sc.teachingEffectiveness * 100)}%` },
    { label: "Participation level", value: `${Math.round(((sc.childEngagementDetail.attentive + sc.childEngagementDetail.participating) / Math.max(sc.childEngagementDetail.estimatedPresent, 1)) * 100)}%` },
  ];

  return (
    <WorkerFieldLayout
      title={t("session_support_summary")}
      subtitle={wv?.supportiveBandMessage ?? "Coaching support for your next session — not a penalty."}
    >
      <SupportLevelBadge band={sc.band} />

      <div className="grid grid-cols-2 gap-2 mt-4">
        {metrics.map((m) => (
          <div key={m.label} className="worker-card border bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-slate-500">{m.label}</p>
            <p className="text-lg font-bold text-[#0F172A]">{m.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-4 worker-card border border-emerald-200 bg-emerald-50/50 p-3">
        <h3 className="text-xs font-bold uppercase text-emerald-900">{t("what_went_well")}</h3>
        <ul className="text-sm mt-2 space-y-1">
          {(wv?.strengths ?? []).map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </section>

      <section className="worker-card border border-amber-200 bg-amber-50/50 p-3">
        <h3 className="text-xs font-bold uppercase text-amber-900">{t("what_to_improve")}</h3>
        <ul className="text-sm mt-2 space-y-1">
          {(wv?.improvementAreas ?? []).map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </section>

      <section className="worker-card border bg-[#eff6ff] p-3">
        <h3 className="text-xs font-bold uppercase text-[#1e40af]">{t("suggested_activity")}</h3>
        <p className="text-sm mt-1">{sc.supportiveRecommendations[0]}</p>
      </section>

      <section className="worker-card border p-3">
        <h3 className="text-xs font-bold uppercase">{t("supervisor_guidance")}</h3>
        <p className="text-sm text-slate-600 mt-1">Supervisor may add notes after reviewing AI insights. Continue assigned training modules.</p>
        <Link to="/worker/training" className="text-xs font-bold text-[#1e40af] mt-2 inline-block">{t("training_coaching_center")} →</Link>
      </section>

      <section className="mt-4 worker-card border p-3">
        <h3 className="text-xs font-bold uppercase mb-2">Last 3 sessions</h3>
        <EngagementTrendChart data={historyChart} />
        <p className="text-[10px] text-slate-500 mt-2">Expected improvement after completing coaching modules.</p>
      </section>

      {intel && (
        <section className="mt-4">
          <h3 className="text-xs font-bold uppercase mb-2">Your development path</h3>
          <DayTimeline
            steps={(intel.timelineReplay ?? []).map((s, i) => ({
              id: String(i),
              label: typeof s === "string" ? s : (s as { label?: string }).label ?? "Step",
              status: i === 0 ? "done" : "pending",
            }))}
          />
        </section>
      )}

      <div className="mt-4 border p-3 bg-slate-50">
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full min-h-[72px] border p-2 text-sm" placeholder="Optional note for supervisor…" />
        <button
          type="button"
          className="mt-2 w-full py-2 bg-[#1e3a5f] text-white text-xs font-bold uppercase"
          onClick={() => { updateSession(session.id, { workerComment: comment }); toast.success("Saved"); }}
        >
          Save note
        </button>
      </div>

      <Link to={`/session-explanation/${session.id}`} className="text-xs font-semibold text-[#1e40af]">Detailed AI explanation →</Link>
    </WorkerFieldLayout>
  );
}
