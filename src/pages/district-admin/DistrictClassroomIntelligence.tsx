import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { EngagementTrendChart, ClassroomSummaryCard } from "@/components/classroom";
import { GovCard } from "@/components/gov/GovCard";
import { mockCenters } from "@/data/mockData";

export default function DistrictClassroomIntelligence() {
  const { getOperationalClassroom, classroomAnalytics, user } = useApp();
  const district = user?.district ?? "Tirupati";
  const snap = getOperationalClassroom(district);
  const highRisk = snap.centerRankings.filter((c) => c.avgOpi < 60);
  const improving = snap.centerRankings.filter((c) => c.avgOpi >= 75);

  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-xl font-bold text-[#0F172A]">District Classroom Command Center</h1>
      <p className="text-sm text-slate-600">{district} · aggregated operational intelligence (not per-recording review)</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {[
          { l: "Sessions", v: snap.totalSessions },
          { l: "Avg OPI", v: `${snap.avgOpi}%` },
          { l: "Engagement", v: `${snap.avgEngagement}%` },
          { l: "Syllabus", v: `${snap.syllabusAdherence}%` },
          { l: "Flagged", v: snap.flaggedCount },
        ].map((m) => (
          <div key={m.l} className="border bg-white p-3 border-l-4 border-l-[#1e40af]">
            <div className="text-lg font-bold">{m.v}</div>
            <div className="text-[10px] font-semibold uppercase text-slate-600">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <GovCard title="District performance trend">
          <EngagementTrendChart data={snap.centerRankings.map((c) => ({ label: c.centerName.slice(0, 8), value: c.avgOpi }))} />
        </GovCard>
        <GovCard title="Band distribution">
          <p className="text-sm">Green {snap.bandDistribution.green} · Orange {snap.bandDistribution.orange} · Red {snap.bandDistribution.red}</p>
          <p className="text-xs text-slate-600 mt-2">Coaching signals: {snap.coachingQueue} sessions</p>
        </GovCard>
      </div>

      <GovCard title="Center rankings" subtitle="Drill down to session review">
        <div className="grid sm:grid-cols-2 gap-2">
          {snap.centerRankings.map((c) => {
            const latest = Object.values(classroomAnalytics).find((a) => a.centerId === c.centerId);
            return (
              <ClassroomSummaryCard
                key={c.centerId}
                title={c.centerName}
                subtitle={`${c.sessions} sessions`}
                opi={c.avgOpi}
                band={c.avgOpi >= 75 ? "green" : c.avgOpi >= 55 ? "orange" : "red"}
                href={latest ? `/district-admin/session-review/${latest.sessionId}` : `/center-command/${c.centerId}`}
              />
            );
          })}
        </div>
      </GovCard>

      <div className="grid md:grid-cols-2 gap-4">
        <GovCard title="High-risk centers">
          {highRisk.length ? highRisk.map((c) => <p key={c.centerId} className="text-sm py-1">• {c.centerName} — OPI {c.avgOpi}%</p>) : <p className="text-sm text-slate-500">None in pilot threshold.</p>}
        </GovCard>
        <GovCard title="Improving centers">
          {improving.map((c) => <p key={c.centerId} className="text-sm py-1">• {c.centerName} — OPI {c.avgOpi}%</p>)}
        </GovCard>
      </div>

      <GovCard title="District heatmap (pilot)">
        <div className="grid grid-cols-3 gap-2">
          {mockCenters.filter((c) => c.district === district).map((c) => {
            const rank = snap.centerRankings.find((r) => r.centerId === c.id);
            const opi = rank?.avgOpi ?? 0;
            return (
              <div
                key={c.id}
                className="p-2 text-center text-xs border"
                style={{ background: `rgba(30, 64, 175, ${opi / 100})`, color: opi > 50 ? "#fff" : "#0F172A" }}
              >
                {c.name}
                <br />
                {opi}%
              </div>
            );
          })}
        </div>
      </GovCard>

      <Link to="/district-admin/interventions" className="text-sm font-semibold text-[#1e40af]">Intervention recommendations →</Link>
    </div>
  );
}
