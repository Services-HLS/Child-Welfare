import { useWorkerFlow } from "./WorkerFlowContext";
import { useApp } from "@/context/AppContext";
import { workerAssignedComplaints } from "@/services/worker/ComplaintAssignmentService";
import { findTodaySession } from "@/services/worker/SessionService";

export function useWorkerFlowState() {
  return useWorkerFlow();
}

export function useAttendance() {
  const { bundle, checkIn, checkOut, validation, progress, dispatch } = useWorkerFlow();
  const { online } = useApp();
  return {
    today: bundle?.attendance,
    checkIn,
    checkOut,
    canCheckOut: validation.canCheckOut,
    checkoutBlockReason: validation.checkoutBlockReason,
    attendanceLabel: progress.metrics.attendanceLabel,
    flowState: progress.flowState,
    dispatch,
    online,
  };
}

export function useSession() {
  const { validation, dispatch, recoverableSessionId, bundle } = useWorkerFlow();
  const { sessions, addSession, updateSession, processSessionUpload, user, online } = useApp();
  const workerId = user?.workerId ?? user?.id ?? "W-1042";
  const todaySession = findTodaySession(
    sessions.filter((s) => s.metadata.workerId === workerId),
    workerId
  );

  const finishUpload = async (sessionId: string, videoUrl: string) => {
    dispatch("SESSION_UPLOADED", { sessionId });
    updateSession(sessionId, { status: online ? "uploading" : "queued_offline", uploadProgress: 50 });
    if (!online) return null;
    const result = await processSessionUpload(sessionId, videoUrl);
    if (result?.scorecard) dispatch("AI_ANALYSIS_COMPLETED", { sessionId });
    return result;
  };

  return {
    canStartSession: validation.canStartSession,
    sessionBlockReason: validation.sessionBlockReason,
    todaySession,
    activeSessionId: bundle?.activeSessionId ?? recoverableSessionId,
    addSession,
    updateSession,
    finishUpload,
    dispatch,
    online,
  };
}

export function useActivities() {
  const { submitActivity, progress } = useWorkerFlow();
  const { activities, user } = useApp();
  const centerId = user?.centerId;
  const mine = activities.filter((a) => a.centerId === centerId);
  return {
    submitActivity,
    activities: mine,
    completionPercent: progress.metrics.activitiesPercent,
    done: progress.metrics.activitiesDone,
    target: progress.metrics.activitiesTarget,
  };
}

export function useUploads() {
  const { uploadQueue, retryUpload, batchSync } = useWorkerFlow();
  const { online } = useApp();
  return { uploadQueue, retryUpload, batchSync, online };
}

export function useGrowth() {
  const { growth, progress } = useWorkerFlow();
  return { growth, progressPercent: progress.progressPercent };
}

export function useTraining() {
  const { completeTraining, progress } = useWorkerFlow();
  const { trainingRecommendations, coachingAssignments, user, sessions, getClassroomAnalytics } = useApp();
  const workerId = user?.workerId ?? user?.id;
  const mine = trainingRecommendations.filter((t) => t.workerId === workerId);
  const coach = coachingAssignments.filter((c) => c.workerId === workerId);
  return {
    completeTraining,
    recommendations: mine,
    coaching: coach,
    pending: progress.metrics.trainingPending,
    sessions,
    getClassroomAnalytics,
  };
}

export function useComplaints() {
  const { resolveIssue, progress } = useWorkerFlow();
  const { complaints, user } = useApp();
  const workerId = user?.workerId ?? user?.id ?? "W-1042";
  const assigned = workerAssignedComplaints(complaints, workerId, user?.centerId);
  return {
    resolveIssue,
    assigned,
    openCount: progress.metrics.openIssues,
  };
}
