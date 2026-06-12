import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useParentPortal } from "@/hooks/useParentPortal";
import { ParentPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "all" | "services" | "complaints" | "announcements" | "surveys";

function classifyNotif(title: string, body: string): Tab {
  const t = `${title} ${body}`.toLowerCase();
  if (t.includes("grievance") || t.includes("complaint")) return "complaints";
  if (t.includes("survey")) return "surveys";
  if (t.includes("announcement") || t.includes("scheme")) return "announcements";
  if (t.includes("meal") || t.includes("session") || t.includes("activity") || t.includes("service")) return "services";
  return "services";
}

export default function BeneficiaryNotifications() {
  const { user, markNotificationRead } = useApp();
  const { notifications } = useParentPortal();
  const [tab, setTab] = useState<Tab>("all");
  const [whatsapp, setWhatsapp] = useState(user?.notificationSettings?.whatsapp ?? true);
  const [sms, setSms] = useState(user?.notificationSettings?.sms ?? true);

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === user?.id || n.role === "beneficiary")
        .map((n) => ({ ...n, bucket: classifyNotif(n.title, n.body) }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, user?.id]
  );

  const filtered = tab === "all" ? mine : mine.filter((n) => n.bucket === tab);

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "services", label: "Services" },
    { id: "complaints", label: "Complaints" },
    { id: "announcements", label: "Announcements" },
    { id: "surveys", label: "Surveys" },
  ];

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <ParentPageHeader
        badge="Communication center"
        title="Updates & notifications"
        subtitle="Services, grievances, announcements, and surveys"
      />

      <div className="worker-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase text-slate-500">Alert preferences (demo)</p>
        <label className="flex items-center justify-between text-sm">
          <span>WhatsApp updates</span>
          <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>SMS alerts</span>
          <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>In-app notifications</span>
          <input type="checkbox" defaultChecked disabled />
        </label>
      </div>

      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "text-[10px] font-bold uppercase px-2 py-1 rounded border",
              tab === t.id ? "bg-[#1e3a5f] text-white" : "bg-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markNotificationRead(n.id)}
            className={cn(
              "w-full text-left rounded-2xl border p-4 transition",
              n.read ? "border-slate-100 bg-white opacity-70" : "border-blue-200 bg-blue-50/50"
            )}
          >
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>{n.bucket} · {n.channel}</span>
              <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="font-bold text-sm text-slate-900 mt-1">{n.title}</div>
            <div className="text-xs text-slate-600">{n.body}</div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">No notifications in this category.</p>}
      </div>
    </div>
  );
}
