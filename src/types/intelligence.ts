/** Outcome, impact, explainability, interventions, timeline, demo */

export interface ChildProgressRecord {
  id: string;
  childId: string;
  childName: string;
  centerId: string;
  workerId: string;
  date: string;
  attended: boolean;
  nutritionCompleted: boolean;
  preschoolParticipation: number;
  growthMilestone?: string;
  learningObservation?: string;
  developmentalNote?: string;
  activityId?: string;
  /** Attendance consistency 0–1 over recent logs */
  attendanceConsistency?: number;
  growthIndicator?: "on_track" | "monitor" | "concern";
}

export type ChildRiskSignalType =
  | "attendance_drop"
  | "delayed_participation"
  | "nutrition_inconsistency"
  | "developmental_concern"
  | "center_outcome_decline";

export interface ChildRiskSignal {
  id: string;
  childId?: string;
  childName?: string;
  centerId: string;
  centerName: string;
  type: ChildRiskSignalType;
  severity: "low" | "medium" | "high";
  confidence: number;
  summary: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface ChildWellnessIndex {
  centerId: string;
  centerName: string;
  district: string;
  cwiScore: number;
  attendanceComponent: number;
  nutritionComponent: number;
  participationComponent: number;
  developmentComponent: number;
  trend: "up" | "down" | "stable";
  expectedParticipation: number;
  actualParticipation: number;
  updatedAt: string;
}

export interface CenterOutcomeSummary {
  centerId: string;
  centerName: string;
  childrenTracked: number;
  attendanceRate: number;
  nutritionCompletionRate: number;
  avgParticipation: number;
  outcomeTrend: "improving" | "stable" | "declining";
  developmentScore: number;
}

export type SurveyTrigger = "after_activity" | "complaint_closed" | "service_delivery" | "scheduled";

export interface BeneficiarySurvey {
  id: string;
  beneficiaryId: string;
  centerId: string;
  trigger: SurveyTrigger;
  createdAt: string;
  completedAt?: string;
  responses?: SurveyResponses;
}

export interface SurveyResponses {
  foodQuality: number;
  cleanliness: number;
  teacherSupport: number;
  learningQuality: number;
  communication: number;
  overallSatisfaction: number;
}

export interface ExplainabilityFactor {
  label: string;
  weight: number;
  impact: "positive" | "negative" | "neutral";
  detail: string;
}

export interface AIExplanation {
  id: string;
  sourceType: "session" | "grievance" | "sentiment" | "risk" | "training" | "sqi" | "aei";
  sourceId: string;
  score?: number;
  confidence: number;
  summary: string;
  factors: ExplainabilityFactor[];
  evidenceUsed: string[];
  suggestedActions: string[];
  thresholds?: { label: string; value: string; met: boolean }[];
  band?: "green" | "orange" | "red";
}

export type InterventionDimension =
  | "worker_training"
  | "worker_coaching"
  | "infrastructure"
  | "supervisor_attention"
  | "resource_allocation"
  | "operational_visit"
  | "follow_up_plan"
  | "community_outreach"
  | "monitoring_visit";

export type InterventionStatus =
  | "proposed"
  | "approved"
  | "active"
  | "completed"
  | "impact_measured"
  | "recommended"
  | "in_progress";

export interface InterventionRecommendation {
  id: string;
  centerId: string;
  centerName: string;
  dimension: InterventionDimension;
  priority: number;
  title: string;
  description: string;
  expectedImpact: string;
  evidenceSummary: string;
  createdAt: string;
  status: InterventionStatus;
  urgency?: "low" | "medium" | "high" | "critical";
  implementationEffort?: "low" | "medium" | "high";
  confidence?: number;
  projectedOutcomeDelta?: number;
  owner?: string;
  timelineDue?: string;
  measuredOutcome?: string;
}

export interface MissionControlSnapshot {
  activeSessions: number;
  liveComplaints: number;
  slaAtRisk: number;
  districtAlerts: number;
  sessionCompletionRate: number;
  grievanceClosureRate: number;
  satisfactionScore: number;
  interventionCompletionRate: number;
  platformHealth: "healthy" | "degraded" | "critical";
  workerBands: { green: number; orange: number; red: number };
  highRiskCenters: { centerId: string; centerName: string; reason: string }[];
  districtRankings: { district: string; sqi: number; cwi: number }[];
  sentimentLabel: string;
  interventionQueue: number;
}

export interface TimelineEvent {
  id: string;
  centerId: string;
  timestamp: string;
  type:
    | "service"
    | "feedback"
    | "complaint"
    | "escalation"
    | "resolution"
    | "coaching"
    | "session"
    | "outcome"
    | "survey";
  title: string;
  description: string;
  actor?: string;
}

export interface SyncQueueItem {
  id: string;
  type: "session" | "activity" | "feedback" | "outcome";
  label: string;
  status: "pending" | "uploading" | "failed" | "synced";
  progress: number;
  createdAt: string;
  error?: string;
}

export interface GovernmentStoryInsight {
  id: string;
  headline: string;
  narrative: string;
  metric?: string;
  trend?: "up" | "down" | "stable";
  category: "operations" | "quality" | "grievance" | "outcomes" | "trust";
  recommendedAction?: string;
}

export interface ImpactMetrics {
  childrenServed: number;
  issuesResolved: number;
  workersImprovedPostCoaching: number;
  satisfactionChangePct: number;
  serviceQualityChangePct: number;
  interventionSuccessRate: number;
  periodLabel: string;
  before: { sqi: number; satisfaction: number; openComplaints: number };
  after: { sqi: number; satisfaction: number; openComplaints: number };
}

export interface PublicTransparencyMetrics {
  servicesDelivered: number;
  grievanceResolutionRate: number;
  beneficiarySatisfaction: number;
  trainingModulesCompleted: number;
  districtImprovementPct: number;
  lastUpdated: string;
}

export type DemoJourneyId =
  | "parent"
  | "beneficiary"
  | "worker"
  | "supervisor"
  | "complaint"
  | "complaint_resolution"
  | "coaching"
  | "state_admin"
  | "state_monitoring";

export interface DemoScenarioId {
  id: string;
  title: string;
  description: string;
}

/** Anganwadi Excellence Index — platform KPI */
export type AEIBand = "green" | "orange" | "red";

export interface AnganwadiExcellenceIndex {
  centerId: string;
  centerName: string;
  district: string;
  score: number;
  band: AEIBand;
  components: {
    workerPerformance: number;
    childEngagement: number;
    beneficiarySatisfaction: number;
    complaintClosure: number;
    attendanceCompliance: number;
    serviceVerificationConfidence: number;
    interventionSuccess: number;
  };
  weights: {
    workerPerformance: number;
    childEngagement: number;
    beneficiarySatisfaction: number;
    complaintClosure: number;
    attendanceCompliance: number;
    serviceVerificationConfidence: number;
    interventionSuccess: number;
  };
  guidance: string[];
  recommendations: string[];
  trend: "up" | "down" | "stable";
  trendHistory?: { period: string; score: number }[];
  updatedAt: string;
}

export interface CenterHealthProfile {
  centerId: string;
  centerName: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  confidence: number;
  trendDirection: "improving" | "stable" | "declining";
  summary: string;
  factors: { label: string; severity: "low" | "medium" | "high"; detail: string }[];
  recommendedActions: string[];
}

export interface VoiceOfCitizenInsights {
  totalSignals: number;
  byChannel: Record<string, number>;
  topIssues: { label: string; count: number }[];
  positiveThemes: string[];
  negativeThemes: string[];
  recurringComplaints: number;
  recurringClusters: { label: string; centers: number }[];
  infrastructureIssues: string[];
  avgSatisfaction: number;
  trustIndicator: number;
  serviceQualityPerception: number;
  sentimentTrend: "improving" | "declining" | "stable";
  districtComparison: { district: string; score: number }[];
  aiSummary: string;
  alertMessage?: string;
}

export interface PlatformOutcomeMetrics {
  aeiAvg: number;
  sqiAvg: number;
  cwiAvg: number;
  beneficiarySatisfactionIndex: number;
  interventionSuccessRate: number;
  workerImprovementRate: number;
  complaintClosureRate: number;
  trustScore: number;
}

export interface OperationalFlowStep {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  narrative: string;
  timestamp?: string;
}

export interface WorkerGrowthProfile {
  workerId: string;
  workerName: string;
  centerId: string;
  currentBand: AEIBand;
  trajectory: { period: string; score: number }[];
  historicalBands: { date: string; band: AEIBand; score: number }[];
  beforeAfter: { before: number; after: number; label: string };
  sessionsEvaluated: number;
  trainingCompleted: number;
  interventionsJoined: number;
  estimatedImprovement: number;
  expectedImpactLabel: string;
  aiRecommendations: string[];
}

export interface CenterJourneyPhase {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  narrative: string;
  timestamp?: string;
  link?: string;
}
