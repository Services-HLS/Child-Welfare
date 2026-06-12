import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useTraining } from "@/context/worker/hooks";
import { useTrainingProgress } from "@/context/worker/TrainingProgressContext";
import { TRAINING_MODULES } from "@/data/mockSessions";
import { getModulesByIds } from "@/services/ai/session-analysis/training-recommendations";
import { buildTrainingCourseContent } from "@/data/trainingCourseContent";
import { TrainingModuleCard } from "@/components/worker/training/TrainingModuleCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GraduationCap, Sparkles, UserCheck, TrendingUp, Brain, Activity, Award } from "lucide-react";

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Assigned",
    assigned: "Assigned",
    in_progress: "In Progress",
    awaiting_practice: "Awaiting Practice",
    submitted: "Submitted",
    completed: "Completed",
    improved: "Improved",
  };
  return map[status] ?? status;
}

export default function WorkerTraining() {
  const { t, user, sessions, classroomAnalytics, getClassroomAnalytics } = useApp();
  const { recommendations, coaching } = useTraining();
  const { getProgress, loaded: progressLoaded, sectionProgressPercent: pctFn } = useTrainingProgress();

  const workerId = user?.workerId ?? user?.id;

  const aiRecs = recommendations.filter((r) => r.assignedBy !== "supervisor" && r.status !== "completed" && r.status !== "improved");
  const supervisorRecs = recommendations.filter((r) => r.assignedBy === "supervisor");
  const completedRecs = recommendations.filter((r) => r.status === "completed" || r.status === "improved");

  const assignedModuleIds = [...new Set(recommendations.flatMap((r) => r.moduleIds))];
  const coachingModuleIds = coaching.flatMap((c) => c.moduleIds);
  const allModuleIds = [...new Set([...assignedModuleIds, ...coachingModuleIds, "TM-STORY-01"])];
  const modules = getModulesByIds(allModuleIds.length ? allModuleIds : ["TM-STORY-01", "TM-BEST-01"]);

  const stats = useMemo(() => {
    const assigned = recommendations.filter((r) => r.status !== "completed" && r.status !== "improved").length + coaching.length;
    const completed = completedRecs.length;
    const pending = assigned;
    let totalPct = 0;
    let count = 0;
    modules.forEach((m) => {
      const p = workerId ? getProgress(m.id) : null;
      if (p) {
        totalPct += pctFn(p.completedSections);
        count++;
      }
    });
    const avgProgress = count ? Math.round(totalPct / count) : 0;
    return { assigned, completed, pending, avgProgress };
  }, [recommendations, coaching, completedRecs, modules, getProgress, workerId, pctFn]);

  const trendData = useMemo(() => {
    const pts = sessions
      .filter((s) => s.scorecard && s.metadata.workerId === workerId)
      .slice(0, 5)
      .reverse()
      .map((s, i) => ({
        label: `S${i + 1}`,
        engagement: Math.round((s.scorecard?.childEngagement ?? 0.7) * 100),
      }));
    if (pts.length < 2) {
      return [
        { label: "Before", engagement: 68 },
        { label: "After training", engagement: 82 },
      ];
    }
    return pts;
  }, [sessions, workerId]);

  const latestSession = useMemo(
    () =>
      sessions
        .filter((s) => s.metadata.workerId === workerId && s.extractedAnalysis)
        .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime())[0] ?? null,
    [sessions, workerId]
  );

  const latestIntel = latestSession ? getClassroomAnalytics(latestSession.id) ?? classroomAnalytics[latestSession.id] : null;

  const whyReasons: string[] = useMemo(() => {
    const reasons: string[] = [];
    const ex = latestSession?.extractedAnalysis;
    if (ex) {
      if (ex.engagementPercent < 70) reasons.push("Child engagement low in recent classroom video");
      if (ex.participationRate < 0.6) reasons.push("Few children actively participating in activities");
      if (ex.interactionLevel < 0.6) reasons.push("Limited teacher–child interaction observed");
      if (ex.classroomEnergy < 0.5) reasons.push("Classroom energy appears low or static");
    }
    if (latestIntel) {
      if (latestIntel.operationalView.engagementTrend === "down") reasons.push("Engagement trend decreasing across sessions");
      if (latestIntel.operationalView.coachingQueuePriority === "high") reasons.push("Session flagged for high coaching priority");
    }
    if (stats.assigned === 0 && reasons.length === 0) {
      reasons.push("Platform always offers at least one self-learning module for continuous improvement.");
    }
    return reasons.slice(0, 4);
  }, [latestSession, latestIntel, stats.assigned]);

  const renderCard = (
    moduleId: string,
    assignedBy: "ai" | "supervisor",
    recId?: string,
    reason?: string,
    dueAt?: string,
    recStatus?: string,
    sessionId?: string
  ) => {
    const mod = modules.find((m) => m.id === moduleId) ?? TRAINING_MODULES.find((m) => m.id === moduleId);
    if (!mod) return null;
    const sess = sessions.find((s) => s.id === sessionId);
    const course = buildTrainingCourseContent(moduleId, { session: sess, reason });
    const progress = getProgress(moduleId);
    return (
      <TrainingModuleCard
        key={`${moduleId}-${recId ?? "lib"}`}
        module={mod}
        assignedBy={assignedBy}
        relatedSessionLabel={course.context.relatedSessionLabel}
        expectedImpact={course.expectedImpact}
        dueAt={dueAt}
        statusLabel={statusLabel(recStatus ?? progress?.lifecycleStatus ?? "assigned")}
        progress={progress}
        recommendationId={recId}
      />
    );
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      <div className="border-l-4 border-[#1e3a5f] bg-white p-4 rounded-r-lg shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#1e3a5f]" />
          <h1 className="text-xl font-bold text-[#0F172A]">AI Personalized Coaching Center</h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Government Learning & Coaching Platform — linked to your classroom sessions, attendance, and growth journey.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Assigned Modules", value: stats.assigned, color: "text-[#1e40af]" },
          { label: "Completed", value: stats.completed, color: "text-emerald-700" },
          { label: "Pending", value: stats.pending, color: "text-amber-700" },
          { label: "Avg. Progress", value: `${stats.avgProgress}%`, color: "text-indigo-700" },
        ].map((s) => (
          <div key={s.label} className="worker-card p-4 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{!progressLoaded ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Why am I seeing this? */}
      <section className="worker-card p-4">
        <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-purple-600" /> Why am I seeing this?
        </h2>
        {whyReasons.length === 0 ? (
          <p className="text-sm text-slate-500">
            Upload a classroom storytelling video and take attendance from it to let AI observe your teaching style. The
            system will then generate personalized coaching hints here.
          </p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            {whyReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="worker-card p-4 w-full min-w-0">
        <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4" /> Improvement Trend
        </h3>
        <div className="w-full min-h-[180px]" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#1e40af" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-blue-600" /> AI-generated coaching from classroom observations & attendance
        </h2>
        <div className="space-y-3">
          {aiRecs.length === 0 && (
            <p className="text-sm text-slate-500">
              Upload at least one preschool storytelling video and confirm AI attendance to receive personalized
              coaching modules such as Storytelling, Child Engagement, and Classroom Movement.
            </p>
          )}
          {aiRecs.flatMap((rec) =>
            rec.moduleIds.map((mid) =>
              renderCard(mid, "ai", rec.id, rec.reason, rec.dueAt, rec.status, rec.sessionId)
            )
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-3">
          <UserCheck className="h-4 w-4 text-indigo-600" /> Supervisor-assigned
        </h2>
        <div className="space-y-3">
          {coaching.length === 0 && supervisorRecs.length === 0 && (
            <p className="text-sm text-slate-500">No supervisor coaching assignments yet.</p>
          )}
          {coaching.map((c) =>
            c.moduleIds.map((mid) => renderCard(mid, "supervisor", undefined, c.notes, c.dueAt, c.status))
          )}
          {supervisorRecs.flatMap((rec) =>
            rec.moduleIds.map((mid) =>
              renderCard(mid, "supervisor", rec.id, rec.reason, rec.dueAt, rec.status, rec.sessionId)
            )
          )}
        </div>
      </section>

      {completedRecs.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase text-slate-500 mb-3">Completed & improved</h2>
          <div className="space-y-3">
            {completedRecs.flatMap((rec) =>
              rec.moduleIds.map((mid) => {
                const mod = modules.find((m) => m.id === mid);
                if (!mod) return null;
                return (
                  <TrainingModuleCard
                    key={`done-${rec.id}-${mid}`}
                    module={mod}
                    assignedBy={rec.assignedBy ?? "ai"}
                    expectedImpact="Improvement tracked in growth journey"
                    statusLabel={statusLabel(rec.status)}
                    progress={getProgress(mid)}
                    recommendationId={rec.id}
                  />
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Growth Journey & Badges */}
      <section className="grid lg:grid-cols-3 gap-3">
        <div className="worker-card p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-700" /> Growth Journey Snapshot
          </h2>
          <p className="text-xs text-slate-600">
            Teaching quality, child engagement, and training completion are tracked across your verified classroom
            sessions.
          </p>
          <ul className="text-xs text-slate-700 space-y-1">
            <li>• Teaching Quality: driven by classroom AI scorecards</li>
            <li>• Attendance Quality: boosted when AI attendance summaries are saved</li>
            <li>• Engagement: based on child participation trends</li>
            <li>• Training Hours: time spent in modules and practice mode</li>
          </ul>
        </div>
        <div className="worker-card p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" /> Badges (demo)
          </h2>
          <ul className="text-xs text-slate-700 space-y-1">
            <li>🏅 <strong>Storytelling Star</strong> — high storytelling quality across 3 sessions</li>
            <li>🏅 <strong>Attendance Champion</strong> — consistent AI-verified attendance submissions</li>
            <li>🏅 <strong>Classroom Improver</strong> — engagement trend moving up after training</li>
          </ul>
          <p className="text-[11px] text-slate-500">
            Badges are driven by classroom analytics and completion of recommended modules.
          </p>
        </div>
        <div className="worker-card p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" /> Practice mode (30 sec demo)
          </h2>
          <p className="text-xs text-slate-600">
            Record a short 30-second practice storytelling clip in the Session Recording workspace. AI compares it
            against your earlier sessions and estimates an improvement percentage.
          </p>
          <p className="text-xs text-slate-700">
            Example: <strong>Improvement: +12%</strong> child engagement after completing the Child Participation module.
          </p>
        </div>
      </section>
    </div>
  );
}
