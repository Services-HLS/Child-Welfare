import { SessionScorecard, SessionMetadata } from "@/types/session";
import { SessionExtractedAnalysis, DemoStorytellingSessionAnalysis } from "@/types/session-extraction";
import { DEMO_EXTRACTED_CONTEXT_ENGLISH, DEMO_EXTRACTED_CONTEXT_TELUGU } from "@/data/demoClassroomTranscript";
import {
  normalizeSessionVerification,
  buildClassroomEvidence,
  buildClassroomObservationSummary,
  buildVerificationTimeline,
} from "@/services/session/buildSessionVerification";

export const DEMO_STORYTELLING_TEMPLATE: DemoStorytellingSessionAnalysis = {
  activityType: "Storytelling",
  duration: "~2 min 51 sec observed",
  classroomType: "Group preschool session",
  teacherVisible: "Yes (throughout most of session)",
  confidence: "Moderate (single camera angle)",
  childrenDetected: 13,
  childrenVisibleRange: "≈ 12–15",
  classStrength: 13,
  teacherDetected: 1,
  totalVisible: 14,
  attendanceConfidence: "Moderate",
  attendanceConfidenceReason: "Some children are partially hidden behind others.",
  seatingFront: "5–6 children",
  seatingMiddle: "4–5 children",
  seatingBack: "2–3 children",
  classroomArrangement: "GOOD",
  seatingObservations: [
    "Children seated in group format",
    "Teacher visible to class",
    "Visual learning material visible behind teacher",
    "Suitable for storytelling",
  ],
  readiness: 84,
  teacherBodyObserved: [
    "Teacher remained standing throughout.",
    "Hand gestures used repeatedly.",
    "Story delivered with movement and pointing.",
    "Teacher maintained visible presence.",
  ],
  teacherStrengths: ["Confident posture", "Good classroom ownership", "Active narration"],
  teacherImprove: ["Walk toward children more.", "Add expression changes.", "Invite participation."],
  teachingPresence: 82,
  highlyAttentive: "8–10",
  moderatelyAttentive: "3–4",
  distracted: "1–2",
  childEngagementObserved: [
    "Majority looking toward teacher",
    "Children remained seated",
    "Story maintained attention",
  ],
  engagementPercentRange: "78–82%",
  participationCurrentTeacher: 80,
  participationCurrentChildren: 20,
  participationRecommendedTeacher: 60,
  participationRecommendedChildren: 40,
  engagementRecommendations: [
    "Ask “What happened next?”",
    "Ask children to repeat",
    "Raise-hand interaction",
    "Story role-play",
  ],
  storytellingObserved: [
    "Continuous narration",
    "Stable pace",
    "Good control",
    "Teacher-led delivery",
  ],
  storytellingStrengths: [
    "Story flow maintained",
    "Children remained attentive",
    "Clear teacher visibility",
  ],
  storytellingImprove: [
    "More voice variation",
    "Pause for responses",
    "Add child questions",
    "Use action imitation",
  ],
  storytellingEffectiveness: 85,
  participation: 72,
  completionConfidence: 88,
  completionChecklist: [
    "Story Started ✓",
    "Teacher Active ✓",
    "Children Present ✓",
    "Session Continued ✓",
  ],
  strengths: [
    "Children remained attentive",
    "Teacher maintained engagement",
    "Story pacing was stable",
    "Classroom setup supported storytelling",
  ],
  improvements: [
    "Ask more questions",
    "Increase child interaction",
    "Move around classroom",
    "Add repeat-after-me activity",
  ],
  followUpActivities: ["Story + Drawing", "Story + Role Play"],
  supportLevel: "green",
  supportLevelMessage: "Continue and strengthen current practice",
  teachingQuality: 82,
  engagement: 80,
  storytellingQuality: 85,
  extractedContextTelugu: DEMO_EXTRACTED_CONTEXT_TELUGU,
  extractedContextEnglish: DEMO_EXTRACTED_CONTEXT_ENGLISH,
  transcriptTelugu: DEMO_EXTRACTED_CONTEXT_TELUGU,
  transcriptEnglish: DEMO_EXTRACTED_CONTEXT_ENGLISH,
  classroomSummary:
    "Teacher conducted storytelling. Children remained attentive. Story completed successfully. Participation can be increased.",
  storyDetected: "Nakka–Tabelu (Fox & Tortoise)",
};

