import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { SubmitGrievanceForm, PublicGrievancePayload } from "@/components/beneficiary/SubmitGrievanceForm";
import { CheckCircle2 } from "lucide-react";

export default function SubmitGrievance() {
  const { user, submitPublicGrievance, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);

  const handleSubmit = async (payload: PublicGrievancePayload) => {
    setLoading(true);
    try {
      const cmp = await submitPublicGrievance(payload);
      setResult({ id: cmp.id });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6 pb-24 max-w-2xl mx-auto">
        <div className="rounded-sm border-2 border-emerald-600 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-emerald-900">{t("submit_success_title")}</h2>
          <p className="text-sm text-emerald-800 mt-2">{t("submit_success_id")}: <strong className="font-mono">{result.id}</strong></p>
          <p className="text-sm text-slate-700 mt-3">{t("submit_success_assigned")}</p>
          <p className="text-sm font-bold text-[#0c1f3d] mt-2">{t("submit_success_sla")}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/beneficiary/track-grievance" className="gov-btn-primary text-sm">{t("track_grievance_link")}</Link>
            <Link to="/beneficiary" className="gov-btn-outline text-sm">{t("back_dashboard")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 w-full max-w-3xl">
      <PublicPageHeader
        badge={t("submit_grievance_badge")}
        title={t("submit_grievance")}
        subtitle={t("submit_grievance_subtitle")}
      />
      <SubmitGrievanceForm defaultMobile={user?.phone ?? ""} defaultName={user?.name ?? ""} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
