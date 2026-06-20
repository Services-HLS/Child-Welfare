import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { usePublicSessionContext } from "@/hooks/usePublicSessionContext";
import { buildCenterGovSummary, buildTodayChildJourney } from "@/services/beneficiary/parentPortalData";
import { buildCenterTrustScore } from "@/services/public/centerTrustScore";
import { GovPublicChip, PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { WhoAreYouToday } from "@/components/public/WhoAreYouToday";
import { CenterTrustScoreCard } from "@/components/public/CenterTrustScoreCard";
import {
  User, BookOpen, MessageSquare, Heart, Sun, UtensilsCrossed, Activity, Radio, Bell, GraduationCap, Stethoscope, TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

import { TKey } from "@/lib/i18n";

const PARENT_QUICK: { to: string; labelKey: TKey; icon: typeof User }[] = [
  { to: "/beneficiary/my-child", labelKey: "my_child_progress", icon: User },
  { to: "/beneficiary/my-child/growth", labelKey: "growth_monitoring", icon: TrendingUp },
  { to: "/beneficiary/nutrition", labelKey: "nutrition", icon: UtensilsCrossed },
  { to: "/beneficiary/my-child/vaccination", labelKey: "vaccination", icon: Stethoscope },
  { to: "/beneficiary/my-child/attendance", labelKey: "attendance_records", icon: BookOpen },
  { to: "/beneficiary/my-child/milestones", labelKey: "development_milestones", icon: GraduationCap },
  { to: "/beneficiary/my-child/health", labelKey: "health_records", icon: Heart },
  { to: "/beneficiary/daily-journey", labelKey: "today_services", icon: Sun },
  { to: "/beneficiary/activities", labelKey: "center_services", icon: Activity },
  { to: "/beneficiary/center-timeline", labelKey: "center_timeline", icon: Radio },
  { to: "/beneficiary/notifications", labelKey: "notifications", icon: Bell },
  { to: "/beneficiary/feedback", labelKey: "share_experience", icon: MessageSquare },
];

export function ParentChildDashboardSection() {
  const { user, t, complaints, feedback, sessions, activities } = useApp();
  const { childProgress, myExperiences, experienceBuckets } = usePublicPortal();
  const { contextType, setContextType, focus } = usePublicSessionContext();

  if (!user?.centerId) return null;

  const journey = buildTodayChildJourney(user, activities, childProgress, sessions);
  const summary = buildCenterGovSummary(user.centerId, activities, complaints, sessions);
  const trust = useMemo(
    () => buildCenterTrustScore(user.centerId, feedback, complaints, activities, sessions),
    [user.centerId, feedback, complaints, activities, sessions]
  );
  const showChildJourney = contextType === "parent_caregiver" || contextType === "guardian";

  return (
    <section className="space-y-5 pt-6 border-t-4 border-[#c9a227]">
      <PublicPageHeader
        badge={t("parent_child_dashboard")}
        title={t("parent_child_dashboard")}
        subtitle={`${user.centerName} · ${t("citizen_portal_desc")}`}
      />

      <WhoAreYouToday selected={contextType} onSelect={setContextType} />

      <div className="rounded-sm border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-[10px] font-bold uppercase text-blue-800">Personalized for you</p>
        <p className="text-sm text-slate-800 mt-1">{focus.headline}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {focus.primaryLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-xs font-bold text-[#1e40af] underline">{l.label}</Link>
          ))}
        </div>
      </div>

      <CenterTrustScoreCard trust={trust} />

      {showChildJourney && journey && (
        <div className="rounded-sm border-2 border-[#1e3a5f] bg-white overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-3">
            <h3 className="text-sm font-bold uppercase">Child Profile — Today&apos;s Services</h3>
          </div>
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex gap-3 sm:w-48 shrink-0">
              <div className="h-20 w-20 rounded-sm bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#1e3a5f]">
                {journey.child.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{journey.child.name}</p>
                <p className="text-xs text-slate-600">Age {journey.child.age}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <GovPublicChip label="Attendance" value={journey.attendance === "present" ? "Present" : "Pending"} tone="good" />
              <GovPublicChip label="Preschool" value={journey.preschool === "completed" ? "Done" : "Pending"} tone="good" />
              <GovPublicChip label="Meal" value={journey.meal === "served" ? "Served" : "Pending"} tone="good" />
              <GovPublicChip label="Activities" value={journey.activity === "completed" ? "Logged" : "Pending"} tone="good" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GovPublicChip label="Meals (week)" value={`${summary.mealsDelivered}`} tone="good" />
        <GovPublicChip label="Sessions (week)" value={`${summary.sessionsConducted}`} tone="neutral" />
        <GovPublicChip label="Experiences" value={`${experienceBuckets.submitted}`} tone="good" />
        <GovPublicChip label="Center services" value={summary.serviceStatus} tone="good" />
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">{t("quick_actions")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PARENT_QUICK.map((a) => (
            <Link key={a.labelKey} to={a.to} className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white p-3 hover:border-[#1e3a5f] shadow-sm">
              <a.icon className="h-4 w-4 text-[#1e40af] shrink-0" />
              <span className="text-[11px] font-bold leading-tight">{t(a.labelKey)}</span>
            </Link>
          ))}
        </div>
      </div>

      {myExperiences.length > 0 && (
        <div className="rounded-sm border border-emerald-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase text-emerald-900 mb-2">Recent Experiences</h3>
          <ul className="space-y-1">
            {myExperiences.slice(0, 3).map((e) => (
              <li key={e.id}>
                <Link to={`/public/experience/${e.id}`} className="text-xs font-bold text-[#1e40af]">{e.category} — {e.rating}/5</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
