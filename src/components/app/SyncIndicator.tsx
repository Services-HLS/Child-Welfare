import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function SyncIndicator() {
  const { online, toggleOnline, lastSync, t } = useApp();
  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force((n) => n + 1), 30_000); return () => clearInterval(i); }, []);
  return (
    <div className="flex items-center gap-1">
    <Link to="/settings/sync" className="hidden sm:inline text-[10px] font-semibold text-white/70 hover:text-white px-2">Sync</Link>
    <button
      onClick={toggleOnline}
      className={`group inline-flex items-center gap-2 border px-2 py-1 text-[10px] font-semibold transition ${
        online ? "border-emerald-400/40 bg-emerald-900/30 text-emerald-100" : "border-amber-400/40 bg-amber-900/30 text-amber-100"
      }`}
      title="Toggle simulated connectivity"
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{online ? t("online") : t("offline")}</span>
      <span className="hidden sm:inline opacity-70">· {t("lastSync")} {formatDistanceToNow(lastSync, { addSuffix: true })}</span>
      <RefreshCw className="h-3 w-3 opacity-0 transition group-hover:opacity-70" />
    </button>
    </div>
  );
}