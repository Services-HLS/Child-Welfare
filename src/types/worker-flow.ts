/** Worker orchestrator — flow states, events, unified queue */

export type WorkerFlowState =
  | "NOT_STARTED"
  | "CHECKED_IN"
  | "SESSION_ACTIVE"
  | "SESSION_COMPLETED"
  | "SERVICES_PENDING"
  | "UPLOAD_PENDING"
  | "ISSUES_PENDING"
  | "DAY_COMPLETED";

export type WorkerFlowEvent =
  | "ATTENDANCE_COMPLETED"
  | "SESSION_STARTED"
  | "SESSION_UPLOADED"
  | "AI_ANALYSIS_COMPLETED"
  | "ACTIVITY_COMPLETED"
  | "UPLOAD_VERIFIED"
  | "TRAINING_COMPLETED"
  | "ISSUE_RESOLVED"
  | "DAY_COMPLETED";

export type ServiceCategory =
  | "Preschool"
  | "Nutrition"
  | "Health"
  | "Visits"
  | "Outreach"
  | "Infrastructure";

export type UnifiedUploadStatus = "draft" | "pending" | "syncing" | "verified" | "failed";

export type SessionPipelineStatus =
  | "draft"
  | "recording"
  | "uploading"
  | "processing"
  | "completed";

export interface AuditMeta {
  createdAt: string;
  updatedAt: string;
  offline: boolean;
  synced: boolean;
  verified: boolean;
}

export interface WorkerAttendanceRecord {
  id: string;
  date: string;
  workerId: string;
  centerId: string;
  checkIn?: string;
  checkOut?: string;
  lat: number;
  lng: number;
  audit: AuditMeta;
}

export interface UnifiedUploadItem {
  id: string;
  sourceType: "attendance" | "session" | "activity" | "complaint" | "training";
  sourceId: string;
  label: string;
  status: UnifiedUploadStatus;
  progress: number;
  evidenceCount: number;
  error?: string;
  audit: AuditMeta;
}

export interface WorkerDayProgress {
  flowState: WorkerFlowState;
  progressPercent: number;
  completionBadge: "not_started" | "in_progress" | "almost_done" | "day_complete";
  steps: WorkerTimelineStep[];
  metrics: WorkerDayMetrics;
}

export interface WorkerTimelineStep {
  id: string;
  label: string;
  status: "done" | "current" | "pending";
  time?: string;
}

export interface WorkerDayMetrics {
  attendanceLabel: string;
  sessionLabel: string;
  activitiesPercent: number;
  activitiesDone: number;
  activitiesTarget: number;
  assignedIssues: number;
  openIssues: number;
  trainingPending: number;
  uploadPending: number;
  serviceCompletionPercent: number;
}

export interface WorkerDayBundle {
  date: string;
  workerId: string;
  centerId: string;
  flowState: WorkerFlowState;
  attendance?: WorkerAttendanceRecord;
  activeSessionId?: string;
  completedTrainingIds: string[];
  completedActivityIds: string[];
  resolvedComplaintIds: string[];
  events: { event: WorkerFlowEvent; at: string }[];
  uploadQueue: UnifiedUploadItem[];
  audit: AuditMeta;
}

export interface WorkerFlowValidation {
  canStartSession: boolean;
  canCheckOut: boolean;
  canCloseIssue: boolean;
  canCompleteTraining: (moduleId: string) => boolean;
  sessionBlockReason?: string;
  checkoutBlockReason?: string;
}
