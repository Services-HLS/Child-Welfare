/** Preschool session recording & AI scorecard types */

import type { SessionExtractedAnalysis } from "@/types/session-extraction";

export type SessionRecordingStatus = "recording" | "paused" | "uploading" | "processing" | "completed" | "queued_offline" | "failed";
export type PerformanceBand = "green" | "orange" | "red";
export type SyllabusCategory = "language" | "numeracy" | "motor_skills" | "socio_emotional" | "creative" | "general";

export interface SessionMetadata {
  workerId: string;
  workerName: string;
  centerId: string;
  centerName: string;
  timestamp: string;
  sessionType: string;
  gps: { lat: number; lng: number };
  ageGroup: string;
  syllabusCategory: SyllabusCategory;
  durationMinutes?: number;
  plannedDuration?: string;
  childCount?: number;
  workerObservations?: string;
}

export interface BodyLanguageSignals {
  teacherEngagement: number;
  movementScore: number;
  postureConfidence: number;
  interactionQuality: number;
}

export interface ChildEngagementSignals {
  attentive: number;
  participating: number;
  distracted: number;
  inactive: number;
  absent: number;
  estimatedPresent: number;
}

export interface SpeechSignals {
  clarity: number;
  pace: number;
  confidence: number;
  emotionalTone: number;
  languageAppropriateness: number;
}

export interface SyllabusComplianceSignals {
  curriculumMatch: number;
  activitySequenceScore: number;
  topicsCovered: string[];
  gaps: string[];
}

export interface ClassroomQualitySignals {
  activityCompletion: number;
  materialUsage: number;
  timeUtilization: number;
  inclusiveness: number;
  participationBalance: number;
}

export interface SessionScorecard {
  teachingEffectiveness: number;
  childEngagement: number;
  communication: number;
  activityCompliance: number;
  classroomManagement: number;
  overallPerformanceIndex: number;
  band: PerformanceBand;
  bodyLanguage: BodyLanguageSignals;
  childEngagementDetail: ChildEngagementSignals;
  speech: SpeechSignals;
  syllabus: SyllabusComplianceSignals;
  classroomQuality: ClassroomQualitySignals;
  supportiveRecommendations: string[];
  trainingModuleIds: string[];
}

export interface SessionRecording {
  id: string;
  metadata: SessionMetadata;
  status: SessionRecordingStatus;
  videoBlobUrl?: string;
  /** Video bytes stored in IndexedDB (blob URLs are not persisted). */
  hasLocalVideo?: boolean;
  audioBlobUrl?: string;
  uploadProgress: number;
  synced: boolean;
  scorecard?: SessionScorecard;
  extractedAnalysis?: SessionExtractedAnalysis;
  analysisSaved?: boolean;
  workerComment?: string;
  reEvaluationRequested?: boolean;
  createdAt: string;
  processedAt?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface TrainingRecommendation {
  id: string;
  workerId: string;
  sessionId?: string;
  moduleIds: string[];
  reason: string;
  band: PerformanceBand;
  createdAt: string;
  assignedBy?: "ai" | "supervisor";
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "awaiting_practice"
    | "submitted"
    | "completed"
    | "improved";
  dueAt?: string;
  primaryModuleId?: string;
}

export interface CoachingAssignment {
  id: string;
  workerId: string;
  workerName: string;
  centerId: string;
  supervisorId: string;
  moduleIds: string[];
  notes: string;
  dueAt: string;
  status: "assigned" | "in_progress" | "completed";
  createdAt: string;
}

export interface WorkerProgressSnapshot {
  workerId: string;
  weeklyAvgOpi: number;
  monthlyAvgOpi: number;
  sessionsThisWeek: number;
  strengths: string[];
  improvementAreas: string[];
  band: PerformanceBand;
}
