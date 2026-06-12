import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { explainRisk } from "@/services/ai/explainability";
import { ExplainabilityFramework } from "@/components/explainability";

export default function RiskExplanation() {
  const { id } = useParams();
  const { childRiskSignals } = useApp();
  const signal = childRiskSignals.find((r) => r.id === id);
  if (!signal) return <div className="p-10">Risk signal not found</div>;
  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to="/supervisor/child-outcomes" className="text-xs font-black uppercase text-blue-600">← Child outcomes</Link>
      <h1 className="text-2xl font-black uppercase">Child Risk Signal Explanation</h1>
      <ExplainabilityFramework explanation={explainRisk(signal)} />
      <Link to={`/center-timeline/${signal.centerId}`} className="text-xs font-black uppercase text-teal-600">View center timeline →</Link>
    </div>
  );
}
