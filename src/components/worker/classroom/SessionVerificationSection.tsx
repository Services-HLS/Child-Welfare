import { useMemo, useState } from "react";
import {
  SessionVerification,
  SessionAuthenticityChecks,
  ClassroomEvidenceSummary,
  ClassroomObservationSummary,
  VerificationTimelineStep,
} from "@/types/session-verification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MapPin, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

function StatusBadge({
  status,
}: {
  status: SessionVerification["matchStatus"];
}) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 text-sm font-bold">
        <span aria-hidden>🟢</span> Location Matched
      </span>
    );
  }
  if (status === "near") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 text-sm font-bold">
        <span aria-hidden>🟠</span> Slight Deviation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1.5 text-sm font-bold">
      <span aria-hidden>🔴</span> Location Review Required
    </span>
  );
}

function CheckRow({ label, status }: { label: string; status: string }) {
  const icon =
    status === "verified" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    ) : status === "review" ? (
      <AlertTriangle className="h-4 w-4 text-amber-600" />
    ) : (
      <HelpCircle className="h-4 w-4 text-slate-400" />
    );
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="flex items-center gap-2 font-bold capitalize text-slate-900">
        {icon}
        {status}
      </span>
    </div>
  );
}

function MiniMap({ verification }: { verification: SessionVerification }) {
  const { centerLatitude: clat, centerLongitude: clng, capturedLatitude: slat, capturedLongitude: slng } =
    verification;
  const hasSession = slat != null && slng != null;
  const mapUrl = hasSession
    ? `https://www.google.com/maps/dir/?api=1&origin=${clat},${clng}&destination=${slat},${slng}`
    : `https://www.google.com/maps?q=${clat},${clng}`;

  return (
    <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-[#e8f0f8]">
      <div className="relative h-48 sm:h-56 p-4">
        <svg viewBox="0 0 400 200" className="w-full h-full" aria-label="Map showing center and session pins">
          <rect width="400" height="200" fill="#dbeafe" />
          <path d="M0 120 Q100 80 200 100 T400 90" stroke="#93c5fd" fill="none" strokeWidth="2" />
          <line
            x1="120"
            y1="100"
            x2={hasSession ? "280" : "120"}
            y2={hasSession ? "85" : "100"}
            stroke="#1e40af"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <circle cx="120" cy="100" r="14" fill="#1e3a5f" stroke="#fff" strokeWidth="3" />
          <text x="120" y="130" textAnchor="middle" fontSize="11" fill="#0F172A" fontWeight="bold">
            Center
          </text>
          {hasSession && (
            <>
              <circle cx="280" cy="85" r="12" fill="#dc2626" stroke="#fff" strokeWidth="3" />
              <text x="280" y="115" textAnchor="middle" fontSize="11" fill="#0F172A" fontWeight="bold">
                Session
              </text>
            </>
          )}
        </svg>
        <p className="absolute bottom-2 left-2 right-2 text-[10px] bg-white/90 rounded px-2 py-1 border text-slate-600">
          Center pin · Session pin
          {verification.distance != null ? ` · ${verification.distance} m apart` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 p-3 bg-white border-t">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gov-btn-outline text-xs flex items-center gap-1 py-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open Full Map
        </a>
      </div>
    </div>
  );
}

export function SessionVerificationSection({
  verification,
  authenticity,
  evidence,
  observation,
  timeline,
  onRefreshGps,
}: {
  verification: SessionVerification;
  authenticity: SessionAuthenticityChecks;
  evidence: ClassroomEvidenceSummary;
  observation: ClassroomObservationSummary;
  timeline: VerificationTimelineStep[];
  onRefreshGps?: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefreshGps) return;
    setRefreshing(true);
    try {
      onRefreshGps();
      toast.success("GPS refreshed from device");
    } finally {
      setRefreshing(false);
    }
  };

  const capturedTime = useMemo(
    () => format(new Date(verification.timestamp), "PPpp"),
    [verification.timestamp]
  );

  return (
    <div className="space-y-5">
      <div className="bg-[#0F172A] text-white px-4 py-4 border-l-4 border-amber-400">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Andhra Pradesh Government · WDCW</p>
        <h2 className="text-xl font-bold mt-1">Verified Classroom Observation Report</h2>
        <p className="text-sm text-white/85 mt-1">Official field evidence — location, authenticity, and classroom context</p>
      </div>

      <section className="worker-card border-2 border-[#1e3a5f] bg-white overflow-hidden">
        <div className="bg-[#1e3a5f] text-white px-4 py-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Session Verification
          </h3>
          <p className="text-xs text-white/85 mt-1">
            Verify whether classroom session happened at assigned Anganwadi location.
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={verification.matchStatus} />
            <p className="text-sm text-slate-700 flex-1 min-w-[200px]">{verification.explanation}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Assigned Center</h4>
              <p className="font-bold text-[#0F172A]">{verification.centerName}</p>
              <p className="text-sm text-slate-600">{verification.village} · {verification.district}</p>
              <p className="text-xs font-mono mt-2 text-slate-600">
                {verification.centerLatitude.toFixed(5)}, {verification.centerLongitude.toFixed(5)}
              </p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Session Location</h4>
              {verification.gpsAvailable && verification.capturedLatitude != null ? (
                <>
                  <p className="text-xs text-slate-500">Latitude / Longitude</p>
                  <p className="font-mono text-sm font-semibold text-[#0F172A]">
                    {verification.capturedLatitude.toFixed(5)}, {verification.capturedLongitude!.toFixed(5)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Captured Time</p>
                  <p className="text-sm font-semibold">{capturedTime}</p>
                </>
              ) : (
                <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="font-bold">Location unavailable.</p>
                  <p className="mt-1 text-xs">Fallback verification enabled.</p>
                  <ul className="mt-2 text-xs space-y-1 list-disc pl-4">
                    <li>Timestamp: {capturedTime}</li>
                    <li>Device: {verification.deviceLabel}</li>
                    <li>Video metadata integrity check</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Distance (Haversine)</p>
              <p className="text-2xl font-bold text-[#1e3a5f]">
                {verification.distance != null ? `${verification.distance} m` : "—"}
              </p>
            </div>
            <div className="text-xs text-slate-600">
              <p>0–100 m = Verified</p>
              <p>101–250 m = Near Center</p>
              <p>250 m+ = Needs Review</p>
            </div>
            {onRefreshGps && (
              <button
                type="button"
                disabled={refreshing}
                onClick={() => void handleRefresh()}
                className="gov-btn-outline text-xs ml-auto flex items-center gap-1"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Refresh GPS
              </button>
            )}
          </div>

          <MiniMap verification={verification} />
        </div>
      </section>

      <section className="worker-card border border-slate-200 p-4 sm:p-5">
        <h4 className="text-sm font-bold uppercase text-[#0F172A] mb-3">Session Authenticity Verification</h4>
        <CheckRow label="Time Match" status={authenticity.timeMatch} />
        <CheckRow label="Center Match" status={authenticity.centerMatch} />
        <CheckRow label="Device Match" status={authenticity.deviceMatch} />
        <CheckRow label="Upload Integrity" status={authenticity.uploadIntegrity} />
      </section>

      <section className="worker-card border border-slate-200 p-4 sm:p-5">
        <h4 className="text-sm font-bold uppercase text-[#0F172A] mb-3">Classroom Evidence Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-50 border rounded p-3">
            <p className="text-[10px] uppercase text-slate-500">Children</p>
            <p className="text-xl font-bold">{evidence.childrenDetected}</p>
            <p className="text-[10px] text-slate-500">Visible {evidence.childrenVisibleRange}</p>
          </div>
          <div className="bg-slate-50 border rounded p-3">
            <p className="text-[10px] uppercase text-slate-500">Teacher</p>
            <p className="text-lg font-bold">{evidence.teacherVisible}</p>
          </div>
          <div className="bg-slate-50 border rounded p-3">
            <p className="text-[10px] uppercase text-slate-500">Activity</p>
            <p className="text-sm font-bold leading-tight">{evidence.activityDetected}</p>
          </div>
          <div className="bg-slate-50 border rounded p-3">
            <p className="text-[10px] uppercase text-slate-500">Story · Transcript</p>
            <p className="text-sm font-bold">{evidence.storyDetected}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {evidence.transcriptAvailable ? "Available" : "Pending"}
            </p>
          </div>
        </div>
      </section>

      <section className="worker-card border border-slate-200 p-4 sm:p-5">
        <h4 className="text-sm font-bold uppercase text-[#0F172A] mb-4">Classroom Observation</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="border-l-4 border-[#1e40af] bg-blue-50/50 p-3 rounded">
            <p className="text-[10px] font-bold uppercase text-slate-500">Children In Class</p>
            <p className="text-sm mt-1">Estimated: <span className="font-bold text-lg">{observation.childrenEstimated}</span></p>
            <p className="text-sm">Visible: {observation.childrenVisible}</p>
          </div>
          <div className="border-l-4 border-emerald-600 bg-emerald-50/50 p-3 rounded">
            <p className="text-[10px] font-bold uppercase text-slate-500">Teacher Activity</p>
            <ul className="text-sm font-semibold mt-1 space-y-0.5">
              {observation.teacherActivities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="border-l-4 border-amber-500 bg-amber-50/50 p-3 rounded">
            <p className="text-[10px] font-bold uppercase text-slate-500">Participation</p>
            <p className="text-sm mt-1">
              Children Listening: <span className="font-bold">{observation.childrenListeningPercent}%</span>
            </p>
            <p className="text-sm">Interaction: {observation.interactionLevel}</p>
          </div>
          <div className="border-l-4 border-violet-600 bg-violet-50/50 p-3 rounded">
            <p className="text-[10px] font-bold uppercase text-slate-500">Session Outcome</p>
            <p className="text-sm font-bold mt-1">{observation.storyCompleted ? "Story Completed" : "In progress"}</p>
            <p className="text-sm font-bold">{observation.childrenEngaged ? "Children Engaged" : "Mixed engagement"}</p>
          </div>
        </div>
        <ul className="text-base text-slate-800 space-y-2 border-t pt-3">
          {observation.conciseObservations.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="text-[#1e40af] font-bold">•</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <section className="worker-card border border-dashed border-slate-300 p-4">
        <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Verification Timeline</h4>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-0 text-sm font-semibold text-slate-700">
          {timeline.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs text-white shrink-0",
                  step.status === "done" ? "bg-emerald-600" : "bg-slate-300"
                )}
              >
                {step.status === "done" ? "✓" : "·"}
              </span>
              <span>{step.label}</span>
              {i < timeline.length - 1 && (
                <span className="hidden sm:inline text-slate-400 mx-2">↓</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
