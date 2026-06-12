import type { LocationMatchStatus } from "@/lib/geo/haversine";

export type VerificationCheckStatus = "verified" | "review" | "unknown";

export interface SessionVerification {
  centerLatitude: number;
  centerLongitude: number;
  capturedLatitude: number | null;
  capturedLongitude: number | null;
  distance: number | null;
  matchStatus: LocationMatchStatus;
  verificationStatus: VerificationCheckStatus;
  timestamp: string;
  centerName: string;
  village: string;
  district: string;
  gpsAvailable: boolean;
  explanation: string;
  fallbackUsed: boolean;
  deviceLabel?: string;
}

export interface SessionAuthenticityChecks {
  timeMatch: VerificationCheckStatus;
  centerMatch: VerificationCheckStatus;
  deviceMatch: VerificationCheckStatus;
  uploadIntegrity: VerificationCheckStatus;
}

export interface ClassroomEvidenceSummary {
  childrenDetected: number;
  childrenVisibleRange: string;
  teacherVisible: string;
  activityDetected: string;
  storyDetected: string;
  transcriptAvailable: boolean;
}

export interface ClassroomObservationSummary {
  childrenEstimated: number;
  childrenVisible: string;
  teacherActivities: string[];
  childrenListeningPercent: number;
  interactionLevel: string;
  storyCompleted: boolean;
  childrenEngaged: boolean;
  conciseObservations: string[];
}

export interface VerificationTimelineStep {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
  at?: string;
}
