import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useClassroomSessions } from "@/hooks/useClassroomSessions";
import {
  ClassroomSummaryCard,
  EngagementTrendChart,
  SessionRiskIndicator,
  SessionComparisonMode,
} from "@/components/classroom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GovCard } from "@/components/gov/GovCard";

export default function SupervisorClassroomIntelligence() {
  const { getOperationalClassroom, compareSessions } = useApp();
  const { withIntel, workers, centers, filters } = useClassroomSessions("Tirupati");
  const snap = getOperationalClassroom("Tirupati");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const drawer = withIntel.find((x) => x.session.id === drawerId);
  const comparison =
    compareA && compareB ? compareSessions(compareA, compareB) : null;

  return (
    <div className="space-y-4 pb-24">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-[#0F172A]">Classroom Intelligence Center</h1>
        <p className="text-sm text-slate-600">Operational coaching dashboard · Tirupati District</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Sessions", v: snap.totalSessions },
          { l: "Avg OPI", v: `${snap.avgOpi}%` },
          { l: "Coaching queue", v: snap.coachingQueue },
          { l: "Flagged", v: snap.flaggedCount },
        ].map((m) => (
          <div key={m.l} className="border border-slate-200 bg-white p-3 border-l-4 border-l-[#1e40af]">
            <div className="text-xl font-bold">{m.v}</div>
            <div className="text-xs font-semibold text-slate-600">{m.l}</div>
          </div>
        ))}
      </div>

      <GovCard title="Filters" subtitle="Date · center · worker · syllabus · band">
        <div className="flex flex-wrap gap-2 text-xs">
          <input type="date" className="border px-2 py-1" value={filters.dateFrom} onChange={(e) => filters.setDateFrom(e.target.value)} />
          <select className="border px-2 py-1" value={filters.centerId} onChange={(e) => filters.setCenterId(e.target.value)}>
            <option value="">All centers</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="border px-2 py-1" value={filters.workerId} onChange={(e) => filters.setWorkerId(e.target.value)}>
            <option value="">All workers</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select className="border px-2 py-1" value={filters.band} onChange={(e) => filters.setBand(e.target.value as "" | "green" | "orange" | "red")}>
            <option value="">All bands</option>
            <option value="green">Green</option>
            <option value="orange">Orange</option>
            <option value="red">Red</option>
          </select>
        </div>
      </GovCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <GovCard title="Band distribution">
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-700">Green {snap.bandDistribution.green}</span>
            <span className="text-amber-700">Orange {snap.bandDistribution.orange}</span>
            <span className="text-rose-700">Red {snap.bandDistribution.red}</span>
          </div>
          <EngagementTrendChart
            data={snap.workerTrends.slice(0, 6).map((w, i) => ({ label: w.workerName.split(" ")[0], value: w.latestOpi }))}
          />
        </GovCard>
        <GovCard title="Repeated issues">
          {snap.repeatedIssues.length ? (
            <ul className="text-sm space-y-1">{snap.repeatedIssues.map((t) => <li key={t}>• {t}</li>)}</ul>
          ) : (
            <p className="text-sm text-slate-500">No repeated patterns in pilot data.</p>
          )}
        </GovCard>
      </div>

      <GovCard title="Session comparison" subtitle="Same worker — before vs after coaching">
        <div className="flex flex-wrap gap-2 mb-3">
          <select className="border text-xs px-2 py-1" value={compareA} onChange={(e) => setCompareA(e.target.value)}>
            <option value="">Before session</option>
            {withIntel.map(({ session }) => (
              <option key={session.id} value={session.id}>{session.id} · OPI</option>
            ))}
          </select>
          <select className="border text-xs px-2 py-1" value={compareB} onChange={(e) => setCompareB(e.target.value)}>
            <option value="">After session</option>
            {withIntel.map(({ session }) => (
              <option key={session.id} value={session.id}>{session.id}</option>
            ))}
          </select>
        </div>
        {comparison && <SessionComparisonMode result={comparison} />}
      </GovCard>

      <GovCard title="Sessions" subtitle="Actionable intelligence — open for full review">
        <div className="grid sm:grid-cols-2 gap-2">
          {withIntel.map(({ session, intel }) =>
            intel ? (
              <ClassroomSummaryCard
                key={session.id}
                title={session.metadata.workerName}
                subtitle={session.metadata.centerName}
                opi={intel.indices.opi}
                band={intel.band}
                meta={intel.operationalView.summary.slice(0, 60) + "…"}
                href={`/supervisor/session-analysis/${session.id}`}
              />
            ) : null
          )}
        </div>
      </GovCard>

      <Sheet open={!!drawerId} onOpenChange={() => setDrawerId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {drawer?.intel && (
            <>
              <SheetHeader>
                <SheetTitle>{drawer.session.metadata.workerName}</SheetTitle>
              </SheetHeader>
              <SessionRiskIndicator level={drawer.intel.executiveView.riskIndicator} flagged={drawer.intel.flagged} tags={drawer.intel.repeatedIssueTags} />
              <Link to={`/supervisor/session-analysis/${drawer.session.id}`} className="text-sm font-semibold text-[#1e40af] mt-4 inline-block">
                Full classroom review →
              </Link>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
