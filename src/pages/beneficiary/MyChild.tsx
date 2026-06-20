import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader, GovPublicChip } from "@/components/beneficiary/ParentPageHeader";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  childSectionFromPath,
  getChildHealthRecords,
  getChildProgressHistory,
  getDevelopmentMilestones,
  getGrowthMeasurements,
  getPrimaryChild,
  getVaccinationRecords,
  type ChildPortalSection,
} from "@/services/beneficiary/parentPortalData";

const SECTION_META: Record<
  ChildPortalSection,
  { badge: string; title: string; subtitle: string }
> = {
  progress: {
    badge: "WDCW · Child Progress Overview",
    title: "My Child Progress",
    subtitle: "Summary of enrollment, participation, and recent Anganwadi services",
  },
  growth: {
    badge: "WDCW · Growth Monitoring",
    title: "Growth Monitoring",
    subtitle: "Weight, height, and WHO growth status recorded at your Anganwadi center",
  },
  vaccination: {
    badge: "WDCW · Immunization Register",
    title: "Vaccination",
    subtitle: "National Immunization Schedule — doses given, due, and upcoming",
  },
  attendance: {
    badge: "WDCW · Attendance Register",
    title: "Attendance Records",
    subtitle: "Daily presence log with notes from the Anganwadi worker",
  },
  milestones: {
    badge: "WDCW · ECCE Development",
    title: "Development Milestones",
    subtitle: "Age-appropriate milestones tracked by workers during preschool sessions",
  },
  health: {
    badge: "WDCW · Child Health File",
    title: "Health Records",
    subtitle: "Screenings, illness episodes, and referrals linked to your child",
  },
};

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
        <h3 className="text-[10px] font-bold uppercase text-slate-600">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "good" | "warn" | "neutral" | "danger" }) {
  const colors = {
    good: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warn: "bg-amber-100 text-amber-900 border-amber-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    danger: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border whitespace-nowrap", colors[tone])}>
      {label}
    </span>
  );
}

function RecordCount({ n, label }: { n: number; label: string }) {
  return (
    <p className="text-[10px] font-bold uppercase text-slate-500 mb-3">
      Showing {n} {label}{n !== 1 ? "s" : ""}
    </p>
  );
}

