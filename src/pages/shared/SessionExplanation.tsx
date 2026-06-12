import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { explainSession } from "@/services/ai/explainability";
import { ExplainabilityFramework } from "@/components/explainability";
import { PerformanceBandBadge } from "@/components/session/PerformanceBandBadge";

export default function SessionExplanation() {
  const { id } = useParams();
  const { sessions } = useApp();
  const session = sessions.find((s) => s.id === id) ?? sessions[0];
  if (!session) return <div className="p-10">Session not found</div>;
  const explanation = explainSession(session);

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to="/worker/session-history" className="text-xs font-black uppercase text-blue-600">← Sessions</Link>
      <h1 className="text-2xl font-black uppercase">Session AI Explanation</h1>
      {session.scorecard && <PerformanceBandBadge band={session.scorecard.band} score={session.scorecard.overallPerformanceIndex} />}
      <ExplainabilityFramework explanation={explanation} />
      {session.scorecard?.band === "orange" && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-4 border border-amber-100">
          <strong>Orange status</strong> means improvement is recommended — not punitive. Focus on child participation and syllabus gaps listed above.
        </p>
      )}
      {session.scorecard?.band === "red" && (
        <p className="text-sm text-rose-800 bg-rose-50 rounded-xl p-4 border border-rose-100">
          <strong>Red band</strong> triggers supportive coaching. Complete assigned training modules and request supervisor observation.
        </p>
      )}
    </div>
  );
}
