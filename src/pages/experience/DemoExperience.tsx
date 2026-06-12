import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { DemoJourneyId } from "@/types/intelligence";
import { Play, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { roleHomePath } from "@/lib/rolePaths";
import { cn } from "@/lib/utils";

const journeys: {
  id: DemoJourneyId;
  title: string;
  desc: string;
  narrative: string;
  loginAs: import("@/types/platform").Role;
  path?: string;
}[] = [
  { id: "worker", title: "Worker Journey", desc: "Session → AI evaluation → coaching", narrative: "Lakshmi records preschool; AI assigns supportive orange-band coaching.", loginAs: "worker" },
  { id: "beneficiary", title: "Beneficiary Journey", desc: "Feedback → grievance → survey", narrative: "Sunita reports meal quality; platform classifies, routes, and schedules satisfaction survey.", loginAs: "beneficiary" },
  { id: "parent", title: "Parent Journey", desc: "Same as beneficiary demo", narrative: "Parent voice drives omnichannel intake and transparent closure.", loginAs: "beneficiary" },
  { id: "complaint", title: "Complaint Journey", desc: "End-to-end grievance resolution", narrative: "Worker review → supervisor → resolution → beneficiary confirmation.", loginAs: "supervisor", path: "/supervisor/complaints" },
  { id: "coaching", title: "Coaching Journey", desc: "Weak engagement → training modules", narrative: "AI explains body-language & engagement; worker receives non-punitive coaching.", loginAs: "worker", path: "/worker/training" },
  { id: "supervisor", title: "Supervisor Journey", desc: "Interventions & child outcomes", narrative: "Repeat complaints trigger district-ready intervention queue.", loginAs: "supervisor", path: "/supervisor/interventions" },
  { id: "state_admin", title: "State Admin Journey", desc: "Mission Control & story", narrative: "Executive sees live KPIs, CWI+SQI, and AI narrative briefing.", loginAs: "state_admin", path: "/state-admin/mission-control" },
];

export default function DemoExperience() {
  const { runJourney, login, setDemoModeActive, demoModeActive } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const start = async (j: typeof journeys[0]) => {
    setLoading(j.id);
    setActiveId(j.id);
    try {
      await login(j.loginAs, { phone: "9876543210", password: "demo1234" });
      await runJourney(j.id);
      setDemoModeActive(true);
      setCompleted((p) => new Set(p).add(j.id));
      toast.success(j.title, { description: j.narrative });
      navigate(j.path ?? roleHomePath(j.loginAs));
    } finally {
      setLoading(null);
    }
  };

  const progress = Math.round((completed.size / journeys.length) * 100);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="w-full max-w-none space-y-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-black uppercase">Hackathon Demo Experience</h1>
            <p className="text-slate-400 text-xs mt-1">Auto-generates sessions, grievances, AI outputs & dashboards</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between text-[10px] font-black uppercase mb-2">
            <span>Walkthrough progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {demoModeActive && (
          <div className="rounded-xl bg-emerald-900/40 border border-emerald-500/30 px-4 py-2 text-xs font-bold uppercase flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Demo data active in IndexedDB
          </div>
        )}
        <div className="space-y-3">
          {journeys.map((j) => (
            <button
              key={j.id}
              disabled={!!loading}
              onClick={() => start(j)}
              className={cn(
                "w-full rounded-2xl border p-5 text-left transition flex justify-between items-start gap-4",
                activeId === j.id ? "border-blue-400 bg-blue-950/40" : "border-white/10 bg-white/5 hover:bg-white/10",
                completed.has(j.id) && "border-emerald-500/30"
              )}
            >
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {j.title}
                  {completed.has(j.id) && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </div>
                <div className="text-xs text-slate-400 mt-1">{j.desc}</div>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed italic">{j.narrative}</p>
              </div>
              {loading === j.id ? <span className="text-[10px] uppercase animate-pulse shrink-0">Loading…</span> : <Play className="h-5 w-5 text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
        <a href="/experience/scenarios" className="text-xs font-black uppercase text-blue-400">Scenario generator →</a>
      </div>
    </div>
  );
}
