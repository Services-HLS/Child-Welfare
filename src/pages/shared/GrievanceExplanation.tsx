import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { explainGrievance } from "@/services/ai/explainability";
import { ExplainabilityFramework } from "@/components/explainability";

export default function GrievanceExplanation() {
  const { id } = useParams();
  const { complaints } = useApp();
  const c = complaints.find((x) => x.id === id);
  if (!c) return <div className="p-10">Grievance not found</div>;
  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to="/state-admin/complaints" className="text-xs font-black uppercase text-blue-600">← Grievances</Link>
      <h1 className="text-2xl font-black uppercase">Grievance AI Explanation</h1>
      <p className="text-sm text-slate-500">{c.title} · {c.centerName}</p>
      <ExplainabilityFramework explanation={explainGrievance(c)} />
    </div>
  );
}
