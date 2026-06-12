import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { ShareExperienceForm, ShareExperiencePayload } from "@/components/public/ShareExperienceForm";
import { experienceStatusLabel } from "@/services/public/publicExperienceService";
import { toast } from "sonner";
import { Lang } from "@/types/platform";
import { format } from "date-fns";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS, PublicFeedbackSubmitterType } from "@/types/public-context";
import { Star } from "lucide-react";
import { ExperienceStatus } from "@/types/citizen-experience";

export default function BeneficiaryFeedback() {
  const { user, submitShareExperience, lang } = useApp();
  const { myExperiences } = usePublicPortal();
  const [submittedAs, setSubmittedAs] = useState<PublicFeedbackSubmitterType>(
    (localStorage.getItem("angansakti.public.lastFeedbackType") as PublicFeedbackSubmitterType) || "parent_caregiver"
  );
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const handleSubmit = async (payload: ShareExperiencePayload) => {
    if (!user?.centerId) return;
    setLoading(true);
    try {
      const record = await submitShareExperience({
        beneficiaryId: user.id,
        beneficiaryName: user.name,
        centerId: user.centerId,
        centerName: user.centerName ?? "",
        submittedAs: payload.submittedAs,
        category: payload.category,
        experienceType: payload.experienceType,
        rating: payload.rating,
        text: payload.text,
        evidence: payload.evidence,
        lang: lang as Lang,
      });
      localStorage.setItem("angansakti.public.lastFeedbackType", payload.submittedAs);
      setSubmittedId(record.id);
      setSubmittedStatus(record.status);
      toast.success("Thank you for sharing your experience", {
        description: "Recorded for service improvement — no grievance or supervisor action.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader
        badge="WDCW · Public portal"
        title="Share Experience"
        subtitle="How was your experience with the service? Opinions, appreciation, and suggestions — optional evidence for context only."
      />

      <div className="flex flex-wrap gap-2">
        <Link to="/public/my-experiences" className="gov-btn-outline text-xs">
          My Experiences
        </Link>
        <Link to="/beneficiary/omnichannel-feedback" className="gov-btn-outline text-xs">
          Report Issue →
        </Link>
      </div>

      {submittedId && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">Experience recorded</p>
          <p className="text-xs mt-1">
            Status: {submittedStatus ? experienceStatusLabel(submittedStatus as ExperienceStatus) : "Recorded"}.
            Feeds Center Trust Score, Public Insights, and citizen satisfaction reports.
          </p>
          <Link to={`/public/experience/${submittedId}`} className="text-xs font-bold underline mt-2 inline-block">
            View submission →
          </Link>
        </div>
      )}

      <ShareExperienceForm
        lang={lang as Lang}
        submittedAs={submittedAs}
        onSubmittedAsChange={setSubmittedAs}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <section>
        <h2 className="text-xs font-bold uppercase text-slate-500 mb-3">Recent experiences</h2>
        <div className="space-y-2">
          {myExperiences.slice(0, 8).map((e) => (
            <Link key={e.id} to={`/public/experience/${e.id}`} className="worker-card p-4 block hover:border-emerald-200">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>{format(new Date(e.timestamp), "d MMM yyyy")}</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {e.rating}/5
                </span>
              </div>
              <p className="text-sm mt-1 line-clamp-2">{e.text}</p>
              <p className="text-xs text-emerald-800 font-medium mt-2">
                {experienceStatusLabel(e.status)} · {PUBLIC_FEEDBACK_SUBMITTER_LABELS[e.submittedAs]}
              </p>
            </Link>
          ))}
          {myExperiences.length === 0 && (
            <p className="text-sm text-slate-500">No experiences yet. Share how services felt today.</p>
          )}
        </div>
      </section>
    </div>
  );
}
