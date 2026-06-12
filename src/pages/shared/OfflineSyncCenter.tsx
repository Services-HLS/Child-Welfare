import { useApp } from "@/context/AppContext";
import { RefreshCw, HardDrive, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function OfflineSyncCenter() {
  const { syncQueue, retrySyncItem, online, lastSync, activities, sessions } = useApp();
  const pending = syncQueue.filter((q) => q.status !== "synced").length;
  const failed = syncQueue.filter((q) => q.status === "failed").length;
  const storageMb = ((activities.length + sessions.length) * 0.05).toFixed(1);

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <h1 className="text-2xl font-black uppercase">Offline Recovery Center</h1>
      <p className="text-sm text-slate-500">IndexedDB sync queue — visible and manageable</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{pending}</div><div className="text-[10px] uppercase text-slate-400">Pending uploads</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black text-red-600">{failed}</div><div className="text-[10px] uppercase text-slate-400">Failed</div></div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-2"><HardDrive className="h-5 w-5 text-slate-400" /><div><div className="text-lg font-black">~{storageMb} MB</div><div className="text-[10px] uppercase text-slate-400">Local storage est.</div></div></div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-2">
          {online ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
          <div><div className="text-sm font-black">{online ? "Online" : "Offline"}</div><div className="text-[10px] text-slate-400">Last sync {lastSync.toLocaleTimeString()}</div></div>
        </div>
      </div>
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b text-[10px] font-black uppercase text-slate-400">Upload queue</div>
        {syncQueue.length === 0 && <p className="p-4 text-sm text-slate-500">All items synced.</p>}
        {syncQueue.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b text-sm">
            <div>
              <div className="font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-400 uppercase">{item.type} · {item.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{item.progress}%</span>
              {item.status !== "synced" && (
                <button onClick={() => { retrySyncItem(item.id); toast.success("Retry queued"); }} className="p-2 rounded-lg border hover:bg-slate-50">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400">Storage health: IndexedDB AnganSakti360_DB v4 — activities, sessions, outcomes, surveys preserved offline-first.</p>
    </div>
  );
}
