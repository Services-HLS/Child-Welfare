import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { usePublicSessionContext } from "@/hooks/usePublicSessionContext";
import { mockAnnouncements } from "@/data/mockGrievances";
import {
  buildCenterGovSummary,
  buildTodayChildJourney,
} from "@/services/beneficiary/parentPortalData";
import { buildCenterTrustScore } from "@/services/public/centerTrustScore";
import { GovPublicChip, PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { WhoAreYouToday } from "@/components/public/WhoAreYouToday";
import { PublicPortalBanners } from "@/components/public/PublicPortalBanners";
import { CenterTrustScoreCard } from "@/components/public/CenterTrustScoreCard";
import {
  User,
  BookOpen,
  MessageSquare,
  AlertCircle,
  MapPin,
  ChevronRight,
  Bell,
  Utensils,
  GraduationCap,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const QUICK_ACTIONS = [
  { to: "/beneficiary/my-child", label: "Service Visibility", icon: User },
  { to: "/beneficiary/daily-journey", label: "Today's Services", icon: BookOpen },
  { to: "/beneficiary/feedback", label: "Share Experience", icon: MessageSquare },
  { to: "/beneficiary/omnichannel-feedback", label: "Report Issue", icon: AlertCircle },
  { to: "/public/my-experiences", label: "My Experiences", icon: CheckCircle2 },
  { to: "/public/my-requests", label: "My Requests", icon: AlertCircle },
  { to: "/beneficiary/center-timeline", label: "Center Timeline", icon: Radio },
  { to: "/public/transparency", label: "State Transparency", icon: MapPin },
];

export default function BeneficiaryDashboard() {
  const { user, t, complaints, feedback, sessions, activities } = useApp();
  const { childProgress, publicRequests, myExperiences, experienceBuckets, requestBuckets } = usePublicPortal();
  const { contextType, setContextType, focus } = usePublicSessionContext();

  if (!user?.centerId) return null;

  const journey = buildTodayChildJourney(user, activities, childProgress, sessions);
  const summary = buildCenterGovSummary(user.centerId, activities, complaints, sessions);
  const myComplaints = complaints.filter((c) => c.beneficiaryId === user.id);
  const openComplaints = myComplaints.filter((c) => c.status !== "closed").length;
  const trust = useMemo(
    () => buildCenterTrustScore(user.centerId, feedback, complaints, activities, sessions),
    [user.centerId, feedback, complaints, activities, sessions]
  );

  const showChildJourney = contextType === "parent_caregiver" || contextType === "guardian";

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPortalBanners />

      <PublicPageHeader
        badge="Government of Andhra Pradesh · WDCW · Public Control Room"
        title={`${t("greeting")}, ${user.name}`}
        subtitle={`${user.centerName} · Unified citizen services portal`}
      />

      <WhoAreYouToday selected={contextType} onSelect={setContextType} />

      <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-[10px] font-bold uppercase text-blue-800">Personalized for you</p>
        <p className="text-sm text-slate-800 mt-1">{focus.headline}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {focus.primaryLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-xs font-bold text-[#1e40af] underline">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase text-emerald-900">My Experiences</h2>
            <Link to="/public/my-experiences" className="text-xs font-bold text-[#1e40af]">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-emerald-800">Submitted</p>
              <p className="text-lg font-black">{experienceBuckets.submitted}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-blue-800">Appreciated</p>
              <p className="text-lg font-black">{experienceBuckets.appreciated}</p>
            </div>
            <div className="rounded-lg bg-violet-50 border border-violet-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-violet-800">In Improvements</p>
              <p className="text-lg font-black">{experienceBuckets.included}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {myExperiences.slice(0, 2).map((e) => (
              <li key={e.id}>
                <Link
                  to={`/public/experience/${e.id}`}
                  className="flex justify-between text-sm border-b border-slate-50 pb-2 hover:text-[#1e40af]"
                >
                  <span className="text-xs truncate max-w-[60%]">{e.category}</span>
                  <span className="text-xs text-slate-500">{e.rating}/5</span>
                </Link>
              </li>
            ))}
            {myExperiences.length === 0 && (
              <li className="text-xs text-slate-500">
                <Link to="/beneficiary/feedback" className="font-bold text-[#1e40af] underline">
                  Share Experience
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase text-amber-900">My Requests</h2>
            <Link to="/public/my-requests" className="text-xs font-bold text-[#1e40af]">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-blue-700">Submitted</p>
              <p className="text-lg font-black">{requestBuckets.submitted}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-amber-800">Under Review</p>
              <p className="text-lg font-black">{requestBuckets.under_review}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-emerald-800">Resolved</p>
              <p className="text-lg font-black">{requestBuckets.resolved + requestBuckets.closed}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {publicRequests.slice(0, 2).map((r) => (
              <li key={r.id}>
                <Link
                  to={`/beneficiary/request/${r.complaintId ?? r.id}`}
                  className="flex justify-between text-sm border-b border-slate-50 pb-2 hover:text-[#1e40af]"
                >
                  <span className="font-mono text-xs">{r.referenceId}</span>
                  <span className="text-xs text-slate-500">{r.statusLabel}</span>
                </Link>
              </li>
            ))}
            {publicRequests.length === 0 && (
              <li className="text-xs text-slate-500">
                <Link to="/beneficiary/omnichannel-feedback" className="font-bold text-[#1e40af] underline">
                  Report Issue
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>

      <CenterTrustScoreCard trust={trust} />

      {showChildJourney && journey && (
        <section className="rounded-2xl border-2 border-[#1e3a5f] bg-white overflow-hidden shadow-sm">
          <div className="bg-[#1e3a5f] text-white px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wide">Today&apos;s Services</h2>
            <p className="text-xs text-white/80 mt-0.5">Preschool, meals, and attendance visibility</p>
          </div>
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex gap-3 sm:w-48 shrink-0">
              <div className="h-20 w-20 rounded-xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#1e3a5f]">
                {journey.child.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#0F172A]">{journey.child.name}</p>
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
        </section>
      )}

      {contextType === "pregnant_woman" && (
        <section className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-sm">
          <p className="font-bold text-rose-900">Nutrition &amp; health priority</p>
          <p className="text-xs text-slate-700 mt-1">
            Track supplements, ANM visits, and THR under My Benefits on the Service Visibility hub.
          </p>
          <Link to="/beneficiary/nutrition" className="text-xs font-bold text-[#1e40af] mt-2 inline-block">
            Open nutrition services →
          </Link>
        </section>
      )}

      {contextType === "citizen_community" && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-bold text-slate-900">Community observation mode</p>
          <p className="text-xs text-slate-700 mt-1">
            Infrastructure, cleanliness, and center observations — use anonymous submission for sensitive issues.
          </p>
          <Link to="/beneficiary/omnichannel-feedback" className="text-xs font-bold text-[#1e40af] mt-2 inline-block">
            Citizen feedback channels →
          </Link>
        </section>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GovPublicChip label="Meals (week)" value={`${summary.mealsDelivered}`} tone="good" />
        <GovPublicChip label="Sessions (week)" value={`${summary.sessionsConducted}`} tone="neutral" />
        <GovPublicChip label="Open grievances" value={`${openComplaints}`} tone={openComplaints ? "warn" : "good"} />
        <GovPublicChip label="Center services" value={summary.serviceStatus} tone="good" />
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-[#1e3a5f] shadow-sm"
            >
              <a.icon className="h-5 w-5 text-[#1e40af] shrink-0" />
              <span className="text-xs font-bold text-[#0F172A] leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3">
          <Bell className="h-4 w-4" /> Government announcements
        </div>
        {mockAnnouncements.map((a) => (
          <div key={a.id} className="py-2 border-b border-slate-50 last:border-0">
            <div className="text-sm font-bold text-slate-900">{a.title}</div>
            <div className="text-xs text-slate-500">{a.body}</div>
          </div>
        ))}
        <Link to="/beneficiary/notifications" className="text-xs font-bold text-[#1e40af] mt-2 inline-flex items-center gap-1">
          All updates <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
