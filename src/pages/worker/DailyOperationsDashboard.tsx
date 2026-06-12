import { useApp } from "@/context/AppContext";
import { useWorkerFlow } from "@/context/worker/WorkerFlowContext";
import { WorkerFieldLayout, WorkerSummaryCard, WorkerQuickBtn } from "@/components/worker/WorkerFieldLayout";
import { DayTimeline as DayTimelineComponent } from "@/components/worker/DayTimeline";
import { format } from "date-fns";
import {
  LogIn,
  Play,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  ListChecks,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function DailyOperationsDashboard() {
  const { user, t, online } = useApp();
  const { progress, uploadQueue, unreadAlerts } = useWorkerFlow();
  const m = progress.metrics;
  const pendingSync = uploadQueue.filter((q) => q.status !== "verified").length;

  const badgeLabel =
    progress.completionBadge === "day_complete"
      ? "Day complete"
      : progress.completionBadge === "almost_done"
        ? "Almost done"
        : progress.completionBadge === "in_progress"
          ? "In progress"
          : "Start your day";

  return (
    <WorkerFieldLayout
      title={t("daily_operations_console")}
      subtitle={`${t("greeting")}, ${user?.name?.split(" ")[0]} — ${t("worker_day_planner_hint")}`}
      hideStatus
    >
      <div className="worker-field-status border-2 border-[#1e3a5f] bg-[#0F172A] text-white px-4 py-3 mb-4 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-200/90">Government of Andhra Pradesh · WDCW</p>
            <h2 className="text-lg font-bold mt-1">{t("daily_operations_console")}</h2>
            <p className="text-xs text-white/85 mt-1">{user?.centerName} · {format(new Date(), "EEEE, d MMMM")}</p>
            <p className="text-sm font-semibold text-emerald-200 mt-2">{m.attendanceLabel}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progress.progressPercent}%</div>
            <div className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", progress.completionBadge === "day_complete" ? "bg-emerald-500" : "bg-amber-400 text-[#0F172A]")}>
              {badgeLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
        <WorkerSummaryCard label={t("attendance")} value={m.attendanceLabel} accent={m.attendanceLabel.includes("duty") || m.attendanceLabel.includes("complete") ? "green" : "amber"} href="/worker/attendance" />
        <WorkerSummaryCard label={t("todays_sessions")} value={m.sessionLabel} href="/worker/session-monitor" accent="blue" />
        <WorkerSummaryCard label={t("activities_pending")} value={`${m.activitiesDone}/${m.activitiesTarget}`} hint={`${m.activitiesPercent}%`} href="/worker/activities" accent="amber" />
        <WorkerSummaryCard label={t("training_progress")} value={m.trainingPending} href="/worker/training" accent="slate" />
        <WorkerSummaryCard label={t("service_completion")} value={`${m.serviceCompletionPercent}%`} accent="green" />
      </div>

      <section className="mt-4">
        <h3 className="text-xs font-bold uppercase text-slate-600 mb-2">{t("quick_actions")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
          <WorkerQuickBtn label={t("check_in")} href="/worker/attendance" icon={LogIn} primary />
          <WorkerQuickBtn label={t("start_preschool")} href="/worker/session-monitor" icon={Play} primary />
          <WorkerQuickBtn label={t("submit_activity")} href="/worker/activities" icon={ClipboardList} />
          <WorkerQuickBtn label={t("continue_training")} href="/worker/training" icon={GraduationCap} />
          <WorkerQuickBtn label={t("sync_offline")} href="/settings/sync" icon={RefreshCw} />
        </div>
      </section>

      <section className="mt-4 worker-card border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-slate-600">{t("full_day_timeline")}</h3>
          <Link to="/worker/my-day" className="text-[10px] font-bold text-[#1e40af] flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" /> {t("my_day")}
            {unreadAlerts > 0 && <span className="bg-rose-500 text-white px-1.5 rounded-full">{unreadAlerts}</span>}
          </Link>
        </div>
        <DayTimelineComponent steps={progress.steps} />
      </section>

      {!online && (
        <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2">
          {t("offline_queue_notice")} {pendingSync > 0 && `(${pendingSync} items)`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        <Link to="/worker/my-day" className="font-semibold text-[#1e40af]">{t("my_day")} →</Link>
        <Link to="/worker/uploads" className="font-semibold text-[#1e40af]">{t("service_submission_queue")} →</Link>
      </div>
    </WorkerFieldLayout>
  );
}
