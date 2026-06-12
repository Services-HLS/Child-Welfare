import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useSession } from "@/context/worker/hooks";
import { useWorkerFlow } from "@/context/worker/WorkerFlowContext";
import { SessionMetadata, SyllabusCategory } from "@/types/session";
import { SessionExtractedAnalysis, SessionProcessingState } from "@/types/session-extraction";
import {
  runClassroomExtractionPipeline,
  restoreProcessing,
  initProcessingState,
} from "@/services/ai/classroom-intelligence/extraction-pipeline";
import { UploadGpsVerificationCard } from "@/components/worker/classroom/UploadGpsVerificationCard";
import { SessionVerification } from "@/types/session-verification";
import { clearSessionProcessing } from "@/lib/storage/sessionProcessing";
import {
  createSessionVideoObjectUrl,
  createVideoObjectUrlFromBlob,
  isEphemeralBlobUrl,
  saveSessionVideoBlob,
} from "@/lib/storage/sessionVideo";
import { ExtractionPipelineBar } from "@/components/worker/classroom/ExtractionPipelineBar";
import { ClassroomExtractedReport } from "@/components/worker/classroom/ClassroomExtractedReport";
import { SessionClassroomVideo } from "@/components/worker/classroom/SessionClassroomVideo";
import {
  buildSessionVerification,
  buildAuthenticityChecks,
  buildVerificationTimeline,
  normalizeSessionVerification,
} from "@/services/session/buildSessionVerification";
import { resolveSessionGps } from "@/lib/geo/resolveSessionGps";
import { USE_DEMO_CLASSROOM_ANALYSIS } from "@/lib/featureFlags";
import { Video, Mic, Pause, Play, Square, MapPin, Loader2, WifiOff, FileVideo, GraduationCap, RotateCcw, FileText, Map } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYLLABUS: SyllabusCategory[] = ["language", "numeracy", "motor_skills", "socio_emotional", "creative", "general"];
const ACTIVITY_TYPES = ["Storytelling", "Rhymes", "Drawing", "Alphabet Learning", "Group Play", "Nutrition Awareness", "Custom Activity"];
const AGE_GROUPS = ["3-4 years", "4-5 years", "5-6 years", "Mixed 3-6"];
const DURATIONS = ["15 min", "20 min", "30 min", "45 min"];

type Phase = "setup" | "record" | "processing" | "analysis";
type InputMode = "live" | "upload";

