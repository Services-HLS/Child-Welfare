import { useApp } from "@/context/AppContext";
import { useWorkerFlow } from "@/context/worker/WorkerFlowContext";
import { WorkerFieldLayout } from "@/components/worker/WorkerFieldLayout";
import { DayTimeline } from "@/components/worker/DayTimeline";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2 } from "lucide-react";

export default function MyDay() {
  const { t, notifications, user } = useApp();
  const { progress, unreadAlerts } = useWorkerFlow();
  const m = progress.metrics;

  const reminders = notifications.filter((n) => (n.role === "worker" || n.userId === user?.id) && !n.read).slice(0, 5);
  const completedCount =
    progress.steps.filter((s) => s.status === "done").length;

  return (
    <WorkerFieldLayout title={t("my_day")} subtitle={t("my_day_subtitle")}>
      <p className="text-sm text-slate-700 mb-2">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
      <p className="text-xs font-semibold text-[#1e3a5f] mb-4">
        Day progress: {progress.progressPercent}% · {progress.flowState.replace(/_/g, " ")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        <section className="lg:col-span-8 worker-card border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase text-slate-600 mb-3">{t("scheduled_today")}</h3>
          <DayTimeline steps={progress.steps} />
        </section>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <section className="grid grid-cols-2 gap-2">
            <div className="worker-card border p-3 bg-emerald-50">
              <p className="text-[10px] font-bold uppercase text-emerald-800">{t("completed")}</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
            <div className="worker-card border p-3 bg-amber-50">
              <p className="text-[10px] font-bold uppercase text-amber-900">{t("pending_work")}</p>
              <p className="text-2xl font-bold">{progress.steps.filter((s) => s.status !== "done").length}</p>
            </div>
          </section>

          <div className="worker-card border p-3 text-xs space-y-1">
            <p><strong>Attendance:</strong> {m.attendanceLabel}</p>
            <p><strong>Session:</strong> {m.sessionLabel}</p>
            <p><strong>Services:</strong> {m.activitiesDone}/{m.activitiesTarget}</p>
            <p><strong>Uploads pending:</strong> {m.uploadPending}</p>
            <p><strong>Open issues:</strong> {m.openIssues}</p>
          </div>

          {reminders.length > 0 && (
            <section className="worker-card border border-slate-200 p-3 sm:p-4 flex-1">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1 mb-2">
                <Bell className="h-3.5 w-3.5" /> {t("reminders")}
                {unreadAlerts > 0 && <span className="text-rose-600">({unreadAlerts})</span>}
              </h3>
              {reminders.map((n) => (
                <p key={n.id} className="text-sm py-1 border-b border-slate-100">{n.title}</p>
              ))}
              <Link to="/worker/alerts" className="text-xs font-semibold text-[#1e40af] mt-2 inline-block">{t("communication_center")} →</Link>
            </section>
          )}

          <Link to="/worker/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e40af]">
            <CheckCircle2 className="h-4 w-4" /> {t("daily_operations_console")}
          </Link>
        </div>
      </div>
    </WorkerFieldLayout>
  );
}
