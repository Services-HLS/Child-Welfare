import { SessionVerification } from "@/types/session-verification";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MapPin, CheckCircle2, Loader2 } from "lucide-react";

function statusUi(match: SessionVerification["matchStatus"]) {
  if (match === "verified") {
    return {
      badge: "🟢 Location Matched",
      className: "bg-emerald-50 border-emerald-400 text-emerald-900",
      icon: CheckCircle2,
    };
  }
  if (match === "near") {
    return {
      badge: "🟠 GPS Captured — Near Center",
      className: "bg-amber-50 border-amber-400 text-amber-900",
      icon: MapPin,
    };
  }
  return {
    badge: "🔴 GPS Captured — Review Required",
    className: "bg-rose-50 border-rose-400 text-rose-900",
    icon: MapPin,
  };
}

export function UploadGpsVerificationCard({
  verification,
  verifying,
}: {
  verification: SessionVerification | null;
  verifying?: boolean;
}) {
  if (verifying) {
    return (
      <div className="worker-card border-2 border-[#1e3a5f] bg-white p-4 flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e40af] shrink-0" />
        <div>
          <p className="font-bold text-sm text-[#0F172A]">Capturing GPS coordinates…</p>
          <p className="text-xs text-slate-600">Verifying session location against assigned Anganwadi center</p>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="worker-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">Location unavailable</p>
        <p className="text-xs mt-1">Fallback verification will use timestamp and device metadata.</p>
      </div>
    );
  }

  const ui = statusUi(verification.matchStatus);
  const Icon = ui.icon;

  return (
    <div className={cn("worker-card border-2 p-4 space-y-3", ui.className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Andhra Pradesh · WDCW Session Verification</p>
          <p className="text-base font-bold mt-0.5">{ui.badge}</p>
          <p className="text-xs font-semibold text-emerald-800 mt-0.5">GPS coordinates verified at assigned Anganwadi</p>
          <p className="text-xs mt-1 leading-relaxed">{verification.explanation}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white/70 rounded border border-black/10 p-3">
          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">Assigned center</p>
          <p className="font-semibold text-[#0F172A]">{verification.centerName}</p>
          <p className="text-slate-600">{verification.village} · {verification.district}</p>
          <p className="font-mono mt-1 text-slate-700">
            {verification.centerLatitude.toFixed(5)}, {verification.centerLongitude.toFixed(5)}
          </p>
        </div>
        <div className="bg-white/70 rounded border border-black/10 p-3">
          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">Session GPS (captured)</p>
          {verification.capturedLatitude != null && verification.capturedLongitude != null ? (
            <>
              <p className="font-mono font-semibold text-[#0F172A]">
                {verification.capturedLatitude.toFixed(5)}, {verification.capturedLongitude.toFixed(5)}
              </p>
              <p className="text-slate-600 mt-1">{format(new Date(verification.timestamp), "PPpp")}</p>
            </>
          ) : (
            <p className="text-slate-600">Using fallback metadata</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-black/10">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-70">Distance from center</p>
          <p className="text-xl font-bold">{verification.distance != null ? `${verification.distance} m` : "—"}</p>
        </div>
        <div className="text-[10px] opacity-80">
          <p>0–100 m = Verified</p>
          <p>101–250 m = Near center</p>
          <p>250 m+ = Needs review</p>
        </div>
      </div>
    </div>
  );
}
