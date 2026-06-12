import { useApp } from "@/context/AppContext";
import { formatDistanceToNow } from "date-fns";

export default function StateAdminNotifications() {
  const { notifications } = useApp();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase">Communication Center</h1>
      <p className="text-sm text-slate-500">Push · SMS · WhatsApp · In-app broadcast (all roles)</p>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-xl border bg-white p-4 text-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>{n.role} · {n.channel}</span>
              <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="font-bold mt-1">{n.title}</div>
            <div className="text-slate-600 text-xs">{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
