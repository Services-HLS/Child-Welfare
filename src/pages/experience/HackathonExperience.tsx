import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { HACKATHON_NARRATION, HackathonStepId } from "@/services/demo/hackathonFlow";
import { PublicGovHeader } from "@/components/gov/PublicGovHeader";
import { Play, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/platform";

const STEP_ORDER: HackathonStepId[] = [
  "session",
  "ai_eval",
  "supervisor_review",
  "district_monitor",
  "state_track",
  "parent_view",
  "feedback",
  "complaint",
  "supervisor",
  "coaching",
  "outcomes",
  "recovery",
  "dashboard",
];

const ROLE_JOURNEYS: { role: Role; label: string; path: string; scenario?: string }[] = [
  { role: "worker", label: "Worker — session & coaching", path: "/worker", scenario: "weak_engagement" },
  { role: "beneficiary", label: "Beneficiary — meal complaint", path: "/beneficiary", scenario: "poor_meal_quality" },
  { role: "supervisor", label: "Supervisor — classroom intelligence", path: "/supervisor/classroom-intelligence", scenario: "weak_engagement" },
  { role: "district_admin", label: "District — Mission Control", path: "/district-admin/mission-control", scenario: "recovery_after_intervention" },
  { role: "state_admin", label: "State — Mission Control", path: "/state-admin/mission-control" },
];

export default function HackathonExperience() {
  const { runHackathonFlow, runScenarioById, setDemoModeActive, listScenarios } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const runFull = async () => {
    setRunning(true);
    setStep(0);
    try {
      await runHackathonFlow();
      for (let i = 0; i < STEP_ORDER.length; i++) {
        setStep(i + 1);
        await new Promise((r) => setTimeout(r, 800));
      }
      setDone(true);
      toast.success("Operating loop complete — dashboards updated");
      navigate("/center-command/AWC-TPT-01");
    } finally {
      setRunning(false);
    }
  };

  const current = STEP_ORDER[Math.min(step, STEP_ORDER.length - 1)];
  const narration = HACKATHON_NARRATION[current];

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <PublicGovHeader />
      <div className="w-full max-w-none p-6 space-y-6">
        <div className="border border-slate-200 bg-white p-5">
          <h1 className="text-2xl font-bold text-[#0F172A]">Pilot Demonstration — Hackathon Experience</h1>
          <p className="text-sm text-slate-600 mt-1">WDCW Government of Andhra Pradesh · guided operating loop</p>
        </div>

        <button
          type="button"
          onClick={runFull}
          disabled={running}
          className="w-full gov-btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {running ? "Running full journey…" : <><Play className="h-5 w-5" /> Start complete judge walkthrough</>}
        </button>

        <div className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500 mb-3">Progress {Math.round((step / STEP_ORDER.length) * 100)}%</p>
          <div className="h-2 bg-slate-100 mb-4"><div className="h-full bg-[#1e40af] transition-all" style={{ width: `${(step / STEP_ORDER.length) * 100}%` }} /></div>
          {narration && (
            <div className="border-l-4 border-[#1e40af] bg-slate-50 p-3 text-sm">{narration.title}: {narration.narrative}</div>
          )}
          <div className="mt-3 space-y-1">
            {STEP_ORDER.map((s, i) => (
              <div key={s} className={cn("flex items-center gap-2 text-xs", i < step ? "text-emerald-800" : "text-slate-500")}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 border rounded-full" />}
                {HACKATHON_NARRATION[s].title}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold mb-3">Guided journeys by role</h2>
          <div className="space-y-2">
            {ROLE_JOURNEYS.map((j) => (
              <button
                key={j.role}
                type="button"
                onClick={async () => {
                  if (j.scenario) await runScenarioById(j.scenario);
                  setDemoModeActive(true);
                  navigate(j.path);
                  toast.success(j.label);
                }}
                className="w-full text-left border px-3 py-2 text-sm hover:bg-slate-50 flex justify-between"
              >
                <span>{j.label}</span>
                <span className="text-[#1e40af] text-xs font-semibold">Open →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold mb-3">Scenarios</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {listScenarios().map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={async () => {
                  await runScenarioById(s.id);
                  setDemoModeActive(true);
                  toast.success(s.title);
                }}
                className="w-full text-left border px-3 py-2 text-xs hover:bg-slate-50"
              >
                <span className="font-semibold">{s.title}</span>
                <span className="block text-slate-500">{s.description}</span>
              </button>
            ))}
          </div>
        </div>

        {done && (
          <div className="gov-notice text-sm">
            Walkthrough complete. Open{" "}
            <Link to="/center-command/AWC-TPT-01" className="font-semibold text-[#1e40af]">Center Command</Link>,{" "}
            <Link to="/impact" className="font-semibold text-[#1e40af]">Impact</Link>, or{" "}
            <Link to="/state-admin/mission-control" className="font-semibold text-[#1e40af]">Mission Control</Link>.
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Link to="/impact" className="text-[#1e40af]">Impact</Link>
          <Link to="/public/transparency" className="text-[#1e40af]">Transparency</Link>
          <Link to="/analytics/aei" className="text-[#1e40af]">AEI Analytics</Link>
          <Link to="/" className="text-[#1e40af] flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Login</Link>
        </div>
      </div>
    </div>
  );
}
