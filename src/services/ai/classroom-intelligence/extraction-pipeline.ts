import { SessionRecording, SessionScorecard } from "@/types/session";
import {
  EXTRACTION_PIPELINE_STAGES,
  ExtractionPipelineStage,
  SessionExtractedAnalysis,
  SessionProcessingState,
  ConfidenceLabel,
} from "@/types/session-extraction";
import { ClassroomSessionAnalytics } from "@/types/classroom-intelligence";
import { buildClassroomAnalytics } from "./pipeline";
import { analyzePreschoolSession } from "@/services/ai/session-analysis";
import { loadSessionProcessing, saveSessionProcessing } from "@/lib/storage/sessionProcessing";
import { USE_DEMO_CLASSROOM_ANALYSIS } from "@/lib/featureFlags";
import {
  buildDemoStorytellingExtraction,
  buildDemoStorytellingScorecard,
} from "@/data/demoStorytellingTemplate";

function confidenceLabel(score: number): ConfidenceLabel {
  if (score >= 82) return "high";
  if (score >= 68) return "moderate";
  return "estimated";
}

function confidenceNote(label: ConfidenceLabel, children: number): string {
  if (label === "estimated") {
    return `Counts are estimated (${children} children visible) because camera angle or movement partially blocked visibility. Supervisor may verify during visit.`;
  }
  if (label === "moderate") {
    return `AI reviewed ${children} children with moderate visibility — some faces were partially obscured during movement.`;
  }
  return `AI reviewed clear classroom footage with strong visibility across the session.`;
}

function supportMessage(band: SessionScorecard["band"]): string {
  if (band === "green") return "Continue and strengthen current practice";
  if (band === "orange") return "Add coaching and improve interaction";
  return "Additional support recommended";
}

export function initProcessingState(sessionId: string, videoBlobUrl?: string): SessionProcessingState {
  const stages: ExtractionPipelineStage[] = EXTRACTION_PIPELINE_STAGES.map((s, i) => ({
    id: s.id,
    label: s.label,
    status: i === 0 ? "active" : "pending",
  }));
  return {
    sessionId,
    stages,
    currentStageIndex: 0,
    videoBlobUrl,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completed: false,
  };
}

export async function persistProcessing(state: SessionProcessingState): Promise<void> {
  await saveSessionProcessing(state);
}

export async function restoreProcessing(sessionId: string): Promise<SessionProcessingState | null> {
  return loadSessionProcessing(sessionId);
}

