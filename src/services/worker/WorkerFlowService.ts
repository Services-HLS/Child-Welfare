import { format, isToday } from "date-fns";
import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord } from "@/types/platform";
import { SessionRecording, TrainingRecommendation } from "@/types/session";
import {
  WorkerDayBundle,
  WorkerDayMetrics,
  WorkerDayProgress,
  WorkerFlowState,
  WorkerFlowValidation,
  WorkerTimelineStep,
  WorkerAttendanceRecord,
  UnifiedUploadItem,
} from "@/types/worker-flow";

const ACTIVITY_TARGET = 3;

export function emptyBundle(workerId: string, centerId: string, date: string): WorkerDayBundle {
  const now = new Date().toISOString();
  return {
    date,
    workerId,
    centerId,
    flowState: "NOT_STARTED",
    completedTrainingIds: [],
    completedActivityIds: [],
    resolvedComplaintIds: [],
    events: [],
    uploadQueue: [],
    audit: { createdAt: now, updatedAt: now, offline: false, synced: true, verified: false },
  };
}

export function computeFlowState(input: {
  attendance?: WorkerAttendanceRecord;
  sessions: SessionRecording[];
  activities: ActivityLog[];
  openIssues: number;
  uploadPending: number;
  todaySessionDone: boolean;
  sessionActive: boolean;
}): WorkerFlowState {
  const { attendance, openIssues, uploadPending, todaySessionDone, sessionActive } = input;
  if (attendance?.checkOut) return "DAY_COMPLETED";
  if (!attendance?.checkIn) return "NOT_STARTED";
  if (sessionActive) return "SESSION_ACTIVE";
  if (!todaySessionDone) return "CHECKED_IN";
  const todayActs = input.activities.filter((a) => isToday(new Date(a.timestamp)));
  if (todayActs.length < ACTIVITY_TARGET) return "SERVICES_PENDING";
  if (uploadPending > 0) return "UPLOAD_PENDING";
  if (openIssues > 0) return "ISSUES_PENDING";
  return "SESSION_COMPLETED";
}

export function computeDayMetrics(input: {
  attendance?: WorkerAttendanceRecord;
  sessions: SessionRecording[];
  activities: ActivityLog[];
  complaints: ComplaintRecord[];
  training: TrainingRecommendation[];
  uploadQueue: UnifiedUploadItem[];
  workerId: string;
}): WorkerDayMetrics {
  const todayActs = input.activities.filter(
    (a) => isToday(new Date(a.timestamp)) && a.worker === input.workerId
  );
  const assigned = input.complaints.filter(
    (c) =>
      c.assignedWorkerId === input.workerId &&
      c.grievance?.ownerRole !== "supervisor" &&
      c.status !== "closed" &&
      c.status !== "beneficiary_confirmation"
  );
  const todaySession = input.sessions.find(
    (s) => s.metadata.workerId === input.workerId && isToday(new Date(s.createdAt))
  );
  const pendingTraining = input.training.filter(
    (t) => t.workerId === input.workerId && t.status !== "completed"
  );
  const uploadPending = input.uploadQueue.filter(
    (u) => u.status === "draft" || u.status === "pending" || u.status === "syncing" || u.status === "failed"
  ).length;

  let attLabel = "Not checked in";
  if (input.attendance?.checkOut) attLabel = "Day complete";
  else if (input.attendance?.checkIn) attLabel = "On duty";

  let sessionLabel = "Not recorded";
  if (todaySession?.scorecard) sessionLabel = "Completed";
  else if (todaySession?.status === "recording" || todaySession?.status === "paused") sessionLabel = "Recording";
  else if (todaySession?.status === "uploading" || todaySession?.status === "processing") sessionLabel = "Processing";
  else if (todaySession?.status === "queued_offline") sessionLabel = "Queued offline";

  const actPercent = Math.min(100, Math.round((todayActs.length / ACTIVITY_TARGET) * 100));
  const completion = Math.min(
    100,
    (input.attendance?.checkIn ? 20 : 0) +
      (todaySession?.scorecard ? 25 : 0) +
      actPercent * 0.25 +
      (uploadPending === 0 && todayActs.length >= 1 ? 15 : 0) +
      (assigned.length === 0 ? 15 : 5)
  );

  return {
    attendanceLabel: attLabel,
    sessionLabel,
    activitiesPercent: actPercent,
    activitiesDone: todayActs.length,
    activitiesTarget: ACTIVITY_TARGET,
    assignedIssues: input.complaints.filter(
      (c) => c.assignedWorkerId === input.workerId && c.grievance?.ownerRole !== "supervisor"
    ).length,
    openIssues: assigned.length,
    trainingPending: pendingTraining.length,
    uploadPending,
    serviceCompletionPercent: completion,
  };
}