export default function MyChild() {
  const { user } = useApp();
  const { childProgress, centerId } = usePublicPortal();
  const { pathname } = useLocation();
  const section = childSectionFromPath(pathname);
  const meta = SECTION_META[section];

  const child = user ? getPrimaryChild(user) : null;
  const history = useMemo(
    () => (child && centerId ? getChildProgressHistory(child.id, centerId, childProgress) : []),
    [child, centerId, childProgress]
  );
  const growth = useMemo(() => (child ? getGrowthMeasurements(child.id, child.age) : []), [child]);
  const vaccines = useMemo(() => (child ? getVaccinationRecords(child.id, child.age) : []), [child]);
  const milestones = useMemo(() => (child ? getDevelopmentMilestones(child.id, child.age) : []), [child]);
  const healthRecords = useMemo(() => (child ? getChildHealthRecords(child.id) : []), [child]);

  if (!user) return null;

  const attendedDays = history.filter((h) => h.attended).length;
  const absentDays = history.filter((h) => !h.attended).length;
  const mealDays = history.filter((h) => h.nutritionCompleted).length;
  const avgParticipation =
    history.length > 0
      ? Math.round(
          (history.filter((h) => h.attended).reduce((s, h) => s + (h.preschoolParticipation ?? 0), 0) /
            Math.max(1, attendedDays)) *
            100
        )
      : 0;
  const vaccinesDone = vaccines.filter((v) => v.status === "done").length;
  const milestonesAchieved = milestones.filter((m) => m.status === "achieved").length;

  if (!child) {
    return (
      <div className="space-y-5 pb-24">
        <PublicPageHeader badge={meta.badge} title={meta.title} subtitle={meta.subtitle} />
        <p className="text-sm text-slate-600 rounded-xl border bg-slate-50 p-4">
          No enrolled child is linked to your account. Child progress, growth, vaccination, and health records appear
          when a child is registered at your Anganwadi center.
        </p>
      </div>
    );
  }

  const childSubtitle = `${child.name} · Age ${child.age} · ${user.centerName ?? "Anganwadi Center"}`;

  return (
    <div className="space-y-5 pb-24 w-full">
      <PublicPageHeader badge={meta.badge} title={meta.title} subtitle={`${childSubtitle} — ${meta.subtitle}`} />

      {section === "progress" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Days Present (21d)" value={`${attendedDays}`} tone="good" />
            <GovPublicChip label="Meals Received" value={`${mealDays}`} tone="good" />
            <GovPublicChip label="Avg Preschool" value={`${avgParticipation}%`} tone="neutral" />
            <GovPublicChip label="Days Absent" value={`${absentDays}`} tone={absentDays > 3 ? "warn" : "good"} />
          </div>
          <DetailCard title="Child Profile">
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Name</dt><dd className="font-semibold">{child.name}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Age</dt><dd className="font-semibold">{child.age} years</dd></div>
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Gender</dt><dd className="font-semibold">{child.gender === "M" ? "Male" : child.gender === "F" ? "Female" : "—"}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Center</dt><dd className="font-semibold">{user.centerName}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Enrolled</dt><dd className="font-semibold">{child.enrollmentDate ? format(new Date(child.enrollmentDate), "PP") : "Active"}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase text-slate-500">Growth Status</dt><dd className="font-semibold">{history[0]?.growthMilestone ?? "On track"}</dd></div>
            </dl>
          </DetailCard>
          <DetailCard title={`Recent Service Log · Last ${Math.min(history.length, 14)} Days`}>
            <RecordCount n={Math.min(history.length, 14)} label="daily record" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase text-slate-500">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Attendance</th>
                    <th className="pb-2 pr-3">Meal</th>
                    <th className="pb-2 pr-3">Preschool</th>
                    <th className="pb-2">Activity / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 14).map((h) => (
                    <tr key={h.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium whitespace-nowrap">{format(new Date(h.date), "EEE, d MMM")}</td>
                      <td className="py-2 pr-3"><StatusBadge label={h.attended ? "Present" : "Absent"} tone={h.attended ? "good" : "danger"} /></td>
                      <td className="py-2 pr-3 text-xs">{h.nutritionCompleted ? "Received" : h.attended ? "Not recorded" : "—"}</td>
                      <td className="py-2 pr-3 text-xs">{h.attended ? `${Math.round((h.preschoolParticipation ?? 0) * 100)}%` : "—"}</td>
                      <td className="py-2 text-xs text-slate-600">{h.learningObservation ?? h.developmentalNote ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>
        </>
      )}

      {section === "growth" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Latest Weight" value={`${growth[0]?.weightKg ?? "—"} kg`} tone="good" />
            <GovPublicChip label="Latest Height" value={`${growth[0]?.heightCm ?? "—"} cm`} tone="good" />
            <GovPublicChip label="BMI" value={growth[0]?.bmi ? String(growth[0].bmi) : "—"} tone="neutral" />
            <GovPublicChip label="Status" value={growth[0]?.status ?? "normal"} tone="good" />
          </div>
          <DetailCard title="Growth Measurements · WHO Standards">
            <RecordCount n={growth.length} label="measurement" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase text-slate-500">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Weight</th>
                    <th className="pb-2 pr-3">Height</th>
                    <th className="pb-2 pr-3">MUAC</th>
                    <th className="pb-2 pr-3">BMI</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2 pr-3">Recorded By</th>
                    <th className="pb-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {growth.map((g) => (
                    <tr key={g.date} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium whitespace-nowrap">{format(new Date(g.date), "d MMM yyyy")}</td>
                      <td className="py-2 pr-3">{g.weightKg} kg</td>
                      <td className="py-2 pr-3">{g.heightCm} cm</td>
                      <td className="py-2 pr-3">{g.muacCm ? `${g.muacCm} cm` : "—"}</td>
                      <td className="py-2 pr-3">{g.bmi ?? "—"}</td>
                      <td className="py-2 pr-3"><StatusBadge label={g.status} tone={g.status === "normal" ? "good" : "warn"} /></td>
                      <td className="py-2 pr-3 text-xs text-slate-600">{g.recordedBy ?? "—"}</td>
                      <td className="py-2 text-xs text-slate-600">{g.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>
        </>
      )}

      {section === "vaccination" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Completed" value={`${vaccinesDone}`} tone="good" />
            <GovPublicChip label="Due Now" value={`${vaccines.filter((v) => v.status === "due").length}`} tone="warn" />
            <GovPublicChip label="Upcoming" value={`${vaccines.filter((v) => v.status === "upcoming").length}`} tone="neutral" />
            <GovPublicChip label="Total in Schedule" value={`${vaccines.length}`} tone="neutral" />
          </div>
          <DetailCard title="Immunization Register · National Schedule">
            <RecordCount n={vaccines.length} label="vaccine entry" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase text-slate-500">
                    <th className="pb-2 pr-3">Vaccine</th>
                    <th className="pb-2 pr-3">Dose</th>
                    <th className="pb-2 pr-3">Due Date</th>
                    <th className="pb-2 pr-3">Given Date</th>
                    <th className="pb-2 pr-3">Site</th>
                    <th className="pb-2 pr-3">Batch</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccines.map((v) => (
                    <tr key={`${v.vaccine}-${v.dose}`} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-semibold text-[#0c1f3d]">{v.vaccine}</td>
                      <td className="py-2 pr-3 text-xs">{v.dose}</td>
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">{format(new Date(v.dueDate), "d MMM yyyy")}</td>
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">{v.givenDate ? format(new Date(v.givenDate), "d MMM yyyy") : "—"}</td>
                      <td className="py-2 pr-3 text-xs">{v.site ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs font-mono">{v.batch ?? "—"}</td>
                      <td className="py-2">
                        <StatusBadge
                          label={v.status === "done" ? "Completed" : v.status === "due" ? "Due now" : "Upcoming"}
                          tone={v.status === "done" ? "good" : v.status === "due" ? "warn" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>
        </>
      )}

      {section === "attendance" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Present" value={`${attendedDays}`} tone="good" />
            <GovPublicChip label="Absent" value={`${absentDays}`} tone={absentDays > 3 ? "warn" : "neutral"} />
            <GovPublicChip label="Attendance Rate" value={history.length ? `${Math.round((attendedDays / history.length) * 100)}%` : "—"} tone="good" />
            <GovPublicChip label="Logged Days" value={`${history.length}`} tone="neutral" />
          </div>
          <DetailCard title="Daily Attendance Register">
            <RecordCount n={history.length} label="attendance entry" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase text-slate-500">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Day</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2 pr-3">Meal</th>
                    <th className="pb-2 pr-3">Preschool</th>
                    <th className="pb-2">Worker Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium whitespace-nowrap">{format(new Date(h.date), "d MMM yyyy")}</td>
                      <td className="py-2 pr-3 text-xs text-slate-600">{format(new Date(h.date), "EEEE")}</td>
                      <td className="py-2 pr-3"><StatusBadge label={h.attended ? "Present" : "Absent"} tone={h.attended ? "good" : "danger"} /></td>
                      <td className="py-2 pr-3 text-xs">{h.nutritionCompleted ? "Meal received" : h.attended ? "Not logged" : "—"}</td>
                      <td className="py-2 pr-3 text-xs">{h.attended ? `${Math.round((h.preschoolParticipation ?? 0) * 100)}% engaged` : "—"}</td>
                      <td className="py-2 text-xs text-slate-700">{h.developmentalNote ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>
        </>
      )}

      {section === "milestones" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Achieved" value={`${milestonesAchieved}`} tone="good" />
            <GovPublicChip label="In Progress" value={`${milestones.filter((m) => m.status === "in_progress").length}`} tone="warn" />
            <GovPublicChip label="Upcoming" value={`${milestones.filter((m) => m.status === "upcoming").length}`} tone="neutral" />
            <GovPublicChip label="Total Tracked" value={`${milestones.length}`} tone="neutral" />
          </div>
          <DetailCard title="Development Milestones Checklist · ECCE">
            <RecordCount n={milestones.length} label="milestone" />
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="rounded-sm border border-slate-100 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase text-slate-500">{m.ageMonths} months expected</p>
                      <p className="font-bold text-sm text-[#0c1f3d] mt-0.5">{m.milestone}</p>
                      {m.note && <p className="text-xs text-slate-600 mt-1">{m.note}</p>}
                      {m.observedDate && (
                        <p className="text-[10px] text-slate-500 mt-1">Observed: {format(new Date(m.observedDate), "PP")}</p>
                      )}
                    </div>
                    <StatusBadge
                      label={m.status === "achieved" ? "Achieved" : m.status === "in_progress" ? "In progress" : "Upcoming"}
                      tone={m.status === "achieved" ? "good" : m.status === "in_progress" ? "warn" : "neutral"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        </>
      )}

      {section === "health" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <GovPublicChip label="Total Records" value={`${healthRecords.length}`} tone="neutral" />
            <GovPublicChip label="Screenings" value={`${healthRecords.filter((h) => h.type.includes("screening") || h.type.includes("check")).length}`} tone="good" />
            <GovPublicChip label="Illness Episodes" value={`${healthRecords.filter((h) => h.type.includes("illness")).length}`} tone="warn" />
            <GovPublicChip label="Last Visit" value={healthRecords[0] ? format(new Date(healthRecords[0].date), "d MMM") : "—"} tone="neutral" />
          </div>
          <DetailCard title="Health & Screening Records">
            <RecordCount n={healthRecords.length} label="health record" />
            <div className="space-y-3">
              {healthRecords.map((h) => (
                <div key={h.id} className="rounded-sm border border-slate-100 p-4 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-bold text-sm text-[#0c1f3d]">{h.type}</p>
                    <span className="text-[10px] font-bold text-slate-500">{format(new Date(h.date), "PP")}</span>
                  </div>
                  <dl className="grid sm:grid-cols-1 gap-1.5 text-sm text-slate-700">
                    <div><dt className="inline font-bold">Finding: </dt><dd className="inline">{h.finding}</dd></div>
                    <div><dt className="inline font-bold">Action taken: </dt><dd className="inline">{h.action}</dd></div>
                    {h.followUp && <div><dt className="inline font-bold">Follow-up: </dt><dd className="inline">{h.followUp}</dd></div>}
                    <div className="text-[10px] font-bold text-slate-500 pt-1">Recorded by: {h.officer}</div>
                  </dl>
                </div>
              ))}
            </div>
          </DetailCard>
        </>
      )}
    </div>
  );
}
