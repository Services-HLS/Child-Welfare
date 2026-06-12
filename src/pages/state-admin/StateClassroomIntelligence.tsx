import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { EngagementTrendChart } from "@/components/classroom";
import { GovCard } from "@/components/gov/GovCard";

export default function StateClassroomIntelligence() {
  const { getExecutiveClassroom, classroomAnalytics } = useApp();
  const exec = getExecutiveClassroom();
  const sample = Object.values(classroomAnalytics)[0];

  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-xl font-bold text-[#0F172A]">State Classroom Intelligence Center</h1>
      <p className="text-sm text-slate-600">Executive dashboard · statewide operational view (details on drill-down only)</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Sessions recorded", v: exec.totalSessionsRecorded },
          { l: "State avg OPI", v: `${exec.stateAvgOpi}%` },
          { l: "Training impact", v: `${exec.trainingImpactPct}%` },
          { l: "Intervention effectiveness", v: `${exec.interventionEffectivenessPct}%` },
        ].map((m) => (
          <div key={m.l} className="border bg-white p-4 border-l-4 border-l-[#1e3a5f]">
            <div className="text-2xl font-bold">{m.v}</div>
            <div className="text-xs font-semibold text-slate-600">{m.l}</div>
          </div>
        ))}
      </div>

      <GovCard title="District comparison" subtitle="Rankings — click district sample for insights">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase text-slate-500">
                <th className="py-2">District</th>
                <th>Sessions</th>
                <th>Avg OPI</th>
                <th>Band</th>
              </tr>
            </thead>
            <tbody>
              {exec.districtComparison.map((d) => (
                <tr key={d.district} className="border-b border-slate-100">
                  <td className="py-2 font-semibold">{d.district}</td>
                  <td>{d.sessions}</td>
                  <td>{d.avgOpi}%</td>
                  <td className="capitalize">{d.band}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sample && (
          <Link to={`/state-admin/session-insights/${sample.sessionId}`} className="text-xs font-semibold text-[#1e40af] mt-3 inline-block">
            Sample session insights (drill-down) →
          </Link>
        )}
      </GovCard>

      <GovCard title="Classroom quality trend">
        <EngagementTrendChart data={exec.engagementTrend.map((v, i) => ({ label: `S${i + 1}`, value: v }))} />
      </GovCard>

      <div className="grid md:grid-cols-2 gap-4">
        <GovCard title="Districts requiring attention">
          {exec.districtsNeedingAttention.length ? (
            exec.districtsNeedingAttention.map((d) => <p key={d} className="text-sm">• {d}</p>)
          ) : (
            <p className="text-sm text-slate-500">No districts below threshold in pilot.</p>
          )}
        </GovCard>
        <GovCard title="Districts improving after interventions">
          {exec.districtsImproving.map((d) => (
            <p key={d} className="text-sm text-emerald-800">• {d}</p>
          ))}
        </GovCard>
      </div>

      <p className="text-xs text-slate-600">{exec.grievanceCorrelation}</p>
      <Link to="/state-admin/mission-control" className="gov-btn-outline text-sm inline-block">Mission Control →</Link>
    </div>
  );
}
