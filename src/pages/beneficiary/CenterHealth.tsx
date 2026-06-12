import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useParentPortal } from "@/hooks/useParentPortal";
import { buildCenterGovSummary } from "@/services/beneficiary/parentPortalData";
import { ParentPageHeader, GovParentChip } from "@/components/beneficiary/ParentPageHeader";
import { ChevronRight, Shield } from "lucide-react";

export default function CenterHealth() {
  const { user } = useApp();
  const { activities, complaints, sessions, feedback, serviceQualityScores } = useParentPortal();
  if (!user?.centerId) return null;

  const summary = buildCenterGovSummary(user.centerId, activities, complaints, sessions);
  const sqi = serviceQualityScores.find((s) => s.centerId === user.centerId);
  const parentFeedbackCount = feedback.filter((f) => f.centerId === user.centerId).length;
  const resolved = complaints.filter((c) => c.centerId === user.centerId && c.status === "closed").length;

  return (
    <div className="space-y-6 pb-24 w-full">
      <ParentPageHeader
        badge="Transparency · Citizen view"
        title="Center Health & Transparency"
        subtitle={`${user.centerName} — services delivered for families, without internal staff ratings`}
      />

      <div className="grid grid-cols-2 gap-3">
        <GovParentChip label="Services delivered (week)" value={`${summary.mealsDelivered} meals · ${summary.sessionsConducted} sessions`} tone="good" />
        <GovParentChip label="Grievances resolved" value={`${resolved} closed`} tone="good" />
        <GovParentChip label="Parent participation" value={`${parentFeedbackCount} feedbacks`} tone="neutral" />
        <GovParentChip
          label="Cleanliness & nutrition"
          value={sqi ? (sqi.beneficiarySatisfaction >= 70 ? "Satisfactory" : "Under review") : "Good"}
          tone="good"
        />
      </div>

      <div className="worker-card p-5 flex items-start gap-3">
        <Shield className="h-8 w-8 text-[#1e40af] shrink-0" />
        <div>
          <p className="font-bold text-sm">What you can see here</p>
          <p className="text-xs text-slate-600 mt-1">
            Government summary of services at your Anganwadi — meals, preschool activities, complaint resolution, and
            parent voice. Worker performance scores and internal coaching are not shown to protect fair process.
          </p>
        </div>
      </div>

      <div className="worker-card p-4">
        <p className="text-[10px] font-bold uppercase text-slate-500">Overall service status</p>
        <p className="text-2xl font-bold text-[#0F172A] mt-1">{summary.serviceStatus}</p>
        {summary.openIssues > 0 && (
          <p className="text-xs text-amber-800 mt-2">{summary.openIssues} issue(s) being addressed — you may track under Grievances</p>
        )}
      </div>

      <Link
        to={`/center-journey/${user.centerId}`}
        className="flex items-center justify-between rounded-2xl border-2 border-[#1e3a5f] bg-[#1e3a5f] text-white p-5"
      >
        <div>
          <p className="font-bold uppercase text-sm">Full center service journey</p>
          <p className="text-xs text-white/80 mt-1">Timeline of services, feedback, and improvements</p>
        </div>
        <ChevronRight className="h-6 w-6" />
      </Link>
    </div>
  );
}
