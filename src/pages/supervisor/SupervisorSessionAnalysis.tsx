import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import {
  SessionScoreCard,
  ClassroomHeatmap,
  AIObservationPanel,
  CoachingRecommendations,
  SessionTimeline,
  SessionPlaybackViewer,
  SessionRiskIndicator,
} from "@/components/classroom";
import { ScorecardGrid, PerformanceBandBadge } from "@/components/session/PerformanceBandBadge";
import { explainSession } from "@/services/ai/explainability";
import { AIExplainabilityPanel } from "@/components/explainability/AIExplainabilityPanel";
import { toast } from "sonner";
import { ExtractedContextFromVideo } from "@/components/worker/classroom/ExtractedContextFromVideo";
import { SessionVerificationSection } from "@/components/worker/classroom/SessionVerificationSection";

export default function SupervisorSessionAnalysis() {
  const { sessionId } = useParams();
  const { sessions, getClassroomAnalytics, classroomReviews, saveSupervisorReview, user } = useApp();
  const session = sessions.find((s) => s.id === sessionId);
  const intel = sessionId ? getClassroomAnalytics(sessionId) : null;
  const review = sessionId ? classroomReviews[sessionId] : undefined;
  const [remarks, setRemarks] = useState(review?.remarks ?? "");
  const [followUp, setFollowUp] = useState(review?.followUpScheduled ?? "");
  const [assignCoach, setAssignCoach] = useState(review?.coachingAssigned ?? false);

  if (!session?.scorecard || !intel) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Session not found or analysis pending.</p>
        <Link to="/supervisor/classroom-intelligence" className="text-[#1e40af] text-sm font-semibold">← Classroom Intelligence</Link>
      </div>
    );
  }

  const sc = session.scorecard;

  return (
    <div className="space-y-4 pb-24 w-full max-w-none">
      <Link to="/supervisor/classroom-intelligence" className="text-xs font-semibold text-[#1e40af]">← Classroom Intelligence Center</Link>
      <div className="border border-slate-200 bg-white p-4">
        <p className="text-[10px] uppercase text-slate-500">Classroom review</p>
        <h1 className="text-lg font-bold">{session.metadata.workerName} · {session.metadata.centerName}</h1>
        <p className="text-xs text-slate-600">{format(new Date(session.createdAt), "PPpp")} · {session.metadata.syllabusCategory}</p>
      </div>

      <PerformanceBandBadge band={sc.band} score={sc.overallPerformanceIndex} />
      <SessionScoreCard indices={intel.indices} band={intel.band} />
      <AIObservationPanel summary={intel.operationalView.summary} confidence={intel.aiConfidence} items={intel.operationalView.actionItems} />
      <SessionRiskIndicator level={intel.executiveView.riskIndicator} flagged={intel.flagged} tags={intel.repeatedIssueTags} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase mb-2">Engagement heatmap</h3>
          <ClassroomHeatmap segments={intel.heatmap} />
        </div>
        <div className="border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase mb-2">Speech & syllabus</h3>
          <p className="text-sm">Clarity {(sc.speech.clarity * 100).toFixed(0)}% · Curriculum {(sc.syllabus.curriculumMatch * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-600 mt-2">Topics: {sc.syllabus.topicsCovered.join(", ")}</p>
        </div>
      </div>

      <ScorecardGrid scorecard={sc} />
      <CoachingRecommendations items={intel.workerView.coachingRecommendations} />
      <AIExplainabilityPanel explanation={explainSession(session)} />

      <SessionPlaybackViewer sessionId={session.id} roleLabel="Supervisor" />

      {session.extractedAnalysis?.sessionVerification &&
        session.extractedAnalysis.authenticityChecks &&
        session.extractedAnalysis.classroomEvidence &&
        session.extractedAnalysis.classroomObservationSummary && (
          <SessionVerificationSection
            verification={session.extractedAnalysis.sessionVerification}
            authenticity={session.extractedAnalysis.authenticityChecks}
            evidence={session.extractedAnalysis.classroomEvidence}
            observation={session.extractedAnalysis.classroomObservationSummary}
            timeline={session.extractedAnalysis.verificationTimeline ?? []}
          />
        )}

      {session.extractedAnalysis?.extractedContextTelugu && session.extractedAnalysis?.extractedContextEnglish && (
        <ExtractedContextFromVideo
          extractedContextTelugu={session.extractedAnalysis.extractedContextTelugu}
          extractedContextEnglish={session.extractedAnalysis.extractedContextEnglish}
          transcriptSaved
        />
      )}

      <div className="border border-slate-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase mb-2">Classroom development timeline</h3>
        <SessionTimeline steps={intel.timelineReplay} />
      </div>

      <div className="border-2 border-[#1e3a5f] bg-[#f8fafc] p-4 space-y-3">
        <h3 className="text-sm font-bold">Supervisor actions (does not edit AI scores)</h3>
        <textarea className="w-full border p-2 text-sm" rows={3} placeholder="Supportive remarks…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        <input type="date" className="border px-2 py-1 text-sm" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={assignCoach} onChange={(e) => setAssignCoach(e.target.checked)} />
          Assign coaching pathway
        </label>
        <button
          type="button"
          className="gov-btn-primary text-sm"
          onClick={() => {
            saveSupervisorReview({
              sessionId: session.id,
              supervisorId: user?.id ?? "S-204",
              remarks,
              approvedObservation: true,
              followUpScheduled: followUp || undefined,
              coachingAssigned: assignCoach,
            });
            toast.success("Observation approved · coaching queued if selected");
          }}
        >
          Approve observation & save
        </button>
      </div>
    </div>
  );
}