export default function SessionMonitor() {
  const { user, addSession, updateSession, processSessionUpload, sessions, addNotification, online, t } = useApp();
  const { canStartSession, sessionBlockReason, dispatch } = useSession();
  const { dispatch: flowDispatch } = useWorkerFlow();
  const navigate = useNavigate();
  const location = useLocation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadFileRef = useRef<File | null>(null);
  const resumeAttemptedRef = useRef<Set<string>>(new Set());
  const blobUrlsRef = useRef<string[]>([]);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const trackBlobUrl = useCallback((url: string) => {
    blobUrlsRef.current.push(url);
    setVideoUrl(url);
  }, []);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, []);

  const persistVideoForSession = useCallback(async (id: string, source: Blob | File) => {
    const blob = source instanceof File ? source : source;
    await saveSessionVideoBlob(id, blob);
    updateSession(id, { hasLocalVideo: true });
  }, [updateSession]);

  const resolveVideoUrl = useCallback(async (id: string, fallback?: string | null) => {
    const fromIdb = await createSessionVideoObjectUrl(id);
    if (fromIdb) {
      blobUrlsRef.current.push(fromIdb);
      return fromIdb;
    }
    if (fallback && !isEphemeralBlobUrl(fallback)) return fallback;
    if (fallback && isEphemeralBlobUrl(fallback)) return fallback;
    return null;
  }, []);

  const [inputMode, setInputMode] = useState<InputMode>("live");
  const [sessionType, setSessionType] = useState(ACTIVITY_TYPES[0]);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[3]);
  const [plannedDuration, setPlannedDuration] = useState(DURATIONS[1]);
  const [childCount, setChildCount] = useState(12);
  const [observations, setObservations] = useState("");
  const [captureMode, setCaptureMode] = useState<"video" | "audio">("video");
  const [syllabus, setSyllabus] = useState<SyllabusCategory>("language");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [processing, setProcessing] = useState<SessionProcessingState | null>(null);
  const [extracted, setExtracted] = useState<SessionExtractedAnalysis | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadVerification, setUploadVerification] = useState<SessionVerification | null>(null);
  const [gpsCapturing, setGpsCapturing] = useState(false);

  const finalizeAnalysisSave = useCallback((id: string, analysis: SessionExtractedAnalysis, options?: { notifySupervisor?: boolean }) => {
    const savedAt = new Date().toISOString();
    const sess = sessions.find((s) => s.id === id);
    const meta = sess?.metadata;
    const alreadySaved = !!sess?.analysisSaved;
    const nextExtracted = {
      ...analysis,
      savedAt,
      transcriptSavedAt: savedAt,
      verificationSavedAt: savedAt,
      verificationTimeline: meta
        ? buildVerificationTimeline(meta, true)
        : analysis.verificationTimeline,
    };
    updateSession(id, {
      extractedAnalysis: nextExtracted,
      analysisSaved: true,
    });
    setExtracted(nextExtracted);
    setSaved(true);
    flowDispatch("AI_ANALYSIS_COMPLETED", { sessionId: id });
    if (!alreadySaved && (options?.notifySupervisor ?? true)) {
      addNotification({
        userId: "S-204",
        role: "supervisor",
        channel: "in_app",
        title: "Verified classroom session ready",
        body: `${user?.name} — ${analysis.activityType} · location verified · ${analysis.childrenDetected} children`,
        actionUrl: `/supervisor/session-analysis/${id}`,
      });
      toast.success("AI analysis completed and submitted automatically");
    }
  }, [sessions, updateSession, flowDispatch, addNotification, user?.name]);

  useEffect(() => {
    const centerId = user?.centerId ?? "AWC-TPT-01";
    const centerName = user?.centerName;
    const applyGps = (raw: { lat: number; lng: number }) => {
      const snapped = resolveSessionGps(centerId, centerName, raw, {
        forceDemo: USE_DEMO_CLASSROOM_ANALYSIS,
      });
      setGps({ lat: snapped.lat, lng: snapped.lng });
    };
    navigator.geolocation?.getCurrentPosition(
      (p) => applyGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => applyGps({ lat: 13.6288, lng: 79.4192 })
    );
  }, [user?.centerId, user?.centerName]);

  useEffect(() => {
    const openId = (location.state as { openSessionId?: string } | null)?.openSessionId;
    if (!openId) return;
    const s = sessions.find((x) => x.id === openId);
    if (s?.extractedAnalysis) {
      (async () => {
        const norm = normalizeSessionVerification(s.metadata, { saved: !!s.analysisSaved });
        const nextExtracted = {
          ...s.extractedAnalysis!,
          sessionVerification: norm.sessionVerification,
          authenticityChecks: norm.authenticityChecks,
          verificationTimeline: norm.verificationTimeline,
        };
        setSessionId(s.id);
        setExtracted(nextExtracted);
        setGps(norm.metadata.gps ?? null);
        setUploadVerification(norm.sessionVerification);
        updateSession(s.id, { metadata: norm.metadata, extractedAnalysis: nextExtracted });
        setVideoUrl(await resolveVideoUrl(s.id, s.videoBlobUrl));
        setPhase("analysis");
        setSaved(!!s.analysisSaved);
      })();
    }
  }, [location.state, sessions, resolveVideoUrl]);

  const buildMeta = (coords?: { lat: number; lng: number }): SessionMetadata => {
    const raw = coords ?? gps ?? { lat: 13.6288, lng: 79.4192 };
    const resolved = resolveSessionGps(user!.centerId!, user!.centerName, raw, {
      forceDemo: USE_DEMO_CLASSROOM_ANALYSIS,
    });
    return {
    workerId: user!.id,
    workerName: user!.name,
    centerId: user!.centerId!,
    centerName: user!.centerName ?? "",
    timestamp: new Date().toISOString(),
    sessionType,
    gps: { lat: resolved.lat, lng: resolved.lng },
    ageGroup,
    plannedDuration,
    childCount,
    workerObservations: observations || undefined,
    syllabusCategory: syllabus,
  };
  };

  const captureGpsForVerification = useCallback(async (): Promise<{ lat: number; lng: number }> => {
    const centerId = user?.centerId ?? "AWC-TPT-01";
    const centerName = user?.centerName;

    if (USE_DEMO_CLASSROOM_ANALYSIS) {
      return resolveSessionGps(centerId, centerName, gps, { forceDemo: true });
    }

    return new Promise((resolveCoords) => {
      if (!navigator.geolocation) {
        resolveCoords(resolveSessionGps(centerId, centerName, gps));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolveCoords(
            resolveSessionGps(centerId, centerName, {
              lat: p.coords.latitude,
              lng: p.coords.longitude,
            })
          ),
        () => resolveCoords(resolveSessionGps(centerId, centerName, gps)),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }, [gps, user?.centerId, user?.centerName]);

  const verifyUploadLocation = async (coords: { lat: number; lng: number }) => {
    setGps(coords);
    const meta = buildMeta(coords);
    const { sessionVerification: verification } = normalizeSessionVerification(meta);
    setUploadVerification(verification);
    if (verification.matchStatus === "verified") {
      toast.success("GPS coordinates verified — location matched to Anganwadi center");
    } else if (verification.matchStatus === "near") {
      toast.info(`GPS captured — ${verification.distance}m from center (near)`);
    } else {
      toast.warning("GPS captured — location review may be required");
    }
    return { meta, verification };
  };

  const runPipeline = useCallback(
    async (id: string, sess: import("@/types/session").SessionRecording, url: string | undefined, durationSec: number) => {
      setPhase("processing");
      setProcessing(null);
      flowDispatch("SESSION_UPLOADED", { sessionId: id });
      try {
        const { session: analyzed, extracted: ext, processing: proc } = await runClassroomExtractionPipeline({
          session: sess,
          videoUrl: url,
          durationSeconds: durationSec,
          allSessions: [...sessions, sess],
          onProgress: (st) => setProcessing({ ...st }),
        });

        const sessionForUpload: import("@/types/session").SessionRecording = {
          ...analyzed,
          extractedAnalysis: ext,
          hasLocalVideo: sess.hasLocalVideo ?? true,
        };
        const finalized = await processSessionUpload(id, url, analyzed.scorecard, sessionForUpload);
        const finalSession = finalized ?? sessionForUpload;
        const norm = normalizeSessionVerification(finalSession.metadata);
        const normExtracted = {
          ...ext,
          sessionVerification: norm.sessionVerification,
          authenticityChecks: norm.authenticityChecks,
          verificationTimeline: norm.verificationTimeline,
        };
        updateSession(id, {
          ...finalSession,
          metadata: norm.metadata,
          extractedAnalysis: normExtracted,
          videoBlobUrl: url,
          hasLocalVideo: true,
          status: "completed",
          analysisSaved: true,
        });
        finalizeAnalysisSave(id, normExtracted, { notifySupervisor: true });
        setProcessing(proc);
        setUploadVerification(norm.sessionVerification);
        let playbackUrl = url ?? null;
        if (!playbackUrl && uploadFileRef.current) {
          playbackUrl = createVideoObjectUrlFromBlob(uploadFileRef.current);
        }
        if (!playbackUrl) {
          playbackUrl = await createSessionVideoObjectUrl(id);
        }
        if (playbackUrl) {
          blobUrlsRef.current.push(playbackUrl);
          setVideoUrl(playbackUrl);
        }
        setPhase("analysis");
        toast.success("Classroom observation extracted and submitted");
      } catch (err) {
        console.error("Session extraction pipeline failed", err);
        updateSession(id, { status: "failed" });
        setPhase("setup");
        setProcessing(null);
        toast.error("Analysis failed — please upload the video again");
      }
    },
    [sessions, processSessionUpload, updateSession, flowDispatch]
  );

  useEffect(() => {
    (async () => {
      const mine = sessions.filter((s) => s.metadata.workerId === user?.id);
      const proc = mine.find((s) => s.status === "uploading" || s.status === "processing");
      if (!proc) return;
      const restored = await restoreProcessing(proc.id);
      if (restored?.completed && restored.extracted) {
        const norm = normalizeSessionVerification(proc.metadata);
        const normExtracted = {
          ...restored.extracted,
          sessionVerification: norm.sessionVerification,
          authenticityChecks: norm.authenticityChecks,
          verificationTimeline: norm.verificationTimeline,
        };
        setSessionId(proc.id);
        setExtracted(normExtracted);
        setUploadVerification(norm.sessionVerification);
        setVideoUrl(await resolveVideoUrl(proc.id));
        setPhase("analysis");
        setProcessing(restored);
        updateSession(proc.id, {
          status: "completed",
          metadata: norm.metadata,
          extractedAnalysis: normExtracted,
          scorecard: proc.scorecard,
          analysisSaved: true,
        });
        finalizeAnalysisSave(proc.id, normExtracted, { notifySupervisor: false });
        return;
      }
      if (restored && !restored.completed && !resumeAttemptedRef.current.has(proc.id)) {
        resumeAttemptedRef.current.add(proc.id);
        setSessionId(proc.id);
        setProcessing(restored);
        const url = await resolveVideoUrl(proc.id, restored.videoBlobUrl ?? proc.videoBlobUrl);
        if (url) setVideoUrl(url);
        setPhase("processing");
        const dur = restored.extracted?.durationSeconds ?? 171;
        try {
          await runPipeline(proc.id, proc, url ?? undefined, dur);
        } catch {
          toast.error("Could not finish analysis — tap Cancel and upload again");
        }
      }
    })();
  }, [sessions, user?.id, resolveVideoUrl, runPipeline, updateSession]);

  const startRecording = async () => {
    if (!user?.centerId || !canStartSession) {
      toast.error(sessionBlockReason ?? "Check in before recording");
      navigate("/worker/attendance");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: captureMode === "video", audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      setPaused(false);
      setPhase("record");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const id = `SES-${Date.now()}`;
      setSessionId(id);
      dispatch("SESSION_STARTED", { sessionId: id });
      addSession({
        id,
        metadata: buildMeta(),
        status: "recording",
        uploadProgress: 0,
        synced: false,
        createdAt: new Date().toISOString(),
      });
      toast.success("Recording started");
    } catch {
      toast.error("Camera/mic permission required");
    }
  };

  const stopRecording = useCallback(async () => {
    const rec = mediaRecorderRef.current;
    if (!rec || !sessionId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    rec.stop();
    rec.stream.getTracks().forEach((t) => t.stop());
    await new Promise<void>((res) => { rec.onstop = () => res(); });
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    trackBlobUrl(url);
    setPhase("processing");
    setGpsCapturing(true);
    setProcessing(initProcessingState(sessionId, url));
    const coords = await captureGpsForVerification();
    setGpsCapturing(false);
    const { meta } = await verifyUploadLocation(coords);
    await persistVideoForSession(sessionId, blob);
    const sess = sessions.find((s) => s.id === sessionId) ?? {
      id: sessionId,
      metadata: meta,
      status: "uploading" as const,
      uploadProgress: 0,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    updateSession(sessionId, { status: "uploading", videoBlobUrl: url, metadata: meta });
    await runPipeline(sessionId, sess, url, Math.max(elapsed, 90));
  }, [sessionId, elapsed, sessions, runPipeline, updateSession, dispatch, captureGpsForVerification]);

  const handleFileUpload = async (file: File) => {
    if (!user?.centerId || !canStartSession) {
      toast.error(sessionBlockReason ?? "Check in first");
      return;
    }
    uploadFileRef.current = file;
    const url = URL.createObjectURL(file);
    trackBlobUrl(url);
    const id = `SES-${Date.now()}`;
    setSessionId(id);
    setPhase("processing");
    setGpsCapturing(true);
    setUploadVerification(null);
    setProcessing(initProcessingState(id, url));
    const coords = await captureGpsForVerification();
    setGpsCapturing(false);
    const { meta } = await verifyUploadLocation(coords);
    const sess = {
      id,
      metadata: meta,
      status: "uploading" as const,
      uploadProgress: 0,
      synced: false,
      createdAt: new Date().toISOString(),
      videoBlobUrl: url,
    };
    addSession(sess);
    await persistVideoForSession(id, file);
    dispatch("SESSION_STARTED", { sessionId: id });
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = async () => {
      const dur = Math.max(60, Math.floor(video.duration) || 171);
      const withVideo = { ...sess, hasLocalVideo: true };
      await runPipeline(id, withVideo, url, dur);
    };
    video.onerror = async () => {
      toast.error("Could not read video — try another file");
      setPhase("setup");
    };
    video.src = url;
  };

  const cancelStuckProcessing = async () => {
    if (sessionId) {
      resumeAttemptedRef.current.delete(sessionId);
      await clearSessionProcessing(sessionId);
      updateSession(sessionId, { status: "failed", videoBlobUrl: undefined });
    }
    resetWorkspace();
    toast.info("Upload cancelled — select a video to try again");
  };

  const refreshGpsVerification = useCallback(() => {
    if (!sessionId || !extracted) return;
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess) return;

    const applyRefresh = (deviceGps: { lat: number; lng: number }) => {
      const norm = normalizeSessionVerification(
        { ...sess.metadata, gps: deviceGps, timestamp: new Date().toISOString() },
        { saved: !!sess.analysisSaved }
      );
      setGps(norm.metadata.gps ?? null);
      setUploadVerification(norm.sessionVerification);
      const nextExtracted = {
        ...extracted,
        sessionVerification: norm.sessionVerification,
        authenticityChecks: norm.authenticityChecks,
        verificationTimeline: norm.verificationTimeline,
      };
      setExtracted(nextExtracted);
      updateSession(sessionId, { metadata: norm.metadata, extractedAnalysis: nextExtracted });
      toast.success("GPS refreshed — location verified at Anganwadi center");
    };

    if (USE_DEMO_CLASSROOM_ANALYSIS) {
      applyRefresh(sess.metadata.gps ?? gps ?? { lat: 13.6288, lng: 79.4192 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => applyRefresh({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Could not refresh GPS")
    );
  }, [sessionId, extracted, sessions, updateSession, gps]);

  const saveAnalysis = (options?: { transcriptOnly?: boolean }) => {
    if (!sessionId || !extracted) return;
    const savedAt = new Date().toISOString();
    const sess = sessions.find((s) => s.id === sessionId);
    const meta = sess?.metadata;
    const nextExtracted = {
      ...extracted,
      savedAt,
      transcriptSavedAt: savedAt,
      verificationSavedAt: savedAt,
      verificationTimeline: meta
        ? buildVerificationTimeline(meta, true)
        : extracted.verificationTimeline,
    };
    updateSession(sessionId, {
      extractedAnalysis: nextExtracted,
      analysisSaved: true,
    });
    setExtracted(nextExtracted);
    setSaved(true);
    flowDispatch("AI_ANALYSIS_COMPLETED", { sessionId });
    addNotification({
      userId: "S-204",
      role: "supervisor",
      channel: "in_app",
      title: options?.transcriptOnly ? "Verified classroom transcript ready" : "Verified classroom session ready",
      body: options?.transcriptOnly
        ? `${user?.name} — GPS-verified storytelling · Telugu & English transcript · ${sessionId}`
        : `${user?.name} — ${extracted.activityType} · location verified · ${extracted.childrenDetected} children`,
      actionUrl: `/supervisor/session-analysis/${sessionId}`,
    });
    toast.success(
      options?.transcriptOnly
        ? "Transcript refreshed and saved"
        : "Verified session saved — transcript, history, supervisor intelligence, and offline copy updated"
    );
  };

  const resetWorkspace = () => {
    setPhase("setup");
    setSessionId(null);
    setVideoUrl(null);
    setExtracted(null);
    setProcessing(null);
    setSaved(false);
    setElapsed(0);
    uploadFileRef.current = null;
    setUploadVerification(null);
    setGpsCapturing(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const currentSession = sessionId ? sessions.find((s) => s.id === sessionId) : null;

  return (
    <div className="space-y-6 pb-32 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Preschool Session Recording</h1>
        <p className="text-sm text-slate-600">Classroom Intelligence Workspace — record or upload storytelling video · analysis on this screen</p>
      </div>

      {!canStartSession && phase === "setup" && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900">
          {sessionBlockReason}{" "}
          <button type="button" className="font-bold underline" onClick={() => navigate("/worker/attendance")}>Go to attendance</button>
        </div>
      )}
      {!online && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-800">
          <WifiOff className="h-4 w-4" /> Offline — pipeline runs on device; sync when network returns
        </div>
      )}

      {phase === "setup" && (
        <>
          <div className="flex gap-2 border-b border-slate-200">
            <button type="button" onClick={() => setInputMode("live")} className={cn("px-4 py-2 text-sm font-semibold border-b-2 -mb-px", inputMode === "live" ? "border-[#1e3a5f] text-[#1e3a5f]" : "border-transparent text-slate-500")}>
              Live recording
            </button>
            <button type="button" onClick={() => setInputMode("upload")} className={cn("px-4 py-2 text-sm font-semibold border-b-2 -mb-px", inputMode === "upload" ? "border-[#1e3a5f] text-[#1e3a5f]" : "border-transparent text-slate-500")}>
              Upload existing classroom video
            </button>
          </div>
          <SetupForm
            sessionType={sessionType} setSessionType={setSessionType}
            ageGroup={ageGroup} setAgeGroup={setAgeGroup}
            plannedDuration={plannedDuration} setPlannedDuration={setPlannedDuration}
            syllabus={syllabus} setSyllabus={setSyllabus}
            childCount={childCount} setChildCount={setChildCount}
            captureMode={captureMode} setCaptureMode={setCaptureMode}
            observations={observations} setObservations={setObservations}
            gps={gps}
            inputMode={inputMode}
            onStartRecord={startRecording}
            onPickFile={() => fileInputRef.current?.click()}
          />
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }} />
        </>
      )}

      {phase === "record" && (
        <>
          <div className="rounded-2xl border bg-black overflow-hidden relative aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", recording && !paused ? "bg-red-500 animate-pulse" : "bg-slate-400")} />
              <span className="text-white text-xs font-bold">{fmt(elapsed)}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button type="button" onClick={() => { const r = mediaRecorderRef.current; if (!r) return; if (paused) { r.resume(); setPaused(false); } else { r.pause(); setPaused(true); } }} className="h-14 w-14 rounded-full bg-amber-500 text-white flex items-center justify-center">
              {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </button>
            <button type="button" onClick={stopRecording} disabled={elapsed < 30} className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-40">
              <Square className="h-6 w-6" />
            </button>
          </div>
        </>
      )}

      {phase === "processing" && (
        <div className="space-y-4">
          <UploadGpsVerificationCard verification={uploadVerification} verifying={gpsCapturing} />
          {processing && (
          <>
          <div className="flex items-center gap-3 p-4 worker-card border bg-blue-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e40af]" />
            <div className="flex-1">
              <p className="font-semibold text-[#0F172A]">Extracting classroom observations from video…</p>
              <p className="text-xs text-slate-600">Progress saved locally — analysis completes on this screen</p>
            </div>
            <button type="button" onClick={cancelStuckProcessing} className="text-xs font-bold text-rose-700 underline shrink-0">
              Cancel
            </button>
          </div>
          <ExtractionPipelineBar state={processing} />
          {sessionId && (
            <SessionClassroomVideo
              sessionId={sessionId}
              src={videoUrl}
              file={uploadFileRef.current}
              compact
              className="w-full h-full object-contain bg-black"
            />
          )}
          </>
          )}
        </div>
      )}

      {phase === "analysis" && extracted && currentSession && (
        <>
          <ClassroomExtractedReport
            extracted={extracted}
            metadata={currentSession.metadata}
            videoUrl={videoUrl ?? undefined}
            videoFile={uploadFileRef.current}
            uploadedAt={currentSession.processedAt ?? currentSession.createdAt}
            transcriptSaved={saved || !!extracted.transcriptSavedAt}
            onSaveTranscript={() => saveAnalysis({ transcriptOnly: true })}
            onRefreshGps={refreshGpsVerification}
            saved={saved}
            transcriptAnchorRef={transcriptRef}
          />
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
              Verified session auto-submitted
            </div>
            <button
              type="button"
              onClick={() => transcriptRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="gov-btn-outline text-xs flex items-center gap-1 px-3 py-2"
            >
              <FileText className="h-4 w-4" /> View transcript
            </button>
            <button
              type="button"
              onClick={() => {
                const v = extracted.sessionVerification;
                const q = v?.capturedLatitude != null ? `${v.capturedLatitude},${v.capturedLongitude}` : `${v?.centerLatitude},${v?.centerLongitude}`;
                window.open(`https://www.google.com/maps?q=${q}`, "_blank");
              }}
              className="gov-btn-outline text-xs flex items-center gap-1 px-3 py-2"
            >
              <Map className="h-4 w-4" /> Open map
            </button>
            <Link to="/worker/training" className="gov-btn-outline text-xs flex items-center gap-1 px-3 py-2">
              <GraduationCap className="h-4 w-4" /> Assign training
            </Link>
            <Link to="/worker/growth" className="gov-btn-outline text-xs px-3 py-2">View growth journey</Link>
            <button type="button" onClick={resetWorkspace} className="gov-btn-outline text-xs flex items-center gap-1 px-3 py-2">
              <RotateCcw className="h-4 w-4" /> Record another session
            </button>
          </div>
        </>
      )}

      <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
        <Mic className="h-3 w-3" /> Video intelligence for coaching — extracted observations, not penalty scores
      </p>
    </div>
  );
}

function SetupForm(props: {
  sessionType: string;
  setSessionType: (v: string) => void;
  ageGroup: string;
  setAgeGroup: (v: string) => void;
  plannedDuration: string;
  setPlannedDuration: (v: string) => void;
  syllabus: SyllabusCategory;
  setSyllabus: (v: SyllabusCategory) => void;
  childCount: number;
  setChildCount: (v: number) => void;
  captureMode: "video" | "audio";
  setCaptureMode: (v: "video" | "audio") => void;
  observations: string;
  setObservations: (v: string) => void;
  gps: { lat: number; lng: number } | null;
  inputMode: InputMode;
  onStartRecord: () => void;
  onPickFile: () => void;
}) {
  const { sessionType, setSessionType, ageGroup, setAgeGroup, plannedDuration, setPlannedDuration, syllabus, setSyllabus, childCount, setChildCount, captureMode, setCaptureMode, observations, setObservations, gps, inputMode, onStartRecord, onPickFile } = props;
  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4 shadow-sm">
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-500">Activity type</label>
        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full mt-1 rounded-xl border p-2 text-sm">
          {ACTIVITY_TYPES.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500">Age group</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full mt-1 rounded-xl border p-2 text-sm">
            {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500">Planned duration</label>
          <select value={plannedDuration} onChange={(e) => setPlannedDuration(e.target.value)} className="w-full mt-1 rounded-xl border p-2 text-sm">
            {DURATIONS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-500">Syllabus category</label>
        <select value={syllabus} onChange={(e) => setSyllabus(e.target.value as SyllabusCategory)} className="w-full mt-1 rounded-xl border p-2 text-sm">
          {SYLLABUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-500">Children present (reference)</label>
        <input type="number" min={1} max={40} value={childCount} onChange={(e) => setChildCount(Number(e.target.value))} className="w-full mt-1 rounded-xl border p-2 text-sm" />
      </div>
      {inputMode === "live" && (
        <>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">Capture mode</label>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => setCaptureMode("video")} className={cn("flex-1 py-2 rounded-lg text-xs font-semibold border", captureMode === "video" ? "bg-[#1e3a5f] text-white" : "bg-white")}>Video</button>
              <button type="button" onClick={() => setCaptureMode("audio")} className={cn("flex-1 py-2 rounded-lg text-xs font-semibold border", captureMode === "audio" ? "bg-[#1e3a5f] text-white" : "bg-white")}>Audio only</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">Notes before recording</label>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full mt-1 rounded-xl border p-2 text-sm" />
          </div>
        </>
      )}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <MapPin className="h-4 w-4" />
        GPS: {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Capturing…"}
      </div>
      {inputMode === "live" ? (
        <button type="button" onClick={onStartRecord} className="w-full h-12 rounded-xl bg-[#0F172A] text-white font-bold text-sm flex items-center justify-center gap-2">
          <Video className="h-5 w-5" /> Start session recording
        </button>
      ) : (
        <button type="button" onClick={onPickFile} className="w-full h-12 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm flex items-center justify-center gap-2">
          <FileVideo className="h-5 w-5" /> Upload storytelling video
        </button>
      )}
    </div>
  );
}
