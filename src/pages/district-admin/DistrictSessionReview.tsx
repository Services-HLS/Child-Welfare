import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { SessionScoreCard, AIObservationPanel, SessionRiskIndicator } from "@/components/classroom";
import { GovCard } from "@/components/gov/GovCard";

export default function DistrictSessionReview() {
  const { sessionId } = useParams();
  const { sessions, getClassroomAnalytics, complaints, feedback, interventions } = useApp();
  const session = sessions.find((s) => s.id === sessionId);
  const intel = sessionId ? getClassroomAnalytics(sessionId) : null;

  if (!session || !intel) {
    return <div className="p-8"><Link to="/district-admin/classroom-intelligence">← District classroom command</Link></div>;
  }

  const centerCmp = complaints.filter((c) => c.centerId === session.metadata.centerId);
  const centerFb = feedback.filter((f) => f.centerId === session.metadata.centerId).slice(0, 3);
  const centerInt = interventions.filter((i) => i.centerId === session.metadata.centerId);

  return (
    <div className="space-y-4 pb-24 w-full max-w-none">
      <Link to="/district-admin/classroom-intelligence" className="text-xs font-semibold text-[#1e40af]">← District Classroom Command</Link>
      <h1 className="text-lg font-bold">District session investigation</h1>
      <p className="text-sm text-slate-600">{session.metadata.centerName} · {session.metadata.workerName}</p>

      <SessionScoreCard indices={intel.indices} band={intel.band} />
      <AIObservationPanel title="Summarized AI findings" summary={intel.executiveView.summary} confidence={intel.aiConfidence} />
      <SessionRiskIndicator level={intel.executiveView.riskIndicator} tags={intel.repeatedIssueTags} />

      <GovCard title="Grievance linkage">
        {centerCmp.length ? centerCmp.map((c) => (
          <Link key={c.id} to={`/grievance-explanation/${c.id}`} className="block text-sm text-[#1e40af] py-1">{c.title} · {c.status}</Link>
        )) : <p className="text-sm text-slate-500">No linked grievances.</p>}
      </GovCard>

      <GovCard title="Beneficiary feedback correlation">
        {centerFb.map((f) => <p key={f.id} className="text-sm">★{f.rating} {f.text.slice(0, 80)}</p>)}
      </GovCard>

      <GovCard title="Intervention history">
        {centerInt.map((i) => <p key={i.id} className="text-sm py-1">{i.title} · {i.status}</p>)}
      </GovCard>

      <div className="gov-notice text-sm">
        <strong>District action recommendation:</strong>{" "}
        {intel.flagged
          ? "Schedule district coaching visit within 7 days; monitor next two sessions for engagement recovery."
          : "Maintain current improvement loop; share session practices at district cluster meeting."}
      </div>
    </div>
  );
}
