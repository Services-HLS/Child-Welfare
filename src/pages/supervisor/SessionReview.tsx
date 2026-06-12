import { useApp } from "@/context/AppContext";
import { ScorecardGrid, PerformanceBandBadge } from "@/components/session/PerformanceBandBadge";
import { format } from "date-fns";

export default function SupervisorSessionReview() {
  const { sessions } = useApp();
  const district = sessions.filter((s) => s.metadata.centerId.startsWith("AWC-TPT") && s.scorecard);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">Session Review</h1>
      <p className="text-sm text-slate-500">AI findings · body language · child engagement · syllabus compliance</p>
      {district.map((s) => (
        <div key={s.id} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="font-black">{s.metadata.workerName}</div>
              <div className="text-xs text-slate-500">{format(new Date(s.metadata.timestamp), "PPp")}</div>
            </div>
            {s.scorecard && <PerformanceBandBadge band={s.scorecard.band} score={s.scorecard.overallPerformanceIndex} />}
          </div>
          {s.scorecard && <ScorecardGrid scorecard={s.scorecard} />}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase text-slate-500">
            <span>Attentive: {s.scorecard?.childEngagementDetail.attentive}</span>
            <span>Participating: {s.scorecard?.childEngagementDetail.participating}</span>
            <span>Distracted: {s.scorecard?.childEngagementDetail.distracted}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
