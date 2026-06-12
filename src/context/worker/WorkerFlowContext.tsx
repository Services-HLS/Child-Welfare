import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  WorkerDayBundle,
  WorkerDayProgress,
  WorkerFlowEvent,
  WorkerFlowValidation,
  UnifiedUploadItem,
  WorkerAttendanceRecord,
} from "@/types/worker-flow";
import { loadWorkerDayBundle, saveWorkerDayBundle, appendAttendanceHistory } from "@/lib/storage/workerFlow";
import {
  emptyBundle,
  computeFlowState,
  computeDayMetrics,
  buildDayProgress,
  validateWorkerFlow,
} from "@/services/worker/WorkerFlowService";
import {
  createCheckIn,
  applyCheckOut,
  loadLegacyAttendance,
  saveLegacyAttendance,
  legacyToWorkerRecord,
} from "@/services/worker/AttendanceService";
import {
  deriveUploadsFromAppData,
  enqueueUpload,
  mergeUploadQueues,
  updateUploadStatus,
} from "@/services/worker/UploadQueueService";
import {
  buildActivityLog,
  isDuplicateActivity,
  activityRequiresEvidence,
} from "@/services/worker/ActivityService";
import { findTodaySession, findRecoverableSession } from "@/services/worker/SessionService";
import { openWorkerIssues, canResolveComplaint } from "@/services/worker/ComplaintAssignmentService";
import { growthFromLiveData } from "@/services/worker/GrowthService";
import { batchSyncUploads, countPendingSync } from "@/services/worker/OfflineSyncService";
import { touchAudit } from "@/services/worker/audit";
import { SessionMetadata } from "@/types/session";
import { toast } from "sonner";

interface WorkerFlowCtx {
  bundle: WorkerDayBundle | null;
  progress: WorkerDayProgress;
  validation: WorkerFlowValidation;
  uploadQueue: UnifiedUploadItem[];
  loading: boolean;
  dispatch: (event: WorkerFlowEvent, payload?: Record<string, unknown>) => void;
  checkIn: (lat: number, lng: number) => Promise<void>;
  checkOut: (lat: number, lng: number) => Promise<void>;
  submitActivity: (input: {
    type: string;
    description: string;
    childrenPresent: number;
    lat: number;
    lng: number;
    imageUrl?: string;
  }) => Promise<string | null>;
  completeTraining: (recId: string) => void;
  completeTrainingCourse: (recId: string, moduleId: string, progress: import("@/types/training-course").TrainingCourseProgress) => void;
  resolveIssue: (complaintId: string, evidenceUrl?: string) => void;
  retryUpload: (uploadId: string) => Promise<void>;
  batchSync: () => Promise<void>;
  recoverableSessionId: string | null;
  growth: ReturnType<typeof growthFromLiveData>;
  unreadAlerts: number;
}

const FlowCtx = createContext<WorkerFlowCtx | null>(null);