export function buildDemoStorytellingScorecard(metadata: SessionMetadata): SessionScorecard {
  const t = DEMO_STORYTELLING_TEMPLATE;
  const present = t.classStrength;
  return {
    teachingEffectiveness: t.teachingQuality / 100,
    childEngagement: t.engagement / 100,
    communication: 0.82,
    activityCompliance: t.completionConfidence / 100,
    classroomManagement: t.readiness / 100,
    overallPerformanceIndex: 0.84,
    band: t.supportLevel,
    bodyLanguage: {
      teacherEngagement: 0.82,
      movementScore: 0.8,
      postureConfidence: 0.82,
      interactionQuality: 0.78,
    },
    childEngagementDetail: {
      attentive: 9,
      participating: 2,
      distracted: 2,
      inactive: 0,
      absent: 0,
      estimatedPresent: present,
    },
    speech: {
      clarity: 0.82,
      pace: 0.85,
      confidence: 0.8,
      emotionalTone: 0.78,
      languageAppropriateness: 0.88,
    },
    syllabus: {
      curriculumMatch: 0.88,
      activitySequenceScore: 0.85,
      topicsCovered: ["Storytelling", metadata.syllabusCategory, "Group listening"],
      gaps: [],
    },
    classroomQuality: {
      activityCompletion: t.completionConfidence / 100,
      materialUsage: 0.84,
      timeUtilization: 0.82,
      inclusiveness: 0.8,
      participationBalance: t.participation / 100,
    },
    supportiveRecommendations: [...t.engagementRecommendations, ...t.storytellingImprove],
    trainingModuleIds: ["TM-STORY-01", "TM-ENG-02"],
  };
}

export function buildDemoStorytellingExtraction(
  sessionId: string,
  metadata?: SessionMetadata,
  durationSeconds = 171,
  options?: { gpsAvailable?: boolean }
): SessionExtractedAnalysis {
  const t = DEMO_STORYTELLING_TEMPLATE;

  const meta =
    metadata ??
    ({
      centerId: "AWC-TPT-01",
      centerName: "Alipiri Center",
      timestamp: new Date().toISOString(),
      gps: { lat: 13.6288, lng: 79.4192 },
      workerId: "W-1042",
      workerName: "Lakshmi Devi",
      sessionType: "Storytelling",
      ageGroup: "Mixed 3-6",
      syllabusCategory: "language",
    } satisfies SessionMetadata);

  const { metadata: normMeta, sessionVerification, authenticityChecks } = normalizeSessionVerification(meta);
  const metaForTimeline = normMeta;

  return {
    sessionId,
    activityType: t.activityType,
    childrenDetected: t.childrenDetected,
    teacherDetected: t.teacherDetected,
    attentiveChildren: 9,
    moderateAttention: 4,
    distractedChildren: 2,
    classroomReadiness: t.readiness,
    engagementSummary: `Estimated engagement ${t.engagementPercentRange}. ${t.childEngagementObserved.join(" ")}`,
    storytellingSummary: t.storytellingObserved.join(" "),
    teacherObservations: t.teacherBodyObserved,
    childObservations: t.childEngagementObserved,
    classroomPresenceObservations: t.seatingObservations,
    participationRate: t.participation,
    engagementPercent: t.engagement,
    storytellingScore: t.storytellingQuality,
    storytellingEffectiveness: t.storytellingEffectiveness,
    expressionQuality: 82,
    interactionLevel: t.participation,
    classroomEnergy: 80,
    teachingQuality: t.teachingQuality,
    activityCompletionConfidence: t.completionConfidence,
    seatingQuality: t.readiness,
    visibilityScore: 78,
    participationEnvironment: t.participation,
    supportLevel: t.supportLevel,
    confidence: 72,
    confidenceLabel: "moderate",
    confidenceNote: t.attendanceConfidenceReason,
    recommendations: t.engagementRecommendations,
    generatedTraining: ["TM-STORY-01", "TM-ENG-02"],
    whatWentWell: t.strengths,
    improveNextSession: t.improvements,
    suggestedFollowUpActivity: t.followUpActivities[0],
    supervisorGuidance:
      "Supervisor may acknowledge strong storytelling delivery. Continue interactive questioning in next session.",
    supportLevelMessage: t.supportLevelMessage,
    durationSeconds,
    framesAnalyzed: 86,
    attentionTrend: [
      { segment: "Opening", attentive: 75 },
      { segment: "Story middle", attentive: 80 },
      { segment: "Interaction", attentive: 72 },
      { segment: "Closing", attentive: 78 },
    ],
    sessionAnalysis: { ...t },
    demoStorytellingTemplate: t,
    isDemoAnalysis: true,
    extractedContextTelugu: t.extractedContextTelugu,
    extractedContextEnglish: t.extractedContextEnglish,
    sessionVerification,
    authenticityChecks,
    classroomEvidence: buildClassroomEvidence(t),
    classroomObservationSummary: buildClassroomObservationSummary(t),
    verificationTimeline: buildVerificationTimeline(metaForTimeline, false),
  };
}
