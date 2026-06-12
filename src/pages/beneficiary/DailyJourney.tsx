import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import {
  buildParentLearningCard,
  buildTodayChildJourney,
} from "@/services/beneficiary/parentPortalData";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";

export default function DailyJourney() {
  const { user } = useApp();
  const { activities, childProgress, sessions, centerId } = usePublicPortal();
  if (!user?.centerId) return null;

  const journey = buildTodayChildJourney(user, activities, childProgress, sessions);
  const learning = buildParentLearningCard(sessions, user.centerId);

  return (
    <div className="space-y-6 pb-24 w-full">
      <PublicPageHeader
        badge="Public Services · Today"
        title="Today's Services"
        subtitle={`${journey?.child.name ?? "Public beneficiary"} · ${user.centerName} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      {!journey && <p className="text-sm text-slate-500">No journey data yet for today.</p>}

      {journey && (
        <>
          <section className="worker-card p-4 space-y-3">
            <h2 className="text-sm font-bold uppercase text-[#1e3a5f]">Day timeline</h2>
            <ol className="space-y-3">
              {journey.timeline.map((step) => (
                <li key={step.id} className="flex gap-3">
                  {step.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm">
                      {step.time} — {step.label}
                    </p>
                    {step.detail && <p className="text-xs text-slate-600">{step.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="worker-card p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500">Attendance</p>
              <p className="font-bold mt-1 capitalize">{journey.attendance}</p>
            </div>
            <div className="worker-card p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500">Classroom session</p>
              <p className="font-bold mt-1 capitalize">{journey.preschool}</p>
            </div>
            <div className="worker-card p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500">Meals served</p>
              <p className="font-bold mt-1 capitalize">{journey.meal}</p>
            </div>
            <div className="worker-card p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500">Departure</p>
              <p className="font-bold mt-1">{journey.timeline[journey.timeline.length - 1]?.status === "done" ? "Recorded" : "Expected afternoon"}</p>
            </div>
          </section>
        </>
      )}

      {learning && (
        <section className="rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-5">
          <div className="flex items-center gap-2 text-teal-900 font-bold uppercase text-sm mb-3">
            <BookOpen className="h-5 w-5" /> Today children learned
          </div>
          <p className="text-xs text-teal-800 mb-2">Activity: {learning.activityType}</p>
          {learning.storyTitle && (
            <p className="text-sm font-bold text-[#0F172A]">Story: {learning.storyTitle}</p>
          )}
          {learning.englishWord && (
            <p className="text-sm text-slate-700 mt-1">
              <strong>Words introduced:</strong> {learning.englishWord}
            </p>
          )}
          <p className="text-sm text-slate-700 mt-3 leading-relaxed">{learning.summary}</p>
          <p className="text-[10px] text-slate-500 mt-3">Service summary — visible to enrolled public beneficiaries</p>
        </section>
      )}

      <Link to="/beneficiary/nutrition" className="gov-btn-primary text-sm inline-block">
        View today&apos;s nutrition →
      </Link>
    </div>
  );
}
