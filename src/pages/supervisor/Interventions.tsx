import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { InterventionBoard } from "@/components/interventions/InterventionBoard";

export default function Interventions() {
  const { refreshInterventions } = useApp();
  useEffect(() => { refreshInterventions(); }, [refreshInterventions]);
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">Intervention Operating System</h1>
      <p className="text-sm text-slate-500">Training, coaching, infrastructure, visits, resources & follow-up plans</p>
      <InterventionBoard scope="supervisor" />
    </div>
  );
}