export function WorkerFlowProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const navigate = useNavigate();
  const {
    user,
    online,
    activities,
    sessions,
    complaints,
    trainingRecommendations,
    coachingAssignments,
    addActivity,
    updateActivity,
    addSession,
    updateSession,
    processSessionUpload,
    advanceComplaint,
    addNotification,
    setLastSync,
    updateTrainingRecommendation,
    applyServiceImprovement,
  } = app;

  const workerId = user?.workerId ?? user?.id ?? "W-1042";
  const centerId = user?.centerId ?? "AWC-TPT-01";
  const workerName = user?.name ?? "Worker";
  const today = format(new Date(), "yyyy-MM-dd");

  const [bundle, setBundle] = useState<WorkerDayBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (b: WorkerDayBundle) => {
    setBundle(b);
    await saveWorkerDayBundle(b);
  }, []);

  const logEvent = useCallback(
    (b: WorkerDayBundle, event: WorkerFlowEvent): WorkerDayBundle => ({
      ...b,
      events: [...b.events, { event, at: new Date().toISOString() }],
      audit: touchAudit(b.audit, { updatedAt: new Date().toISOString() }),
    }),
    []
  );

  useEffect(() => {
    if (!user || user.role !== "worker") {
      setLoading(false);
      return;
    }
    (async () => {
      let b = await loadWorkerDayBundle(workerId, today);
      if (!b) {
        const legacy = loadLegacyAttendance().find((r) => r.date === today);
        b = emptyBundle(workerId, centerId, today);
        if (legacy) {
          b.attendance = legacyToWorkerRecord(legacy, workerId, centerId);
          b.flowState = legacy.checkIn ? (legacy.checkOut ? "DAY_COMPLETED" : "CHECKED_IN") : "NOT_STARTED";
        }
      }
      setBundle(b);
      setLoading(false);
    })();
  }, [user, workerId, centerId, today]);

  const myActivities = useMemo(
    () => activities.filter((a) => a.centerId === centerId),
    [activities, centerId]
  );
  const mySessions = useMemo(
    () => sessions.filter((s) => s.metadata.workerId === workerId),
    [sessions, workerId]
  );
  const myIssues = useMemo(() => openWorkerIssues(complaints, workerId), [complaints, workerId]);
  const todaySession = useMemo(() => findTodaySession(mySessions, workerId), [mySessions, workerId]);
  const recoverableSessionId = useMemo(
    () => findRecoverableSession(mySessions, workerId)?.id ?? null,
    [mySessions, workerId]
  );

  const derivedUploads = useMemo(
    () =>
      deriveUploadsFromAppData({
        sessions: mySessions,
        activities: myActivities,
        offline: !online,
      }),
    [mySessions, myActivities, online]
  );

  const uploadQueue = useMemo(
    () => mergeUploadQueues(bundle?.uploadQueue ?? [], derivedUploads),
    [bundle?.uploadQueue, derivedUploads]
  );

  const metrics = useMemo(
    () =>
      computeDayMetrics({
        attendance: bundle?.attendance,
        sessions: mySessions,
        activities: myActivities,
        complaints,
        training: trainingRecommendations,
        uploadQueue,
        workerId,
      }),
    [bundle?.attendance, mySessions, myActivities, complaints, trainingRecommendations, uploadQueue, workerId]
  );

  const flowState = useMemo(() => {
    if (!bundle) return "NOT_STARTED" as const;
    return computeFlowState({
      attendance: bundle.attendance,
      sessions: mySessions,
      activities: myActivities,
      openIssues: myIssues.length,
      uploadPending: countPendingSync(uploadQueue),
      todaySessionDone: !!todaySession?.scorecard,
      sessionActive: todaySession?.status === "recording" || todaySession?.status === "paused",
    });
  }, [bundle, mySessions, myActivities, myIssues, uploadQueue, todaySession]);

  useEffect(() => {
    if (!bundle || bundle.flowState === flowState) return;
    persist({ ...bundle, flowState });
  }, [flowState, bundle, persist]);

  const progress = useMemo((): WorkerDayProgress => {
    const b = bundle ?? emptyBundle(workerId, centerId, today);
    return buildDayProgress({ ...b, flowState }, metrics);
  }, [bundle, workerId, centerId, today, metrics, flowState]);

  const validation = useMemo(
    () =>
      validateWorkerFlow({
        bundle: bundle ?? emptyBundle(workerId, centerId, today),
        uploadQueue,
        todaySessionDone: !!todaySession?.scorecard,
        issueHasEvidence: true,
      }),
    [bundle, workerId, centerId, today, uploadQueue, todaySession]
  );

  const growth = useMemo(
    () =>
      growthFromLiveData(workerId, workerName, centerId, {
        sessions: mySessions,
        coaching: coachingAssignments,
        interventions: app.interventions,
        attendance: bundle?.attendance,
        activities: myActivities,
        complaints,
        training: trainingRecommendations,
        bundleCompletedTraining: bundle?.completedTrainingIds ?? [],
        serviceCompletionPercent: metrics.serviceCompletionPercent,
      }),
    [
      workerId,
      workerName,
      centerId,
      mySessions,
      coachingAssignments,
      app.interventions,
      bundle,
      myActivities,
      complaints,
      trainingRecommendations,
      metrics.serviceCompletionPercent,
    ]
  );

  const unreadAlerts = useMemo(
    () => app.notifications.filter((n) => (n.role === "worker" || n.userId === workerId) && !n.read).length,
    [app.notifications, workerId]
  );

  const checkIn = useCallback(
    async (lat: number, lng: number) => {
      if (!user) return;
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      if (b.attendance?.checkIn) {
        toast.info("Already checked in today");
        return;
      }
      const att = createCheckIn(workerId, centerId, lat, lng, !online);
      b = logEvent({ ...b, attendance: att, flowState: "CHECKED_IN" }, "ATTENDANCE_COMPLETED");
      b.uploadQueue = enqueueUpload(b.uploadQueue, {
        id: `upload-att-${att.id}`,
        sourceType: "attendance",
        sourceId: att.id,
        label: "Attendance check-in",
        status: online ? "verified" : "pending",
        progress: 100,
        evidenceCount: 1,
      }, !online);
      await persist(b);
      const legacy = loadLegacyAttendance().filter((r) => r.date !== today);
      saveLegacyAttendance([
        { date: today, checkIn: att.checkIn, lat, lng, synced: online },
        ...legacy,
      ]);
      await appendAttendanceHistory(workerId, att);
      addNotification({
        userId: workerId,
        role: "worker",
        channel: "in_app",
        title: "Checked in",
        body: `On duty at ${user.centerName}`,
        actionUrl: "/worker/dashboard",
      });
      toast.success("Checked in — session recording unlocked");
    },
    [user, bundle, workerId, centerId, today, online, persist, logEvent, addNotification]
  );

  const checkOut = useCallback(
    async (lat: number, lng: number) => {
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      if (!b.attendance?.checkIn) {
        toast.error("Check in first");
        return;
      }
      const v = validateWorkerFlow({
        bundle: b,
        uploadQueue,
        todaySessionDone: !!todaySession?.scorecard,
        issueHasEvidence: true,
      });
      if (!v.canCheckOut) {
        toast.error(v.checkoutBlockReason ?? "Complete pending tasks first");
        return;
      }
      const att = applyCheckOut(b.attendance!, lat, lng, !online);
      b = logEvent({ ...b, attendance: att, flowState: "DAY_COMPLETED" }, "DAY_COMPLETED");
      await persist(b);
      const legacy = loadLegacyAttendance().map((r) =>
        r.date === today ? { ...r, checkOut: att.checkOut, lat, lng, synced: online } : r
      );
      saveLegacyAttendance(legacy);
      toast.success("Day completed — great work!");
    },
    [bundle, workerId, centerId, today, uploadQueue, todaySession, online, persist, logEvent]
  );

  const submitActivity = useCallback(
    async (input: {
      type: string;
      description: string;
      childrenPresent: number;
      lat: number;
      lng: number;
      imageUrl?: string;
    }) => {
      if (!user) return null;
      if (isDuplicateActivity(activities, centerId, input.type)) {
        toast.error("Duplicate activity — wait before logging the same service again");
        return null;
      }
      if (activityRequiresEvidence(input.type) && !input.imageUrl) {
        toast.error("Photo evidence required before completing this service");
        return null;
      }
      const act = buildActivityLog({
        centerId,
        centerName: user.centerName ?? "",
        worker: workerName,
        ...input,
        offline: !online,
      });
      addActivity(act);
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      b = logEvent(
        { ...b, completedActivityIds: [...new Set([...b.completedActivityIds, act.id])] },
        "ACTIVITY_COMPLETED"
      );
      b.uploadQueue = enqueueUpload(b.uploadQueue, {
        id: `upload-activity-${act.id}`,
        sourceType: "activity",
        sourceId: act.id,
        label: input.type,
        status: input.imageUrl ? (online ? "verified" : "pending") : "draft",
        progress: input.imageUrl ? 100 : 0,
        evidenceCount: input.imageUrl ? 1 : 0,
      }, !online);
      if (input.imageUrl && online) {
        b = logEvent(b, "UPLOAD_VERIFIED");
        updateActivity(act.id, { status: "submitted", synced: true });
      }
      await persist(b);
      toast.success("Service logged — added to submission queue");
      return act.id;
    },
    [user, activities, centerId, workerName, online, addActivity, bundle, workerId, today, logEvent, persist, updateActivity]
  );

  const completeTrainingCourse = useCallback(
    (recId: string, moduleId: string, progress: import("@/types/training-course").TrainingCourseProgress) => {
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      const improved =
        (progress.outcome?.improvementPercent ?? 0) >= 10 ||
        (progress.outcome?.engagementAfter ?? 0) > (progress.outcome?.engagementBefore ?? 0);
      updateTrainingRecommendation(recId, {
        status: improved ? "improved" : "completed",
        primaryModuleId: moduleId,
      });
      if (!b.completedTrainingIds.includes(recId)) {
        b = logEvent(
          { ...b, completedTrainingIds: [...b.completedTrainingIds, recId] },
          "TRAINING_COMPLETED"
        );
      }
      persist(b);
      addNotification({
        userId: workerId,
        role: "worker",
        channel: "in_app",
        title: improved ? "Training completed — improvement verified" : "Training completed",
        body: "Growth journey and dashboard updated with your coaching progress.",
        actionUrl: "/worker/growth",
      });
    },
    [bundle, workerId, centerId, today, logEvent, persist, addNotification, updateTrainingRecommendation]
  );

  const completeTraining = useCallback(
    (recId: string) => {
      toast.info("Open the learning module to complete training step by step");
    },
    []
  );

  const resolveIssue = useCallback(
    (complaintId: string, evidenceUrl = "/evidence.jpg") => {
      const c = complaints.find((x) => x.id === complaintId);
      if (!c || !canResolveComplaint(c, !!evidenceUrl)) {
        toast.error("Upload evidence before closing this issue");
        return;
      }
      advanceComplaint(complaintId, "worker_review", {
        resolutionNote: "Field response submitted with evidence.",
        resolutionEvidenceUrl: evidenceUrl,
      });
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      b = logEvent(
        {
          ...b,
          resolvedComplaintIds: [...b.resolvedComplaintIds, complaintId],
          uploadQueue: enqueueUpload(b.uploadQueue, {
            id: `upload-cmp-${complaintId}`,
            sourceType: "complaint",
            sourceId: complaintId,
            label: `Issue ${complaintId}`,
            status: online ? "verified" : "pending",
            progress: 100,
            evidenceCount: 1,
          }, !online),
        },
        "ISSUE_RESOLVED"
      );
      persist(b);
      applyServiceImprovement(centerId, "complaint_closed");
      toast.success("Issue response submitted — beneficiary will be notified");
    },
    [complaints, advanceComplaint, bundle, workerId, centerId, today, logEvent, persist, online, applyServiceImprovement]
  );

  const dispatch = useCallback(
    (event: WorkerFlowEvent, payload?: Record<string, unknown>) => {
      if (!bundle) return;
      let b = logEvent(bundle, event);
      if (event === "SESSION_STARTED" && payload?.sessionId) {
        b.activeSessionId = payload.sessionId as string;
        b.flowState = "SESSION_ACTIVE";
      }
      if (event === "AI_ANALYSIS_COMPLETED") {
        b.flowState = "SESSION_COMPLETED";
        b.activeSessionId = undefined;
      }
      persist(b);
    },
    [bundle, logEvent, persist]
  );

  const retryUpload = useCallback(
    async (uploadId: string) => {
      const item = uploadQueue.find((u) => u.id === uploadId);
      if (!item) return;
      let b = bundle ?? emptyBundle(workerId, centerId, today);
      b = {
        ...b,
        uploadQueue: updateUploadStatus(b.uploadQueue, uploadId, "syncing", { progress: 20 }),
      };
      await persist(b);
      if (item.sourceType === "session") {
        const s = sessions.find((x) => x.id === item.sourceId);
        if (s?.videoBlobUrl) {
          const result = await processSessionUpload(item.sourceId, s.videoBlobUrl);
          if (result?.scorecard) {
            dispatch("AI_ANALYSIS_COMPLETED", { sessionId: item.sourceId });
            navigate(`/worker/session-feedback/${item.sourceId}`);
          }
        }
      }
      if (item.sourceType === "activity") {
        updateActivity(item.sourceId, { synced: true, status: "submitted" });
        b = {
          ...b,
          uploadQueue: updateUploadStatus(b.uploadQueue, uploadId, "verified", { progress: 100 }),
        };
        await persist(b);
        dispatch("UPLOAD_VERIFIED");
      }
      setLastSync(new Date());
    },
    [uploadQueue, bundle, workerId, centerId, today, persist, sessions, processSessionUpload, navigate, updateActivity, setLastSync, dispatch]
  );

  const batchSync = useCallback(async () => {
    if (!online) {
      toast.info("Offline — items will sync when network returns");
      return;
    }
    let b = bundle ?? emptyBundle(workerId, centerId, today);
    const next = await batchSyncUploads(b.uploadQueue, online, {
      onSession: async (id) => {
        const s = sessions.find((x) => x.id === id);
        if (!s?.videoBlobUrl) return false;
        const r = await processSessionUpload(id, s.videoBlobUrl);
        return !!r?.scorecard;
      },
      onActivity: async (id) => {
        updateActivity(id, { synced: true, status: "submitted" });
        return true;
      },
    });
    b = { ...b, uploadQueue: next };
    await persist(b);
    setLastSync(new Date());
    toast.success("Sync batch complete");
  }, [online, bundle, workerId, centerId, today, persist, sessions, processSessionUpload, updateActivity, setLastSync]);

  const value: WorkerFlowCtx = {
    bundle,
    progress,
    validation,
    uploadQueue,
    loading,
    dispatch,
    checkIn,
    checkOut,
    submitActivity,
    completeTraining,
    completeTrainingCourse,
    resolveIssue,
    retryUpload,
    batchSync,
    recoverableSessionId,
    growth,
    unreadAlerts,
  };

  return <FlowCtx.Provider value={value}>{children}</FlowCtx.Provider>;
}

export function useWorkerFlow() {
  const ctx = useContext(FlowCtx);
  if (!ctx) throw new Error("useWorkerFlow must be used within WorkerFlowProvider");
  return ctx;
}

/** Safe hook when provider may be absent */
export function useWorkerFlowOptional() {
  return useContext(FlowCtx);
}
