import { Link, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { getExperienceById, experienceStatusLabel } from "@/services/public/publicExperienceService";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { format } from "date-fns";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useApp();
  const { myExperiences } = usePublicPortal();

  const experience = id ? getExperienceById(id, myExperiences) : null;

  if (!user) return null;
  if (!experience) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-600">Experience not found.</p>
        <Link to="/public/my-experiences" className="text-sm font-bold text-[#1e40af]">
          ← My Experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 w-full">
      <Link to="/public/my-experiences" className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]">
        <ArrowLeft className="h-3 w-3" /> My Experiences
      </Link>

      <PublicPageHeader
        badge="Share Experience · no grievance"
        title={experience.category}
        subtitle={`${experience.id} · ${format(new Date(experience.timestamp), "PPpp")}`}
      />

      <dl className="grid sm:grid-cols-2 gap-3 text-sm rounded-xl border bg-white p-4">
        <div>
          <dt className="text-slate-500 text-xs uppercase font-bold">Submitted as</dt>
          <dd className="font-bold">{PUBLIC_FEEDBACK_SUBMITTER_LABELS[experience.submittedAs]}</dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs uppercase font-bold">Status</dt>
          <dd className="font-bold text-emerald-800">{experienceStatusLabel(experience.status)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs uppercase font-bold">Rating</dt>
          <dd className="font-bold">{experience.rating} / 5</dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs uppercase font-bold">Satisfaction score</dt>
          <dd className="font-bold">{experience.satisfactionScore}%</dd>
        </div>
      </dl>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Your comment</h2>
        <p className="text-sm">{experience.text}</p>
      </section>

      {experience.evidence.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Supporting evidence (context only)</h2>
          <PublicEvidenceGallery items={experience.evidence} />
        </section>
      )}

      <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1">
          <Sparkles className="h-4 w-4" /> AI experience summary
        </h2>
        <p className="text-sm capitalize">
          Sentiment: <strong>{experience.sentiment}</strong> · Type: {experience.experienceType}
        </p>
        <p className="text-sm">{experience.aiSummary}</p>
        {experience.suggestedImprovements.map((s, i) => (
          <p key={i} className="text-xs text-slate-700">
            <strong>Suggested improvement:</strong> {s}
          </p>
        ))}
      </section>

      <section className="rounded-xl border bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-bold text-slate-800 mb-1">Center improvements fed from this feedback</p>
        <p>
          Contributes to Center Trust Score, Public Insights Dashboard, Service Analytics, and Citizen Satisfaction
          reports. No supervisor ticket or grievance timeline was created.
        </p>
        {experience.status === "included_in_improvement" && (
          <p className="mt-2 text-emerald-800 font-bold">Your suggestion improved center services.</p>
        )}
      </section>

      <Link to="/beneficiary/omnichannel-feedback" className="text-sm font-bold text-amber-800 underline">
        Need action on a serious issue? Report Issue →
      </Link>
    </div>
  );
}