export function buildTimeline(metrics: WorkerDayMetrics, attendance?: WorkerAttendanceRecord): WorkerTimelineStep[] {
  const sessionDone = metrics.sessionLabel === "Completed" || metrics.sessionLabel === "Processing";
  const actsDone = metrics.activitiesDone >= metrics.activitiesTarget;
  const uploadsDone = metrics.uploadPending === 0;
  const issuesDone = metrics.openIssues === 0;
  const dayDone = !!attendance?.checkOut;

  return [
    {
      id: "att",
      label: "Attendance",
      status: attendance?.checkIn ? "done" : "current",
      time: attendance?.checkIn ? format(new Date(attendance.checkIn), "h:mm a") : undefined,
    },
    {
      id: "pre",
      label: "Preschool session",
      status: sessionDone ? "done" : attendance?.checkIn ? "current" : "pending",
    },
    {
      id: "svc",
      label: "Service delivery",
      status: actsDone ? "done" : sessionDone ? "current" : "pending",
    },
    {
      id: "up",
      label: "Submission queue",
      status: uploadsDone && actsDone ? "done" : actsDone ? "current" : "pending",
    },
    {
      id: "iss",
      label: "Assigned issues",
      status: issuesDone ? "done" : uploadsDone ? "current" : "pending",
    },
    {
      id: "end",
      label: "End day",
      status: dayDone ? "done" : issuesDone && uploadsDone && sessionDone ? "current" : "pending",
    },
  ];
}

export function computeProgressPercent(metrics: WorkerDayMetrics, attendance?: WorkerAttendanceRecord): number {
  let p = 0;
  if (attendance?.checkIn) p += 15;
  if (metrics.sessionLabel === "Completed" || metrics.sessionLabel === "Processing") p += 25;
  p += Math.min(25, Math.round((metrics.activitiesDone / metrics.activitiesTarget) * 25));
  if (metrics.uploadPending === 0 && metrics.activitiesDone > 0) p += 15;
  if (metrics.openIssues === 0) p += 10;
  if (metrics.trainingPending === 0) p += 5;
  if (attendance?.checkOut) p += 5;
  return Math.min(100, p);
}

export function completionBadge(percent: number, flow: WorkerFlowState): WorkerDayProgress["completionBadge"] {
  if (flow === "DAY_COMPLETED" || percent >= 100) return "day_complete";
  if (percent >= 75) return "almost_done";
  if (percent > 0) return "in_progress";
  return "not_started";
}

export function buildDayProgress(
  bundle: WorkerDayBundle,
  metrics: WorkerDayMetrics
): WorkerDayProgress {
  const flowState = computeFlowState({
    attendance: bundle.attendance,
    sessions: [],
    activities: [],
    openIssues: metrics.openIssues,
    uploadPending: metrics.uploadPending,
    todaySessionDone: metrics.sessionLabel === "Completed",
    sessionActive: metrics.sessionLabel === "Recording",
  });
  const steps = buildTimeline(metrics, bundle.attendance);
  const progressPercent = computeProgressPercent(metrics, bundle.attendance);
  return {
    flowState: bundle.flowState || flowState,
    progressPercent,
    completionBadge: completionBadge(progressPercent, bundle.flowState),
    steps,
    metrics,
  };
}

export function validateWorkerFlow(input: {
  bundle: WorkerDayBundle;
  uploadQueue: UnifiedUploadItem[];
  todaySessionDone: boolean;
  issueHasEvidence: boolean;
  trainingId?: string;
}): WorkerFlowValidation {
  const { bundle, uploadQueue } = input;
  const pendingUploads = uploadQueue.filter(
    (u) => u.status === "draft" || u.status === "pending" || u.status === "syncing" || u.status === "failed"
  ).length;
  const canStartSession = !!bundle.attendance?.checkIn && !bundle.attendance?.checkOut;
  const canCheckOut =
    !!bundle.attendance?.checkIn &&
    !bundle.attendance?.checkOut &&
    pendingUploads === 0 &&
    input.todaySessionDone;
  return {
    canStartSession,
    canCheckOut,
    canCloseIssue: input.issueHasEvidence,
    canCompleteTraining: (moduleId) => !bundle.completedTrainingIds.includes(moduleId),
    sessionBlockReason: !bundle.attendance?.checkIn
      ? "Check in at the center before starting a preschool session."
      : undefined,
    checkoutBlockReason: pendingUploads > 0
      ? "Complete or sync pending uploads before check-out."
      : !input.todaySessionDone
        ? "Record today's preschool session before ending your day."
        : undefined,
  };
}
