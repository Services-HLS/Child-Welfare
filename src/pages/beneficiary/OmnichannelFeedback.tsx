import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { ReportIssueForm, ReportIssuePayload } from "@/components/public/ReportIssueForm";
import { toast } from "sonner";
import { Lang } from "@/types/platform";
import { PublicFeedbackSubmitterType } from "@/types/public-context";

export default function OmnichannelFeedback() {
  const { user, submitReportIssue, lang } = useApp();
  const [submittedAs, setSubmittedAs] = useState<PublicFeedbackSubmitterType>(
    (localStorage.getItem("angansakti.public.lastFeedbackType") as PublicFeedbackSubmitterType) || "parent_caregiver"
  );
  const [loading, setLoading] = useState(false);
  const [grievanceId, setGrievanceId] = useState<string | null>(null);

  const handleSubmit = async (payload: ReportIssuePayload) => {
    if (!user?.centerId) return;
    setLoading(true);
    try {
      const cmp = await submitReportIssue({
        beneficiaryId: user.id,
        beneficiaryName: user.name,
        centerId: user.centerId,
        centerName: user.centerName ?? "",
        submittedAs: payload.submittedAs,
        issueCategoryLabel: payload.issueCategoryLabel,
        complaintCategory: payload.complaintCategory,
        priority: payload.priority,
        resolutionPreference: payload.resolutionPreference,
        text: payload.text,
        evidence: payload.evidence,
        consent: payload.consent,
        anonymous: payload.anonymous,
        aiAnalysis: payload.aiAnalysis,
        lang: lang as Lang,
      });
      localStorage.setItem("angansakti.public.lastFeedbackType", payload.submittedAs);
      setGrievanceId(cmp.id);
      toast.success("Issue submitted for supervisor review", {
        description: `Grievance ${cmp.id} — track timeline and resolution proof in My Requests.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader
        badge="Official grievance · WDCW"
        title="Report Issue"
        subtitle="Did something happen that needs action? Creates a tracked resolution process — supervisors receive your evidence package and AI summary."
      />

      <p className="text-xs text-slate-600 rounded-lg border bg-amber-50/80 border-amber-100 p-3">
        Workflow: Public Submission → AI Review → Supervisor Investigation → Resolution → Public Confirmation → Closure.
        <strong> Anganwadi workers are not assigned</strong> as grievance handlers.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link to="/public/my-requests" className="gov-btn-outline text-xs">
          My Requests
        </Link>
        <Link to="/beneficiary/feedback" className="gov-btn-outline text-xs">
          Share Experience →
        </Link>
      </div>

      {grievanceId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-bold text-amber-900">Grievance ID: {grievanceId}</p>
          <p className="text-xs mt-1 text-amber-800">
            Your issue is under supervisor review. You will be notified when resolution is uploaded.
          </p>
          <Link to={`/beneficiary/request/${grievanceId}`} className="text-xs font-bold text-[#1e40af] underline mt-2 inline-block">
            Track investigation →
          </Link>
        </div>
      )}

      <ReportIssueForm
        lang={lang as Lang}
        submittedAs={submittedAs}
        onSubmittedAsChange={setSubmittedAs}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
