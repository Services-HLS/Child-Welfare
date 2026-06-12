import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { InterventionBoard } from "@/components/interventions/InterventionBoard";

export default function DistrictInterventions() {
  const { refreshInterventions } = useApp();
  useEffect(() => { refreshInterventions(); }, [refreshInterventions]);
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">District Intervention Operating System</h1>
      <p className="text-sm text-slate-500">Approve, activate, and measure cross-cutting interventions</p>
      <InterventionBoard scope="district" />
    </div>
  );
}
