import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { usePublicSessionContext } from "@/hooks/usePublicSessionContext";
import { MyBenefitsEligibility } from "@/components/public/MyBenefitsEligibility";
import { CenterTrustScoreCard } from "@/components/public/CenterTrustScoreCard";
import { PublicCenterTimeline } from "@/components/public/PublicCenterTimeline";
import { buildCenterTrustScore } from "@/services/public/centerTrustScore";
import type { TransparencyBucket } from "@/services/public/publicRequestService";
import { getChildProgressHistory, getPrimaryChild } from "@/services/beneficiary/parentPortalData";
import { PublicPageHeader, GovPublicChip } from "@/components/beneficiary/ParentPageHeader";
import { SubmittedEvidenceSection } from "@/components/beneficiary/SubmittedEvidenceSection";
import { format } from "date-fns";
import { Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "attendance" | "meals" | "learning" | "progress";
type Range = "daily" | "weekly" | "monthly";
export default function MyChild() {
  const { user, complaints, feedback, sessions } = useApp();
  const { childProgress, activities, centerId, publicRequests, requestBuckets } = usePublicPortal();
  const { contextType } = usePublicSessionContext();
  const trust = useMemo(
    () => buildCenterTrustScore(centerId ?? "", feedback, complaints, activities, sessions),
    [centerId, feedback, complaints, activities, sessions]
  );
  const [params] = useSearchParams();
  const childId = params.get("child") ?? user?.children?.[0]?.id;
  const child = user?.children?.find((c) => c.id === childId) ?? (user ? getPrimaryChild(user) : undefined);
  const [tab, setTab] = useState<Tab>("attendance");
  const [range, setRange] = useState<Range>("weekly");
  const [evidenceFilter, setEvidenceFilter] = useState<TransparencyBucket | null>(null);

  const history = useMemo(
    () => (child && centerId ? getChildProgressHistory(child.id, centerId, childProgress) : []),
    [child, centerId, childProgress]
  );

  const photos = useMemo(
    () => activities.filter((a) => a.centerId === centerId && a.imageUrl).slice(0, 8),
    [activities, centerId]
  );

  if (!user) return null;

  const attendedDays = history.filter((h) => h.attended).length;
  const mealDays = history.filter((h) => h.nutritionCompleted).length;
  const centerActsWeek = activities.filter(
    (a) => a.centerId === centerId && Date.now() - new Date(a.timestamp).getTime() < 7 * 86400_000
  ).length;

  const downloadReport = () => {
    toast.success("Public service report ready", {
      description: "Demo PDF — WDCW Andhra Pradesh service summary",
    });
  };

  const serviceTitle = child ? child.name : user.name;
  const serviceSubtitle = child
    ? `${user.centerName} · Age ${child.age} · ECCE enrollment`
    : `${user.centerName} · Public beneficiary services`;

  return (
    <div className="space-y-5 pb-24 w-full">
      <PublicPageHeader
        badge="WDCW · Service Visibility Hub"
        title={serviceTitle}
        subtitle={serviceSubtitle}
      />

      <MyBenefitsEligibility contextType={contextType} centerName={user.centerName ?? ""} />
      <CenterTrustScoreCard trust={trust} />
      {centerId && <PublicCenterTimeline centerId={centerId} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GovPublicChip
          label="Service Usage"
          value={child ? `${attendedDays} days` : `${centerActsWeek} logs`}
          tone="good"
        />
        <GovPublicChip label="Services Received" value={child ? `${mealDays} meals` : "Active"} tone="good" />
        <GovPublicChip
          label="Participation"
          value={
            history[0]
              ? `${Math.round((history[0].preschoolParticipation ?? 0.8) * 100)}%`
              : child
                ? "—"
                : "Community"
          }
          tone="neutral"
        />
        <GovPublicChip
          label="Service Status"
          value={history[0]?.growthMilestone ?? (child ? "On track" : "Enrolled")}
          tone="good"
        />
      </div>

      <SubmittedEvidenceSection
        requests={publicRequests}
        buckets={requestBuckets}
        filterBucket={evidenceFilter}
        onFilterBucket={setEvidenceFilter}
      />

      {child && (
        <>
          <div className="flex flex-wrap gap-2">
            {(["daily", "weekly", "monthly"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "text-xs font-bold uppercase px-3 py-1.5 rounded-lg border",
                  range === r ? "bg-[#1e3a5f] text-white" : "bg-white"
                )}
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              onClick={downloadReport}
              className="gov-btn-outline text-xs ml-auto flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Download report
            </button>
          </div>

          <div className="flex flex-wrap gap-1 border-b border-slate-200">
            {(
              [
                ["attendance", "Service History"],
                ["meals", "Service Delivery"],
                ["learning", "Service Experience"],
                ["progress", "Service Outcome"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase border-b-2 -mb-px",
                  tab === id ? "border-[#1e3a5f] text-[#1e3a5f]" : "border-transparent text-slate-500"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "attendance" && (
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-slate-500">Service history will appear as the center logs daily services.</p>
              )}
              {history.map((h) => (
                <div key={h.id} className="worker-card p-4 flex justify-between">
                  <div>
                    <p className="font-bold text-sm">{format(new Date(h.date), "EEE, d MMM yyyy")}</p>
                    <p className="text-xs text-slate-600">{h.developmentalNote ?? "Regular day at Anganwadi"}</p>
                  </div>
                  <span className={cn("text-xs font-bold uppercase", h.attended ? "text-emerald-700" : "text-rose-700")}>
                    {h.attended ? "Present" : "Absent"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "meals" && (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="worker-card p-4 flex justify-between">
                  <p className="text-sm font-bold">{format(new Date(h.date), "d MMM")}</p>
                  <span className={cn("text-xs font-bold", h.nutritionCompleted ? "text-emerald-700" : "text-amber-700")}>
                    {h.nutritionCompleted ? "Meal received" : "Not recorded"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "learning" && (
            <div className="space-y-3">
              {history
                .filter((h) => h.learningObservation)
                .map((h) => (
                  <div key={h.id} className="worker-card p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{format(new Date(h.date), "PP")}</p>
                    <p className="text-sm mt-1">{h.learningObservation}</p>
                  </div>
                ))}
              {!history.some((h) => h.learningObservation) && (
                <p className="text-sm text-slate-500">Service experience notes will appear here.</p>
              )}
            </div>
          )}

          {tab === "progress" && (
            <div className="worker-card p-4 space-y-3">
              <p className="text-sm text-slate-700">
                <strong>Outcome:</strong> {history[0]?.growthMilestone ?? "Monitored at center"}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Development:</strong> {history[0]?.developmentalNote ?? "Participating in group activities"}
              </p>
              <p className="text-xs text-slate-500">View range: {range} summary — Anganwadi service logs</p>
            </div>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Center service photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {photos.map((a) => (
                <div key={a.id} className="rounded-lg overflow-hidden border bg-white">
                  <img src={a.imageUrl!} alt="" className="h-24 w-full object-cover" />
                  <p className="text-[9px] p-1 font-bold text-slate-600 truncate">{a.type}</p>
                </div>
              ))}
              {photos.length === 0 && (
                <p className="text-sm text-slate-500 col-span-full">Photos shared by the center will appear here.</p>
              )}
            </div>
          </section>
        </>
      )}

      {!child && (
        <p className="text-sm text-slate-600 rounded-xl border bg-slate-50 p-4">
          You are registered as a public citizen. Service delivery history for enrolled children appears when linked to
          your account. Use the table above to track all feedback and grievances with full evidence.
        </p>
      )}
    </div>
  );
}
