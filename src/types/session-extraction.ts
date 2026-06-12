import { PerformanceBand } from "@/types/session";
import type {
  ClassroomEvidenceSummary,
  ClassroomObservationSummary,
  SessionAuthenticityChecks,
  SessionVerification,
  VerificationTimelineStep,
} from "@/types/session-verification";

/** Approved hackathon storytelling observation structure. */
export interface DemoStorytellingSessionAnalysis {
  activityType: string;
  duration: string;
  classroomType: string;
  teacherVisible: string;
  confidence: string;
  childrenDetected: number;
  childrenVisibleRange: string;
  classStrength: number;
  teacherDetected: number;
  totalVisible: number;
  attendanceConfidence: string;
  attendanceConfidenceReason: string;
  seatingFront: string;
  seatingMiddle: string;
  seatingBack: string;
  classroomArrangement: string;
  seatingObservations: string[];
  readiness: number;
  teacherBodyObserved: string[];
  teacherStrengths: string[];
  teacherImprove: string[];
  teachingPresence: number;
  highlyAttentive: string;
  moderatelyAttentive: string;
  distracted: string;
  childEngagementObserved: string[];
  engagementPercentRange: string;
  participationCurrentTeacher: number;
  participationCurrentChildren: number;
  participationRecommendedTeacher: number;
  participationRecommendedChildren: number;
  engagementRecommendations: string[];
  storytellingObserved: string[];
  storytellingStrengths: string[];
  storytellingImprove: string[];
  storytellingEffectiveness: number;
  participation: number;
  completionConfidence: number;
  completionChecklist: string[];
  strengths: string[];
  improvements: string[];
  followUpActivities: string[];
  supportLevel: PerformanceBand;
  supportLevelMessage: string;
  teachingQuality: number;
  engagement: number;
  storytellingQuality: number;
  extractedContextTelugu: string;
  extractedContextEnglish: string;
  transcriptTelugu: string;
  transcriptEnglish: string;
  classroomSummary: string;
  storyDetected: string;
}

export type ExtractionPipelineStageId =
  | "upload_video"
  | "extract_frames"
  | "detect_teacher"
  | "detect_children"
  | "analyze_engagement"
  | "detect_storytelling"
  | "compare_activity"
  | "generate_insights"
  | "create_support_summary";

export interface ExtractionPipelineStage {
  id: ExtractionPipelineStageId;
  label: string;
  status: "pending" | "active" | "done";
}

export const EXTRACTION_PIPELINE_STAGES: { id: ExtractionPipelineStageId; label: string }[] = [
  { id: "upload_video", label: "Upload Video" },
  { id: "extract_frames", label: "Extract Frames" },
  { id: "detect_teacher", label: "Detect Teacher" },
  { id: "detect_children", label: "Detect Children" },
  { id: "analyze_engagement", label: "Analyze Engagement" },
  { id: "detect_storytelling", label: "Detect Storytelling" },
  { id: "compare_activity", label: "Compare With Activity" },
  { id: "generate_insights", label: "Generate Insights" },
  { id: "create_support_summary", label: "Create Support Summary" },
];

export type ConfidenceLabel = "high" | "moderate" | "estimated";

export interface SessionExtractedAnalysis {
  sessionId: string;
  activityType: string;
  childrenDetected: number;
  teacherDetected: number;
  attentiveChildren: number;
  moderateAttention: number;
  distractedChildren: number;
  classroomReadiness: number;
  engagementSummary: string;
  storytellingSummary: string;
  teacherObservations: string[];
  childObservations: string[];
  classroomPresenceObservations: string[];
  participationRate: number;
  engagementPercent: number;
  storytellingScore: number;
  storytellingEffectiveness: number;
  expressionQuality: number;
  interactionLevel: number;
  classroomEnergy: number;
  teachingQuality: number;
  activityCompletionConfidence: number;
  seatingQuality: number;
  visibilityScore: number;
  participationEnvironment: number;
  supportLevel: PerformanceBand;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  confidenceNote: string;
  recommendations: string[];
  generatedTraining: string[];
  whatWentWell: string[];
  improveNextSession: string[];
  suggestedFollowUpActivity: string;
  supervisorGuidance: string;
  supportLevelMessage: string;
  durationSeconds: number;
  framesAnalyzed: number;
  savedAt?: string;
  attentionTrend: { segment: string; attentive: number }[];
  /** Structured session analysis (demo template fields when hackathon flag on). */
  sessionAnalysis?: DemoStorytellingSessionAnalysis;
  demoStorytellingTemplate?: DemoStorytellingSessionAnalysis;
  isDemoAnalysis?: boolean;
  extractedContextTelugu?: string;
  extractedContextEnglish?: string;
  transcriptSavedAt?: string;
  sessionVerification?: SessionVerification;
  authenticityChecks?: SessionAuthenticityChecks;
  classroomEvidence?: ClassroomEvidenceSummary;
  classroomObservationSummary?: ClassroomObservationSummary;
  verificationTimeline?: VerificationTimelineStep[];
  verificationSavedAt?: string;
}

export interface SessionProcessingState {
  sessionId: string;
  stages: ExtractionPipelineStage[];
  currentStageIndex: number;
  videoBlobUrl?: string;
  startedAt: string;
  updatedAt: string;
  completed: boolean;
  extracted?: SessionExtractedAnalysis;
}
