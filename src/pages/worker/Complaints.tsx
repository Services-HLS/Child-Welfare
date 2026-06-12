import { WorkerFieldLayout } from "@/components/worker/WorkerFieldLayout";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";

export default function WorkerComplaints() {
  const { t } = useApp();
  return (
    <WorkerFieldLayout
      title={t("assigned_issues_responses")}
      subtitle="Public citizen grievances are handled by supervisors — not Anganwadi workers."
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-slate-800 space-y-3">
        <p className="font-bold text-[#1e3a5f]">Your role: service delivery only</p>
        <p>
          Attendance, preschool sessions, activity uploads, and classroom evidence stay on your dashboard.
          Citizen complaints with photos, voice, and OCR route directly to the{" "}
          <strong>Supervisor Public Grievance Center</strong>.
        </p>
        <p className="text-xs text-slate-600">
          If a parent asks about a grievance, direct them to <strong>My Requests</strong> on the public portal or the supervisor at the mandal office.
        </p>
        <Link to="/worker/activities" className="inline-block text-xs font-bold text-[#1e40af]">
          Go to service delivery →
        </Link>
      </div>
    </WorkerFieldLayout>
  );
}