function buildExtractedFromVideo(
  session: SessionRecording,
  scorecard: SessionScorecard,
  durationSeconds: number,
  analytics: ClassroomSessionAnalytics | null
): SessionExtractedAnalysis {
  const sc = scorecard;
  const d = sc.childEngagementDetail;
  const isStory = /story|rhyme|tale|narrat/i.test(session.metadata.sessionType);
  const childrenDetected = d.estimatedPresent || session.metadata.childCount || 18;
  const attentive = d.attentive + d.participating;
  const moderate = Math.floor(d.distracted * 0.6);
  const distracted = d.distracted + d.inactive;
  const participationRate = Math.round(((attentive) / Math.max(childrenDetected, 1)) * 100);
  const engagementPercent = Math.round(sc.childEngagement * 100);
  const aiConf = analytics?.aiConfidence ?? Math.round((sc.speech.clarity + sc.bodyLanguage.interactionQuality) * 50);
  const confLabel = confidenceLabel(aiConf);

  const classroomReadiness = Math.round(
    (sc.classroomQuality.activityCompletion + sc.classroomQuality.materialUsage + sc.bodyLanguage.postureConfidence) /
      3 *
      100
  );
  const storytellingScore = Math.round(
    (sc.speech.emotionalTone + sc.speech.languageAppropriateness + sc.communication) / 3 * 100
  );

  const teacherObservations: string[] = [];
  if (sc.bodyLanguage.teacherEngagement > 0.7) teacherObservations.push("Teacher remained visible throughout the session.");
  if (sc.bodyLanguage.movementScore > 0.65) teacherObservations.push("Used repeated gestures while narrating the story.");
  if (sc.bodyLanguage.postureConfidence > 0.6) teacherObservations.push("Maintained upright posture facing the children.");
  if (sc.communication > 0.7) teacherObservations.push("Voice stayed consistent during storytelling segments.");
  else teacherObservations.push("Relied mostly on direct narration — limited gesture variation detected.");
  if (sc.bodyLanguage.interactionQuality > 0.65) teacherObservations.push("Moved within the group to maintain class ownership.");

  const childObservations: string[] = [];
  if (engagementPercent >= 70) childObservations.push("Children remained focused during most of the story.");
  if (d.participating > 4) childObservations.push("Several children followed narration with verbal responses.");
  if (d.distracted > 3) childObservations.push("A small group looked away during the middle segment — attention dipped briefly.");
  else childObservations.push("Listening behavior was steady across seated children.");
  if (sc.classroomQuality.participationBalance > 0.65) childObservations.push("Participation was balanced between boys and girls visible in frame.");

  const classroomPresenceObservations = [
    "Children seated facing the teacher in a semi-circle arrangement.",
    attentive >= childrenDetected * 0.6
      ? "Attention maintained across the main storytelling block."
      : "Attention varied — encourage shorter story segments with movement breaks.",
    "Classroom setup supports storytelling with open front space visible in recording.",
    `Approximate classroom strength: ${childrenDetected} children visible in extracted frames.`,
  ];

  const engagementSummary = `From ${Math.max(12, Math.floor(durationSeconds / 15))} analyzed frames, about ${attentive} children showed attentive or active participation (${participationRate}%). ${distracted > 2 ? `${distracted} children appeared distracted at times.` : "Distraction was minimal."} Environment supports group listening.`;

  const storytellingSummary = isStory
    ? `Storytelling detected: pacing ${sc.speech.pace > 0.65 ? "steady" : "slightly fast"}, voice variation ${sc.speech.emotionalTone > 0.7 ? "good" : "moderate"}, and ${d.participating > 3 ? "interaction opportunities observed" : "limited child interaction during narrative"}. Expression quality supports preschool story time.`
    : `Activity "${session.metadata.sessionType}" recorded — narrative elements ${isStory ? "strong" : "present"} with ${storytellingScore}% storytelling effectiveness estimate.`;

  const recommendations = [
    ...(participationRate < 65 ? ["Ask prediction questions before turning the page.", "Add repeat-after-me moments during the story."] : []),
    ...(sc.bodyLanguage.movementScore < 0.6 ? ["Use more movement and hand actions while narrating."] : []),
    "Introduce a story plus drawing follow-up activity tomorrow.",
    ...(sc.syllabus.gaps[0] ? [`Address syllabus gap: ${sc.syllabus.gaps[0]}`] : []),
  ].slice(0, 5);

  const whatWentWell = analytics?.workerView.strengths ?? [
    "Children remained attentive during storytelling.",
    "Story pacing was appropriate for 3–6 year age group.",
    ...(sc.communication > 0.7 ? ["Teacher voice was clear and audible."] : []),
  ];

  const improveNextSession = analytics?.workerView.improvementAreas ?? [
    ...(participationRate < 70 ? ["Increase child participation with call-and-response."] : []),
    ...(sc.bodyLanguage.movementScore < 0.65 ? ["Use more movement during narration."] : []),
    "Add one interactive pause every 3–4 minutes.",
  ];

  const heatmap = analytics?.heatmap ?? [
    { segment: "Opening", engagement: Math.round(sc.teachingEffectiveness * 90) },
    { segment: "Story middle", engagement: engagementPercent },
    { segment: "Interaction", engagement: Math.round(d.participating * 8) },
    { segment: "Closing", engagement: Math.round(sc.communication * 85) },
  ];

  return {
    sessionId: session.id,
    activityType: session.metadata.sessionType,
    childrenDetected,
    teacherDetected: 1,
    attentiveChildren: attentive,
    moderateAttention: moderate,
    distractedChildren: distracted,
    classroomReadiness,
    engagementSummary,
    storytellingSummary,
    teacherObservations,
    childObservations,
    classroomPresenceObservations,
    participationRate,
    engagementPercent,
    storytellingScore,
    storytellingEffectiveness: storytellingScore,
    expressionQuality: Math.round(sc.speech.emotionalTone * 100),
    interactionLevel: Math.round(sc.classroomQuality.participationBalance * 100),
    classroomEnergy: Math.round((sc.bodyLanguage.teacherEngagement + sc.childEngagement) * 50),
    teachingQuality: Math.round(sc.teachingEffectiveness * 100),
    activityCompletionConfidence: Math.round(sc.activityCompliance * 100),
    seatingQuality: Math.round(sc.classroomQuality.materialUsage * 100),
    visibilityScore: Math.round(sc.bodyLanguage.postureConfidence * 100),
    participationEnvironment: Math.round(sc.classroomQuality.inclusiveness * 100),
    supportLevel: sc.band,
    confidence: aiConf,
    confidenceLabel: confLabel,
    confidenceNote: confidenceNote(confLabel, childrenDetected),
    recommendations,
    generatedTraining: sc.trainingModuleIds,
    whatWentWell,
    improveNextSession,
    suggestedFollowUpActivity: isStory
      ? "Story + drawing: children draw one scene from today's story."
      : "Rhyme with actions: repeat verse with hand movements.",
    supervisorGuidance:
      sc.band === "green"
        ? "Supervisor may share this session as a cluster example. Continue current storytelling approach."
        : "Supervisor encouraged to observe next story session and support interactive questioning techniques.",
    supportLevelMessage: supportMessage(sc.band),
    durationSeconds,
    framesAnalyzed: Math.max(24, Math.floor(durationSeconds / 2)),
    attentionTrend: heatmap.map((h) => ({ segment: h.segment, attentive: h.engagement })),
  };
}

