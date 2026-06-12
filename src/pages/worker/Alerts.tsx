import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Bell, CheckCircle2, Info, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Tab = "notifications" | "supervisor" | "complaints" | "training" | "department";

const TABS: { id: Tab; labelKey: string }[] = [
  { id: "notifications", labelKey: "tab_notifications" },
  { id: "supervisor", labelKey: "tab_supervisor" },
  { id: "complaints", labelKey: "tab_complaint_updates" },
  { id: "training", labelKey: "tab_training_msgs" },
  { id: "department", labelKey: "tab_department" },
];

export default function Alerts() {
  const { activities, user, notifications, t, online } = useApp();
  const [tab, setTab] = useState<Tab>("notifications");

  const myActivities = activities.filter((a) => a.centerId === user?.centerId);
  const mine = notifications.filter((n) => n.role === "worker" || n.userId === user?.id);

  const tabItems = useMemo(() => {
    const base = mine.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.body,
      time: format(new Date(n.createdAt), "MMM d, h:mm a"),
      priority: /urgent|critical|sla/i.test(n.title + n.body) ? ("high" as const) : ("medium" as const),
      read: n.read,
      link: n.actionUrl,
    }));

    if (tab === "supervisor") {
      return base.filter((n) => /supervisor|coaching|visit/i.test(n.title + n.message));
    }
    if (tab === "complaints") {
      return base.filter((n) => /complaint|grievance|issue/i.test(n.title + n.message));
    }
    if (tab === "training") {
      return base.filter((n) => /training|module|learn/i.test(n.title + n.message));
    }
    if (tab === "department") {
      return base.filter((n) => /department|wdcw|announcement|policy/i.test(n.title + n.message));
    }
    return base;
  }, [mine, tab]);

  const evidenceReminders = myActivities
    .filter((a) => !a.imageUrl && a.status === "pending")
    .slice(0, 3)
    .map((a) => ({
      id: `ev-${a.id}`,
      title: "Evidence pending",
      message: `${a.type} — add photo when online`,
      time: format(new Date(a.timestamp), "MMM d"),
      priority: "medium" as const,
      read: false,
      link: "/worker/service-upload",
    }));

  const list = tab === "notifications" ? [...evidenceReminders, ...tabItems] : tabItems;

  return (
    <div className="space-y-6 pb-20 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">{t("communication_center")}</h1>
        <p className="text-sm text-slate-600">
          {online ? t("online") : t("offline")} · read messages offline
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold border",
              tab === tb.id ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-slate-700 border-slate-200"
            )}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(t as (k: string) => string)(tb.labelKey)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length > 0 ? (
          list.map((item) => (
            <div
              key={item.id}
              className={cn(
                "worker-card p-4 border-l-4",
                item.priority === "high" ? "border-l-rose-500" : item.priority === "medium" ? "border-l-amber-500" : "border-l-blue-500",
                !item.read && "bg-blue-50/40"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.time}
                  </span>
                </div>
                {item.priority === "high" && (
                  <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Priority
                  </span>
                )}
              </div>
              {item.link && (
                <Link to={item.link} className="text-xs font-semibold text-[#1e3a5f] mt-2 inline-block">
                  Open →
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="worker-card p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">No messages in this section</p>
            <p className="text-xs text-slate-500 mt-1">New updates will appear here</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Bell className="h-4 w-4" />
        <Info className="h-4 w-4" />
        Department circulars sync when network is available
      </div>
    </div>
  );
}
