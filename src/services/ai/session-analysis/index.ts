import {
  SessionMetadata,
  SessionScorecard,
  PerformanceBand,
  BodyLanguageSignals,
  ChildEngagementSignals,
  SpeechSignals,
  SyllabusComplianceSignals,
  ClassroomQualitySignals,
} from "@/types/session";
import { generateTrainingRecommendations } from "./training-recommendations";

function bandFromScore(score: number): PerformanceBand {
  if (score >= 0.75) return "green";
  if (score >= 0.55) return "orange";
  return "red";
}

function supportiveMessage(band: PerformanceBand, gaps: string[]): string[] {
  const base =
    band === "green"
      ? ["Your session shows strong engagement — keep sharing best practices with peers."]
      : band === "orange"
        ? ["You're making progress. Focus on the suggested modules to strengthen classroom moments."]
        : ["This is a development opportunity, not a penalty. Coaching support is available."];
  const tips = gaps.map((g) => `Practice tip: improve ${g} through short daily drills.`);
  return [...base, ...tips.slice(0, 3)];
}

export async function analyzePreschoolSession(
  metadata: SessionMetadata,
  _hasVideo: boolean,
  _hasAudio: boolean
): Promise<SessionScorecard> {
  await new Promise((r) => setTimeout(r, 2200));

  const seed = metadata.workerId.length + metadata.syllabusCategory.length;
  const jitter = () => 0.55 + ((seed * Math.random()) % 40) / 100;

  const bodyLanguage: BodyLanguageSignals = {
    teacherEngagement: jitter(),
    movementScore: jitter(),
    postureConfidence: jitter(),
    interactionQuality: jitter(),
  };

  const present = 18 + Math.floor(Math.random() * 10);
  const childEngagementDetail: ChildEngagementSignals = {
    attentive: Math.floor(present * 0.55),
    participating: Math.floor(present * 0.25),
    distracted: Math.floor(present * 0.12),
    inactive: Math.floor(present * 0.05),
        absent: Math.max(0, present - 28),
    estimatedPresent: present,
  };

  const speech: SpeechSignals = {
    clarity: jitter(),
    pace: jitter(),
    confidence: jitter(),
    emotionalTone: jitter(),
    languageAppropriateness: jitter(),
  };

  const syllabus: SyllabusComplianceSignals = {
    curriculumMatch: jitter(),
    activitySequenceScore: jitter(),
    topicsCovered: ["Greetings", "Counting 1-5", "Story time", metadata.syllabusCategory],
    gaps: jitter() < 0.65 ? ["Phonemic awareness activity not detected"] : [],
  };

  const classroomQuality: ClassroomQualitySignals = {
    activityCompletion: jitter(),
    materialUsage: jitter(),
    timeUtilization: jitter(),
    inclusiveness: jitter(),
    participationBalance: jitter(),
  };

  const teachingEffectiveness =
    (bodyLanguage.teacherEngagement + bodyLanguage.interactionQuality) / 2;
  const childEngagement =
    (childEngagementDetail.attentive + childEngagementDetail.participating) /
    Math.max(childEngagementDetail.estimatedPresent, 1);
  const communication = (speech.clarity + speech.confidence + speech.languageAppropriateness) / 3;
  const activityCompliance = (syllabus.curriculumMatch + syllabus.activitySequenceScore) / 2;
  const classroomManagement =
    (classroomQuality.timeUtilization + classroomQuality.participationBalance) / 2;

  const overallPerformanceIndex =
    teachingEffectiveness * 0.25 +
    childEngagement * 0.25 +
    communication * 0.2 +
    activityCompliance * 0.15 +
    classroomManagement * 0.15;

  const band = bandFromScore(overallPerformanceIndex);
  const gaps = [
    ...syllabus.gaps,
    ...(childEngagement < 0.6 ? ["child group engagement"] : []),
    ...(communication < 0.6 ? ["verbal clarity and pacing"] : []),
  ];

  const trainingModuleIds = generateTrainingRecommendations({
    band,
    gaps,
    syllabusCategory: metadata.syllabusCategory,
  });

  return {
    teachingEffectiveness,
    childEngagement,
    communication,
    activityCompliance,
    classroomManagement,
    overallPerformanceIndex,
    band,
    bodyLanguage,
    childEngagementDetail,
    speech,
    syllabus,
    classroomQuality,
    supportiveRecommendations: supportiveMessage(band, gaps),
    trainingModuleIds,
  };
}

export { generateTrainingRecommendations } from "./training-recommendations";
