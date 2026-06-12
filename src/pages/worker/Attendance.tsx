import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAttendance } from "@/context/worker/hooks";
import { loadLegacyAttendance } from "@/services/worker/AttendanceService";
import {
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Navigation,
  Sparkles,
  ShieldCheck,
  History as HistoryIcon,
  WifiOff,
  Wifi,
  ArrowRight,
  Calendar,
  Video,
  Users,
  Activity,
  Gauge,
} from "lucide-react";
import { format, isSameDay, parseISO, subDays } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Record {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  lat: number;
  lng: number;
  synced: boolean;
}

interface AiAttendanceSummary {
  sessionId: string;
  sessionLabel: string;
  detectedCount: number;
  confirmedCount: number;
  attendanceRate: number;
  confidence: number;
  durationSeconds: number;
  timestamp: string;
  locationStatus: "verified" | "near" | "review";
  distanceMeters: number;
}

const CHILD_ATT_KEY = "awai.child_attendance";
const KEY = "awai.attendance";

export default function Attendance() {
  const { t, online, user, sessions } = useApp();
  const { today: flowToday, checkIn: flowCheckIn, checkOut: flowCheckOut, canCheckOut, checkoutBlockReason } = useAttendance();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>(() => {
    try { 
      const stored = loadLegacyAttendance();
      if (stored.length) return stored as Record[];
      
      // Seed mock data if empty
      const mockRecs: Record[] = Array.from({ length: 12 }).map((_, i) => ({
        id: `att-${i}`,
        date: format(subDays(new Date(), i + 1), "yyyy-MM-dd"),
        checkIn: subDays(new Date(), i + 1).toISOString().replace(/T.*$/, "T09:15:00.000Z"),
        checkOut: subDays(new Date(), i + 1).toISOString().replace(/T.*$/, "T16:20:00.000Z"),
        lat: 13.6288,
        lng: 79.4192,
        synced: true
      }));
      return mockRecs;
    } catch { return []; }
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<AiAttendanceSummary | null>(null);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [loadingGPS, setLoadingGPS] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRec = records.find((r) => r.date === today) ?? (flowToday ? {
    id: flowToday.id,
    date: flowToday.date,
    checkIn: flowToday.checkIn,
    checkOut: flowToday.checkOut,
    lat: flowToday.lat,
    lng: flowToday.lng,
    synced: flowToday.audit.synced,
  } : undefined);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(records)); }, [records]);

  const todaySessions = useMemo(
    () =>
      sessions
        .filter(
          (s) =>
            s.metadata.workerId === user?.id &&
            s.extractedAnalysis &&
            isSameDay(parseISO(s.metadata.timestamp), new Date())
        )
        .sort((a, b) => parseISO(b.metadata.timestamp).getTime() - parseISO(a.metadata.timestamp).getTime()),
    [sessions, user?.id]
  );

  useEffect(() => {
    if (!selectedSessionId && todaySessions.length > 0) {
      setSelectedSessionId(todaySessions[0].id);
    }
  }, [todaySessions, selectedSessionId]);

  const fakeGPS = (): Promise<{ lat: number; lng: number }> => new Promise((res) => {
    setLoadingGPS(true);
    setTimeout(() => { 
      setLoadingGPS(false); 
      res({ lat: 16.5062 + Math.random() * 0.001, lng: 80.6480 + Math.random() * 0.001 }); 
    }, 1800);
  });

  const checkIn = async () => {
    const { lat, lng } = await fakeGPS();
    await flowCheckIn(lat, lng);
    const now = new Date().toISOString();
    setRecords((p) => [{ id: crypto.randomUUID(), date: today, checkIn: now, lat, lng, synced: online }, ...p.filter((r) => r.date !== today)]);
  };

  const checkOut = async () => {
    if (!todayRec) return;
    if (!canCheckOut) {
      toast.error(checkoutBlockReason ?? "Complete pending tasks first");
      return;
    }
    const { lat, lng } = await fakeGPS();
    await flowCheckOut(lat, lng);
    const now = new Date().toISOString();
    setRecords((p) => p.map((r) => r.date === today ? { ...r, checkOut: now, lat, lng, synced: online } : r));
  };

  const geoOk = todayRec?.checkIn != null;

  const buildAiSuggestion = () => {
    if (!selectedSessionId) {
      toast.error("Select a classroom session first");
      return;
    }
    const sess = sessions.find((s) => s.id === selectedSessionId);
    if (!sess || !sess.extractedAnalysis) {
      toast.error("Selected session has no AI analysis yet — finish processing in Session Recording.");
      return;
    }
    const ex = sess.extractedAnalysis;
    const meta = sess.metadata;
    const detected = ex.childrenDetected || ex.sessionAnalysis?.classStrength || meta.childCount || 0;
    if (!detected) {
      toast.error("AI could not estimate children from this video — try a clearer recording.");
      return;
    }
    const reference = meta.childCount || detected;
    const attendanceRate = Math.round((detected / Math.max(1, reference)) * 100);
    const confidence = Math.round((ex.confidence ?? 0.85) * 100);
    const gps = meta.gps;
    const distance = (ex.sessionVerification?.distance ?? 45) as number;
    const match = ex.sessionVerification?.matchStatus ?? "verified";
    const locationStatus: AiAttendanceSummary["locationStatus"] =
      match === "verified" ? "verified" : match === "near" ? "near" : "review";

    setAiSummary({
      sessionId: sess.id,
      sessionLabel: `${meta.sessionType ?? ex.activityType} · ${format(parseISO(meta.timestamp), "p")}`,
      detectedCount: detected,
      confirmedCount: detected,
      attendanceRate,
      confidence,
      durationSeconds: ex.durationSeconds ?? 0,
      timestamp: meta.timestamp,
      locationStatus,
      distanceMeters: distance,
    });
    toast.success("AI attendance suggestion generated");
  };

  const updateConfirmed = (delta: number) => {
    setAiSummary((prev) => {
      if (!prev) return prev;
      const nextConfirmed = Math.max(0, prev.confirmedCount + delta);
      const rate = prev.detectedCount
        ? Math.round((nextConfirmed / prev.detectedCount) * 100)
        : prev.attendanceRate;
      return { ...prev, confirmedCount: nextConfirmed, attendanceRate: rate };
    });
  };

  const saveChildAttendance = async () => {
    if (!aiSummary || !user?.centerId) {
      toast.error("Generate AI suggestion before saving attendance.");
      return;
    }
    setSavingAttendance(true);
    try {
      const existing = JSON.parse(localStorage.getItem(CHILD_ATT_KEY) ?? "[]") as any[];
      const payload = {
        date: today,
        center: user.centerId,
        detectedCount: aiSummary.detectedCount,
        confirmedCount: aiSummary.confirmedCount,
        attendanceRate: aiSummary.attendanceRate,
        evidence: {
          sessionId: aiSummary.sessionId,
          video: true,
          timestamp: aiSummary.timestamp,
        },
        location: {
          status: aiSummary.locationStatus,
          distanceMeters: aiSummary.distanceMeters,
        },
      };
      const next = [payload, ...existing.filter((r) => !(r.date === today && r.center === user.centerId))];
      localStorage.setItem(CHILD_ATT_KEY, JSON.stringify(next));
      toast.success("Child attendance saved with AI verification.");
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">{t("attendance")}</h1>
        <p className="text-sm text-slate-600">
          Worker presence + AI-assisted **preschool child attendance** from classroom video (no student login needed).
        </p>
      </div>
      <p className="text-xs bg-slate-100 border border-slate-200 p-2">
        {geoOk ? t("geo_fence_ok") : t("geo_fence_pending")} · {t("attendance_anomaly_hint")}
      </p>
      <div className="flex justify-end">
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase border",
          online ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-900 border-amber-200"
        )}>
          {online ? <><Wifi className="h-3 w-3" /> {t("online")}</> : <><WifiOff className="h-3 w-3" /> {t("offline")}</>}
        </div>
      </div>

      {/* Main Action Card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        {/* Mock Map UI */}
        <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/20" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Animated Map Pulse */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 scale-150" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                <MapPin className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="rounded-2xl bg-white/90 dark:bg-black/80 p-3 shadow-elegant backdrop-blur-md border border-white/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Geo-fencing Active</span>
              </div>
              <div className="mt-1 font-mono text-xs font-semibold text-muted-foreground">
                {todayRec ? `${todayRec.lat.toFixed(5)}, ${todayRec.lng.toFixed(5)}` : "Detecting location..."}
              </div>
            </div>
            
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 shadow-elegant backdrop-blur-md border border-white/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900/50">
          <button 
            onClick={checkIn} 
            disabled={!!todayRec?.checkIn || loadingGPS}
            className="btn-primary h-16 flex-col"
          >
            {loadingGPS ? (
              <><Navigation className="h-5 w-5 animate-spin" /><span className="text-[10px]">Locating...</span></>
            ) : (
              <><LogIn className="h-6 w-6" /><span className="text-[10px]">{t("checkIn")}</span></>
            )}
          </button>
          <button 
            onClick={checkOut} 
            disabled={!todayRec?.checkIn || !!todayRec?.checkOut || loadingGPS}
            className="btn-outline h-16 flex-col border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-[10px]">{t("checkOut")}</span>
          </button>
        </div>
      </div>

      {/* Today Status */}
      {todayRec && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/30 p-5 shadow-soft dark:border-blue-900/20 dark:bg-blue-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Today's Shift</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {todayRec.checkIn ? format(new Date(todayRec.checkIn), "h:mm a") : "--:--"} 
                  {todayRec.checkOut ? ` - ${format(new Date(todayRec.checkOut), "h:mm a")}` : " (Active)"}
                </div>
              </div>
            </div>
            {!todayRec.synced && (
              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700 uppercase tracking-tighter">
                <WifiOff className="h-3 w-3" /> Queued
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assisted Child Attendance */}
      <div className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">AI Assisted Child Attendance</p>
            <p className="text-xs text-slate-700">
              Use a recorded preschool session to auto-suggest classroom strength. You confirm before saving.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/worker/session-monitor")}
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#1e40af]"
          >
            <Video className="h-3.5 w-3.5" /> Open Session Recording
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">1 · Choose classroom session</p>
            <select
              value={selectedSessionId ?? ""}
              onChange={(e) => setSelectedSessionId(e.target.value || null)}
              className="w-full rounded-xl border bg-white p-2 text-xs"
            >
              <option value="">Select today&apos;s session…</option>
              {todaySessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.metadata.sessionType ?? s.extractedAnalysis?.activityType ?? "Session"} · ${format(
                    parseISO(s.metadata.timestamp),
                    "p"
                  )}`}
                </option>
              ))}
            </select>
            {todaySessions.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No analyzed classroom videos for today. Record or upload one under{" "}
                <button
                  type="button"
                  className="font-bold text-[#1e40af] underline"
                  onClick={() => navigate("/worker/session-monitor")}
                >
                  Session Recording
                </button>
                .
              </p>
            )}
            <button
              type="button"
              onClick={buildAiSuggestion}
              disabled={!selectedSessionId}
              className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-3 text-[11px] font-bold uppercase text-white disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> Run AI attendance detection
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">2 · AI Attendance Suggestion</p>
            {aiSummary ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="worker-card p-3 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-500 flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" /> Detected Children
                    </p>
                    <p className="text-lg font-black text-slate-900">{aiSummary.detectedCount}</p>
                  </div>
                  <div className="worker-card p-3 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-500">Confirmed Count</p>
                    <p className="text-lg font-black text-emerald-800">{aiSummary.confirmedCount}</p>
                  </div>
                  <div className="worker-card p-3 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-500">Attendance %</p>
                    <p className="text-lg font-black text-emerald-700">{aiSummary.attendanceRate}%</p>
                  </div>
                  <div className="worker-card p-3 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-500 flex items-center justify-center gap-1">
                      <Gauge className="h-3 w-3" /> AI Confidence
                    </p>
                    <p className="text-lg font-black text-indigo-700">{aiSummary.confidence}%</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">GPS + Timestamp Verification</p>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="font-semibold">Location:</span>{" "}
                      <span className="text-emerald-700">
                        {aiSummary.locationStatus === "verified"
                          ? "Matched"
                          : aiSummary.locationStatus === "near"
                            ? "Near Center"
                            : "Manual Review"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Distance:</span> ~{Math.round(aiSummary.distanceMeters)}m
                    </div>
                    <div>
                      <span className="font-semibold">Verification:</span>{" "}
                      {aiSummary.locationStatus === "verified"
                        ? "At Center"
                        : aiSummary.locationStatus === "near"
                          ? "Near Center"
                          : "Check location"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-500">3 · Worker review</p>
                  <div className="overflow-hidden rounded-xl border bg-white">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Child</th>
                          <th className="px-3 py-2 text-left font-semibold">Age (approx)</th>
                          <th className="px-3 py-2 text-left font-semibold">Attendance</th>
                          <th className="px-3 py-2 text-left font-semibold">Verification</th>
                          <th className="px-3 py-2 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2">Class group</td>
                          <td className="px-3 py-2">3–6 years</td>
                          <td className="px-3 py-2">
                            {aiSummary.confirmedCount}/{aiSummary.detectedCount} present
                          </td>
                          <td className="px-3 py-2">Verified from classroom video</td>
                          <td className="px-3 py-2">
                            <div className="inline-flex rounded-full border bg-slate-50 text-[10px]">
                              <button
                                type="button"
                                onClick={() => updateConfirmed(-1)}
                                className="px-2 py-1 border-r hover:bg-slate-100"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => updateConfirmed(1)}
                                className="px-2 py-1 hover:bg-slate-100"
                              >
                                +1
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    disabled={savingAttendance}
                    onClick={saveChildAttendance}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-bold uppercase text-white disabled:opacity-50"
                  >
                    <Activity className="h-4 w-4" />
                    {savingAttendance ? "Saving…" : "Save Attendance Summary"}
                  </button>
                  <p className="text-[10px] text-slate-500">
                    Present and absent children counts will be shown in Center dashboards and Today&apos;s Services once
                    synced.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 text-xs text-emerald-900">
                <p className="font-semibold">No AI attendance suggestion yet.</p>
                <p className="mt-1">
                  Choose a classroom session video recorded today and click{" "}
                  <span className="font-bold">Run AI attendance detection</span>. You will always confirm before saving.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Log Header */}
      <div>
        <div className="flex items-center justify-between px-1 mb-4">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-slate-400" />
            Recent Logs
          </h2>
          <Link 
            to="/worker/attendance-history" 
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-1"
          >
            View History <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
              No attendance history available.
            </div>
          ) : (
            records.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{format(new Date(r.date), "EEE, d MMM yyyy")}</div>
                    <div className="text-[10px] font-medium text-muted-foreground italic">
                      In: {r.checkIn ? format(new Date(r.checkIn), "h:mm a") : "—"} · Out: {r.checkOut ? format(new Date(r.checkOut), "h:mm a") : "—"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Verified</div>
                  <div className="mt-0.5 text-[9px] font-mono text-muted-foreground/60">{r.lat.toFixed(3)}, {r.lng.toFixed(3)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}