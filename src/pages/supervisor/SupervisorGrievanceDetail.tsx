import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { GrievanceInvestigationReport } from "@/components/supervisor/GrievanceInvestigationReport";

export default function SupervisorGrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { complaints } = useApp();
  const c = complaints.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Grievance not found.</p>
        <Link to="/supervisor" className="text-sm font-bold text-[#1e40af]">Back to Investigation Command</Link>
      </div>
    );
  }

  return <GrievanceInvestigationReport complaint={c} />;
}
