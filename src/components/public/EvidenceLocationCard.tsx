import { EvidenceGeoMeta } from "@/services/public/evidenceVerification";
import { MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<EvidenceGeoMeta["status"], string> = {
  verified: "Verified",
  near_center: "Near Center",
  outside_zone: "Outside Zone",
  manual_review: "Manual Review Required",
};

export function EvidenceLocationCard({ geo, centerName }: { geo: EvidenceGeoMeta; centerName: string }) {
  const ok = geo.status === "verified" || geo.status === "near_center";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-2">
        <MapPin className="h-3.5 w-3.5" /> Evidence location validation
      </h4>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[9px] uppercase text-slate-400">Citizen submitted</p>
          <p className="font-mono text-xs">{geo.lat?.toFixed(4)}, {geo.lng?.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-slate-400">Anganwadi center</p>
          <p className="font-semibold">{centerName}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-slate-400">Distance</p>
          <p className="font-bold">{geo.distanceMeters} m</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-slate-400">Match</p>
          <p className="font-bold text-[#1e40af]">{geo.matchPercent}%</p>
        </div>
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold",
          ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
        )}
      >
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {STATUS_LABEL[geo.status]} — {geo.citizenSummary}
      </div>
      <div className="mt-2 h-24 rounded-lg bg-slate-100 border flex items-center justify-center text-[10px] text-slate-500">
        Map preview · WDCW geofence (demo)
      </div>
    </div>
  );
}