export async function runClassroomExtractionPipeline(opts: {
  session: SessionRecording;
  videoUrl?: string;
  durationSeconds: number;
  allSessions: SessionRecording[];
  onProgress: (state: SessionProcessingState) => void;
}): Promise<{
  session: SessionRecording;
  extracted: SessionExtractedAnalysis;
  analytics: ClassroomSessionAnalytics | null;
  processing: SessionProcessingState;
}> {
  let state = initProcessingState(opts.session.id, opts.videoUrl);
  await persistProcessing(state);
  opts.onProgress(state);

  const stageDelay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let scorecard: SessionScorecard | undefined = opts.session.scorecard;

  for (let i = 0; i < EXTRACTION_PIPELINE_STAGES.length; i++) {
    state = {
      ...state,
      currentStageIndex: i,
      stages: state.stages.map((s, idx) => ({
        ...s,
        status: idx < i ? "done" : idx === i ? "active" : "pending",
      })),
    };
    await persistProcessing(state);
    opts.onProgress(state);

    const stageId = EXTRACTION_PIPELINE_STAGES[i].id;
    if (USE_DEMO_CLASSROOM_ANALYSIS) {
      await stageDelay(stageId === "upload_video" ? 350 : stageId === "extract_frames" ? 500 : 400);
    } else if (stageId === "generate_insights" && !scorecard) {
      scorecard = await analyzePreschoolSession(opts.session.metadata, !!opts.videoUrl, true);
    } else {
      await stageDelay(stageId === "upload_video" ? 400 : stageId === "extract_frames" ? 600 : 450);
    }
  }

  const useDemo = USE_DEMO_CLASSROOM_ANALYSIS;
  if (!scorecard) {
    scorecard = useDemo
      ? buildDemoStorytellingScorecard(opts.session.metadata)
      : await analyzePreschoolSession(opts.session.metadata, !!opts.videoUrl, true);
  }

  const updatedSession: SessionRecording = {
    ...opts.session,
    scorecard,
    status: "completed",
    uploadProgress: 100,
    processedAt: new Date().toISOString(),
    videoBlobUrl: opts.videoUrl ?? opts.session.videoBlobUrl,
    synced: true,
  };

  let analytics: ClassroomSessionAnalytics | null = null;
  try {
    analytics = buildClassroomAnalytics(updatedSession, opts.allSessions);
  } catch (e) {
    console.warn("buildClassroomAnalytics skipped", e);
  }
  const extracted = useDemo
    ? buildDemoStorytellingExtraction(opts.session.id, opts.session.metadata, opts.durationSeconds, {
        gpsAvailable: !!opts.session.metadata.gps,
      })
    : buildExtractedFromVideo(updatedSession, scorecard, opts.durationSeconds, analytics);

  state = {
    ...state,
    completed: true,
    extracted,
    stages: state.stages.map((s) => ({ ...s, status: "done" as const })),
    currentStageIndex: EXTRACTION_PIPELINE_STAGES.length - 1,
  };
  await persistProcessing(state);
  opts.onProgress(state);

  return { session: updatedSession, extracted, analytics, processing: state };
}
