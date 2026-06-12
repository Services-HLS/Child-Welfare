import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AIObservationPanel, SessionRiskIndicator, SessionPlaybackViewer } from "@/components/classroom";
import { SessionScoreCard } from "@/components/classroom";

export default function StateSessionInsights() {
  const { sessionId } = useParams();
  const { sessions, getClassroomAnalytics, complaints, interventions } = useApp();
  const session = sessions.find((s) => s.id === sessionId);
  const intel = sessionId ? getClassroomAnalytics(sessionId) : null;
  const [showVideo, setShowVideo] = useState(false);

  if (!session || !intel) {
    return <div className="p-8"><Link to="/state-admin/classroom-intelligence">← State classroom intelligence</Link></div>;
  }

  const districtActions = interventions.filter((i) => i.centerId === session.metadata.centerId);

  return (
    <div className="space-y-4 pb-24 w-full max-w-none">
      <Link to="/state-admin/classroom-intelligence" className="text-xs font-semibold text-[#1e40af]">← State Classroom Intelligence</Link>
      <h1 className="text-lg font-bold">State session insights (summary)</h1>
      <p className="text-sm text-slate-600">{intel.district} · {session.metadata.centerName}</p>

      <SessionScoreCard indices={intel.indices} band={intel.band} compact />
      <AIObservationPanel summary={intel.executiveView.summary} items={[intel.executiveView.interventionHint].filter(Boolean) as string[]} />
      <SessionRiskIndicator level={intel.executiveView.riskIndicator} flagged={intel.districtAttention} />

      <div className="border border-slate-200 p-4 text-sm">
        <h3 className="text-xs font-bold uppercase mb-2">Historical comparison</h3>
        <p>OPI {intel.indices.opi}% · Engagement {intel.indices.cei}% · State uses aggregated views; raw classroom video requires explicit open.</p>
      </div>

      <div className="border border-slate-200 p-4">
        <h3 className="text-xs font-bold uppercase mb-2">District actions on record</h3>
        {districtActions.map((i) => <p key={i.id} className="text-sm py-1">{i.title} · {i.status}</p>)}
        {complaints.filter((c) => c.centerId === session.metadata.centerId && c.status !== "closed").length > 0 && (
          <p className="text-xs text-amber-800 mt-2">Open grievances correlated with classroom band in pilot analytics.</p>
        )}
      </div>

      {showVideo ? (
        <SessionPlaybackViewer sessionId={session.id} roleLabel="State official" />
      ) : (
        <button type="button" className="gov-btn-outline text-xs" onClick={() => setShowVideo(true)}>
          Open recording (restricted action)
        </button>
      )}
    </div>
  );
}
