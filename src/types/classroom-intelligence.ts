import { PerformanceBand, SyllabusCategory } from "@/types/session";

/** Computed indices (0–100) per analyzed session */
export interface ClassroomAnalyticsIndices {
  opi: number;
  tei: number;
  cei: number;
  cqi: number;
  sai: number;
  ccs: number;
  ips: number;
}

export interface ClassroomHeatmapSegment {
  segment: string;
  engagement: number;
}

export interface ClassroomTimelineStep {
  step: string;
  status: "done" | "active" | "pending";
  at?: string;
  detail?: string;
}

export interface ClassroomSessionAnalytics {
  sessionId: string;
  centerId: string;
  centerName: string;
  workerId: string;
  workerName: string;
  district: string;
  syllabusCategory: SyllabusCategory;
  publishedAt: string;
  indices: ClassroomAnalyticsIndices;
  band: PerformanceBand;
  aiConfidence: number;
  flagged: boolean;
  repeatedIssueTags: string[];
  coachingRecommended: boolean;
  workerView: ClassroomWorkerView;
  operationalView: ClassroomOperationalView;
  executiveView: ClassroomExecutiveView;
  heatmap: ClassroomHeatmapSegment[];
  timelineReplay: ClassroomTimelineStep[];
}

export interface ClassroomWorkerView {
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  coachingRecommendations: string[];
  supportiveBandMessage: string;
}

export interface ClassroomOperationalView {
  summary: string;
  actionItems: string[];
  coachingQueuePriority: "low" | "medium" | "high";
  syllabusCompletionPct: number;
  engagementTrend: "up" | "stable" | "down";
}

export interface ClassroomExecutiveView {
  summary: string;
  riskIndicator: "low" | "medium" | "high";
  districtAttention: boolean;
  interventionHint?: string;
}

export interface ClassroomSupervisorReview {
  sessionId: string;
  supervisorId: string;
  remarks: string;
  approvedObservation: boolean;
  followUpScheduled?: string;
  coachingAssigned: boolean;
  updatedAt: string;
}

export interface ClassroomIntelBundle {
  analytics: Record<string, ClassroomSessionAnalytics>;
  reviews: Record<string, ClassroomSupervisorReview>;
}

export interface SessionComparisonResult {
  before: ClassroomSessionAnalytics;
  after: ClassroomSessionAnalytics;
  opiDelta: number;
  ceiDelta: number;
  narrative: string;
  improved: boolean;
}

export interface OperationalClassroomSnapshot {
  totalSessions: number;
  bandDistribution: { green: number; orange: number; red: number };
  avgOpi: number;
  avgEngagement: number;
  syllabusAdherence: number;
  flaggedCount: number;
  coachingQueue: number;
  repeatedIssues: string[];
  centerRankings: { centerId: string; centerName: string; avgOpi: number; sessions: number }[];
  workerTrends: { workerId: string; workerName: string; trend: "up" | "stable" | "down"; latestOpi: number }[];
}

export interface ExecutiveClassroomSnapshot {
  totalSessionsRecorded: number;
  stateAvgOpi: number;
  districtComparison: { district: string; avgOpi: number; sessions: number; band: PerformanceBand }[];
  engagementTrend: number[];
  trainingImpactPct: number;
  grievanceCorrelation: string;
  interventionEffectivenessPct: number;
  districtsNeedingAttention: string[];
  districtsImproving: string[];
}
