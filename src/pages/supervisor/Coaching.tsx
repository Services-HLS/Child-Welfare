import { useApp } from "@/context/AppContext";
import { TRAINING_MODULES } from "@/data/mockSessions";
import { PerformanceBandBadge } from "@/components/session/PerformanceBandBadge";
import { toast } from "sonner";

export default function SupervisorCoaching() {
  const { sessions, assignCoaching, user, coachingAssignments } = useApp();
  const districtSessions = sessions.filter((s) => s.metadata.centerId.startsWith("AWC-TPT") && s.scorecard);
  const needsCoaching = districtSessions.filter((s) => s.scorecard?.band !== "green");

  const assign = (workerId: string, workerName: string, centerId: string) => {
    assignCoaching({
      workerId,
      workerName,
      centerId,
      supervisorId: user?.id ?? "S-204",
      moduleIds: ["TM-COACH-03", "TM-MENTOR-01"],
      notes: "Supervisor assigned peer coaching pathway — focus on engagement",
      dueAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    });
    toast.success("Coaching task assigned");
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">Coaching & Development Center</h1>
      <p className="text-sm text-slate-500">Approve AI recommendations · assign tasks · track improvement</p>
      <div className="text-[10px] font-black uppercase text-slate-400">{coachingAssignments.length} active assignments</div>
      <div className="space-y-4">
        {needsCoaching.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <div className="font-black">{s.metadata.workerName}</div>
                <div className="text-xs text-slate-500">{s.metadata.centerName}</div>
              </div>
              {s.scorecard && <PerformanceBandBadge band={s.scorecard.band} score={s.scorecard.overallPerformanceIndex} />}
            </div>
            <ul className="text-xs text-slate-600 mt-3 space-y-1">
              {s.scorecard?.supportiveRecommendations.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
            <button
              onClick={() => assign(s.metadata.workerId, s.metadata.workerName, s.metadata.centerId)}
              className="mt-4 rounded-lg bg-blue-600 text-white px-4 py-2 text-[10px] font-black uppercase"
            >
              Assign coaching modules
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-slate-50 p-5">
        <h3 className="text-xs font-black uppercase mb-2">Module library</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">{TRAINING_MODULES.slice(0, 4).map((m) => <div key={m.id} className="bg-white p-2 rounded border">{m.title}</div>)}</div>
      </div>
    </div>
  );
}
