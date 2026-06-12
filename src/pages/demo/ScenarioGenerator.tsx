import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { toast } from "sonner";

export default function ScenarioGenerator() {
  const { listScenarios, runScenarioById, setDemoModeActive } = useApp();
  const navigate = useNavigate();
  const scenarios = listScenarios();

  const run = async (id: string) => {
    await runScenarioById(id);
    setDemoModeActive(true);
    toast.success("Scenario populated — check dashboards & timelines");
    navigate("/supervisor");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-none space-y-6">
        <h1 className="text-2xl font-black uppercase flex items-center gap-2"><Zap className="h-6 w-6 text-amber-500" /> Scenario Generator</h1>
        <p className="text-sm text-slate-500">Instant realistic government use cases for hackathon judges</p>
        {scenarios.map((s) => (
          <div key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm flex justify-between items-start gap-4">
            <div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{s.description}</p>
            </div>
            <button onClick={() => run(s.id)} className="shrink-0 rounded-xl bg-[#0F172A] text-white px-4 py-2 text-[10px] font-black uppercase">Run</button>
          </div>
        ))}
        <a href="/experience/demo" className="text-xs font-black uppercase text-blue-600">← Guided demo</a>
      </div>
    </div>
  );
}
