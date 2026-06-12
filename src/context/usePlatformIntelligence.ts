import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityLog, mockCenters } from "@/data/mockData";
import { mockChildProgress, mockSurveys } from "@/data/mockOutcomes";
import {
  ChildProgressRecord,
  BeneficiarySurvey,
  SurveyResponses,
  InterventionRecommendation,
  TimelineEvent,
  SyncQueueItem,
  DemoJourneyId,
} from "@/types/intelligence";
import { ComplaintRecord, FeedbackEntry, ServiceQualityScore } from "@/types/platform";
import { SessionRecording, CoachingAssignment } from "@/types/session";
import { computeCenterServiceQuality, rankDistrictCenters } from "@/services/quality/service-quality-index";
import { generateInterventions } from "@/services/interventions/engine";
import { buildCenterTimeline } from "@/services/timeline/buildTimeline";
import { generateGovernmentStory } from "@/services/story/governmentStory";
import { getPublicTransparency } from "@/services/impact/metrics";
import { computeImpactMetrics } from "@/services/impact/metrics";
import { runScenario, runDemoJourney, listScenarios, ScenarioPayload } from "@/services/demo/scenarioGenerator";
import { summarizeCenterOutcomes } from "@/services/outcomes/analytics";
import { computeChildWellnessIndex, detectChildRiskSignals } from "@/services/outcomes/childWellness";
import { buildMissionControlSnapshot } from "@/services/mission-control/aggregate";
import { InterventionStatus, AnganwadiExcellenceIndex } from "@/types/intelligence";
import { computeAEI } from "@/services/excellence/aei";
import { buildOperationalFlow, applyImprovementEffects } from "@/services/improvement/serviceImprovementEngine";
import { buildVoiceOfCitizenInsights } from "@/services/voice/voiceOfCitizen";
import { buildCenterHealthProfile } from "@/services/health/centerHealth";
import { buildWorkerGrowthProfile } from "@/services/worker/growthProfile";
import { buildHackathonFullFlow } from "@/services/demo/hackathonFlow";
import { OmnichannelInput } from "@/types/feedback-channels";
import { ClassroomSessionAnalytics } from "@/types/classroom-intelligence";
import { classroomCoachingSqiBoost, classroomSessionEvalPenalty } from "@/services/ai/classroom-intelligence";
import {
  idbGet,
  idbPut,
  STORES,
} from "@/lib/storage";

async function loadChildProgress() {
  return idbGet<ChildProgressRecord[]>(STORES.child_progress, "all");
}
async function saveChildProgress(d: ChildProgressRecord[]) {
  await idbPut(STORES.child_progress, "all", d);
}
async function loadSurveys() {
  return idbGet<BeneficiarySurvey[]>(STORES.surveys, "all");
}
async function saveSurveys(d: BeneficiarySurvey[]) {
  await idbPut(STORES.surveys, "all", d);
}
async function loadInterventions() {
  return idbGet<InterventionRecommendation[]>(STORES.interventions, "all");
}
async function saveInterventions(d: InterventionRecommendation[]) {
  await idbPut(STORES.interventions, "all", d);
}

export function usePlatformIntelligence(deps: {
  activities: ActivityLog[];
  feedback: FeedbackEntry[];
  complaints: ComplaintRecord[];
  sessions: SessionRecording[];
  coachingAssignments: CoachingAssignment[];
  trainingRecommendations: { length: number };
  omnichannelInputs: OmnichannelInput[];
  classroomAnalytics: Record<string, ClassroomSessionAnalytics>;
  satisfactionBoostByCenter: Record<string, number>;
  online: boolean;
  setActivities: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  setFeedback: React.Dispatch<React.SetStateAction<FeedbackEntry[]>>;
  setComplaints: React.Dispatch<React.SetStateAction<ComplaintRecord[]>>;
  setSessions: React.Dispatch<React.SetStateAction<SessionRecording[]>>;
  setCoachingAssignments: React.Dispatch<React.SetStateAction<CoachingAssignment[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<import("@/types/platform").PlatformNotification[]>>;
  addNotification: (n: Omit<import("@/types/platform").PlatformNotification, "id" | "createdAt" | "read">) => void;
}) {
  const [childProgress, setChildProgress] = useState<ChildProgressRecord[]>(mockChildProgress);
  const [surveys, setSurveys] = useState<BeneficiarySurvey[]>(mockSurveys);
  const [interventions, setInterventions] = useState<InterventionRecommendation[]>([]);
  const [serviceQualityScores, setServiceQualityScores] = useState<ServiceQualityScore[]>([]);
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [satisfactionBoostByCenter, setSatisfactionBoostByCenter] = useState<Record<string, number>>(
    () => deps.satisfactionBoostByCenter ?? {}
  );

  const refreshServiceQuality = useCallback(() => {
    const scores = rankDistrictCenters(
      mockCenters.map((c) => {
        const penalty = classroomSessionEvalPenalty(c.id, deps.sessions, deps.classroomAnalytics);
        const boost = classroomCoachingSqiBoost(
          c.id,
          deps.classroomAnalytics,
          satisfactionBoostByCenter[c.id]
        );
        return computeCenterServiceQuality(
          c,
          deps.sessions,
          deps.complaints,
          deps.feedback,
          deps.activities,
          surveys,
          { sessionEvalPenalty: penalty, sessionEvalBoost: boost }
        );
      })
    );
    setServiceQualityScores(scores);
    idbPut(STORES.service_quality_scores, "all", scores);
  }, [
    deps.sessions,
    deps.complaints,
    deps.feedback,
    deps.activities,
    deps.classroomAnalytics,
    surveys,
    satisfactionBoostByCenter,
  ]);

  useEffect(() => {
    loadChildProgress().then((l) => { if (l?.length) setChildProgress(l); });
    loadSurveys().then((l) => { if (l?.length) setSurveys(l); });
    loadInterventions().then((l) => { if (l?.length) setInterventions(l); });
  }, []);

  useEffect(() => { saveChildProgress(childProgress); refreshServiceQuality(); }, [childProgress]);
  useEffect(() => { saveSurveys(surveys); refreshServiceQuality(); }, [surveys]);
  useEffect(() => { saveInterventions(interventions); }, [interventions]);

  const addChildProgress = (r: ChildProgressRecord) => setChildProgress((p) => [r, ...p]);

  const submitSurvey = (surveyId: string, responses: SurveyResponses) => {
    setSurveys((p) =>
      p.map((s) =>
        s.id === surveyId ? { ...s, responses, completedAt: new Date().toISOString() } : s
      )
    );
    refreshServiceQuality();
  };

  const scheduleSurvey = (beneficiaryId: string, centerId: string, trigger: BeneficiarySurvey["trigger"]) => {
    const s: BeneficiarySurvey = {
      id: `SVY-${Date.now()}`,
      beneficiaryId,
      centerId,
      trigger,
      createdAt: new Date().toISOString(),
    };
    setSurveys((p) => [s, ...p]);
    return s;
  };

  const refreshInterventions = useCallback(
    (centerId?: string) => {
      const ids = centerId ? [centerId] : mockCenters.map((c) => c.id);
      const all: InterventionRecommendation[] = [];
      ids.forEach((id) => {
        all.push(
          ...generateInterventions(id, {
            sessions: deps.sessions,
            complaints: deps.complaints,
            feedback: deps.feedback,
            childProgress,
            surveys,
          })
        );
      });
      setInterventions(all);
    },
    [deps.sessions, deps.complaints, deps.feedback, childProgress, surveys]
  );

  const getTimeline = (centerId: string, range?: "day" | "week" | "month"): TimelineEvent[] => {
    const all = buildCenterTimeline(centerId, {
      activities: deps.activities,
      feedback: deps.feedback,
      complaints: deps.complaints,
      sessions: deps.sessions,
      childProgress,
      surveys,
      coaching: deps.coachingAssignments,
      interventions,
    });
    if (!range) return all;
    const ms = range === "day" ? 86400_000 : range === "week" ? 7 * 86400_000 : 30 * 86400_000;
    const cut = Date.now() - ms;
    return all.filter((e) => new Date(e.timestamp).getTime() >= cut);
  };

  const syncQueue: SyncQueueItem[] = useMemo(() => {
    const q: SyncQueueItem[] = [];
    deps.sessions
      .filter((s) => !s.synced || s.status === "queued_offline")
      .forEach((s) => {
        q.push({
          id: s.id,
          type: "session",
          label: `Session ${s.id}`,
          status: s.status === "queued_offline" ? "pending" : "uploading",
          progress: s.uploadProgress,
          createdAt: s.createdAt,
        });
      });
    deps.activities.filter((a) => !a.synced).forEach((a) => {
      q.push({
        id: a.id,
        type: "activity",
        label: a.type,
        status: "pending",
        progress: 0,
        createdAt: a.timestamp,
      });
    });
    return q;
  }, [deps.sessions, deps.activities]);

  const governmentStory = useMemo(
    () =>
      generateGovernmentStory({
        activities: deps.activities,
        sessions: deps.sessions,
        complaints: deps.complaints,
        feedback: deps.feedback,
        childProgress,
        serviceQualityScores,
      }),
    [deps.activities, deps.sessions, deps.complaints, deps.feedback, childProgress, serviceQualityScores]
  );

  const impactMetrics = useMemo(
    () =>
      computeImpactMetrics({
        childProgress,
        complaints: deps.complaints,
        feedback: deps.feedback,
        sessions: deps.sessions,
        coaching: deps.coachingAssignments,
        serviceQualityScores,
      }),
    [childProgress, deps.complaints, deps.feedback, deps.sessions, deps.coachingAssignments, serviceQualityScores]
  );

  const publicTransparency = useMemo(
    () =>
      getPublicTransparency({
        activities: deps.activities,
        complaints: deps.complaints,
        feedback: deps.feedback,
        trainingCount: deps.trainingRecommendations.length,
      }),
    [deps.activities, deps.complaints, deps.feedback, deps.trainingRecommendations.length]
  );

  const applyScenarioPayload = (payload: ScenarioPayload) => {
    if (payload.activities.length) deps.setActivities((p) => [...payload.activities, ...p]);
    if (payload.feedback.length) deps.setFeedback((p) => [...payload.feedback, ...p]);
    if (payload.complaints.length) deps.setComplaints((p) => [...payload.complaints, ...p]);
    if (payload.sessions.length) deps.setSessions((p) => [...payload.sessions, ...p]);
    if (payload.childProgress.length) setChildProgress((p) => [...payload.childProgress, ...p]);
    if (payload.surveys.length) setSurveys((p) => [...payload.surveys, ...p]);
    if (payload.coaching.length) deps.setCoachingAssignments((p) => [...payload.coaching, ...p]);
    refreshServiceQuality();
    refreshInterventions();
  };

  const runScenarioById = async (id: string) => {
    const payload = await runScenario(id);
    if (payload) applyScenarioPayload(payload);
    setDemoModeActive(true);
    return payload;
  };

  const runJourney = async (journey: DemoJourneyId) => {
    const payload = await runDemoJourney(journey);
    if (payload && Object.keys(payload).length) applyScenarioPayload(payload as ScenarioPayload);
    setDemoModeActive(true);
    deps.addNotification({
      userId: "demo",
      role: "state_admin",
      channel: "in_app",
      title: "Demo journey active",
      body: `${journey} scenario loaded for hackathon walkthrough`,
    });
  };

  const retrySyncItem = (id: string) => {
    deps.setSessions((p) =>
      p.map((s) => (s.id === id ? { ...s, synced: deps.online, status: "completed" as const, uploadProgress: 100 } : s))
    );
  };

  const getCenterOutcome = (centerId: string) => {
    const c = mockCenters.find((x) => x.id === centerId);
    return c ? summarizeCenterOutcomes(c, childProgress) : null;
  };

  const childWellnessIndexes = useMemo(
    () => mockCenters.map((c) => computeChildWellnessIndex(c, childProgress)),
    [childProgress]
  );

  const childRiskSignals = useMemo(() => {
    const all: import("@/types/intelligence").ChildRiskSignal[] = [];
    mockCenters.forEach((c) => all.push(...detectChildRiskSignals(c, childProgress)));
    return all;
  }, [childProgress]);

  const missionControl = useMemo(
    () =>
      buildMissionControlSnapshot({
        sessions: deps.sessions,
        complaints: deps.complaints,
        feedback: deps.feedback,
        activities: deps.activities,
        interventions,
        serviceQualityScores,
        childWellnessIndexes,
        online: deps.online,
      }),
    [deps.sessions, deps.complaints, deps.feedback, deps.activities, interventions, serviceQualityScores, childWellnessIndexes, deps.online]
  );

  const updateIntervention = (id: string, status: InterventionStatus) => {
    setInterventions((p) => p.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const launchIntervention = (id: string) => updateIntervention(id, "active");

  const aeiCtx = useMemo(
    () => ({
      sessions: deps.sessions,
      complaints: deps.complaints,
      feedback: deps.feedback,
      activities: deps.activities,
      childProgress,
      surveys,
      interventions,
    }),
    [deps.sessions, deps.complaints, deps.feedback, deps.activities, childProgress, surveys, interventions]
  );

  const excellenceIndexes = useMemo(
    () => mockCenters.map((c) => computeAEI(c, { ...aeiCtx, satisfactionBoost: satisfactionBoostByCenter[c.id] ?? 0 })),
    [aeiCtx, satisfactionBoostByCenter]
  );

  const getAEI = (centerId: string): AnganwadiExcellenceIndex | null => {
    const c = mockCenters.find((x) => x.id === centerId);
    if (!c) return null;
    return computeAEI(c, { ...aeiCtx, satisfactionBoost: satisfactionBoostByCenter[centerId] ?? 0 });
  };

  const getCenterHealth = (centerId: string) => {
    const c = mockCenters.find((x) => x.id === centerId);
    const aei = getAEI(centerId);
    if (!c || !aei) return null;
    return buildCenterHealthProfile(c, aei, {
      complaints: deps.complaints,
      feedback: deps.feedback,
      childProgress,
      activities: deps.activities,
      surveys,
      sessions: deps.sessions,
    });
  };

  const voiceOfCitizen = useMemo(
    () =>
      buildVoiceOfCitizenInsights({
        feedback: deps.feedback,
        complaints: deps.complaints,
        omnichannel: deps.omnichannelInputs,
        surveys,
      }),
    [deps.feedback, deps.complaints, deps.omnichannelInputs, surveys]
  );

  const platformOutcomes = useMemo(() => {
    const aeiAvg = excellenceIndexes.length ? Math.round(excellenceIndexes.reduce((a, x) => a + x.score, 0) / excellenceIndexes.length) : 72;
    const sqiAvg = serviceQualityScores.length ? Math.round(serviceQualityScores.reduce((a, s) => a + s.overallIndex, 0) / serviceQualityScores.length) : 78;
    const cwiAvg = childWellnessIndexes.length ? Math.round(childWellnessIndexes.reduce((a, w) => a + w.cwiScore, 0) / childWellnessIndexes.length) : 74;
    const closed = deps.complaints.filter((c) => c.status === "closed").length;
    const total = deps.complaints.length || 1;
    const imp = computeImpactMetrics({
      childProgress,
      complaints: deps.complaints,
      feedback: deps.feedback,
      sessions: deps.sessions,
      coaching: deps.coachingAssignments,
      serviceQualityScores,
    });
    return {
      aeiAvg,
      sqiAvg,
      cwiAvg,
      beneficiarySatisfactionIndex: imp.after.satisfaction,
      interventionSuccessRate: imp.interventionSuccessRate,
      workerImprovementRate: Math.min(100, imp.workersImprovedPostCoaching * 8),
      complaintClosureRate: Math.round((closed / total) * 100),
      trustScore: Math.round((aeiAvg + imp.after.satisfaction) / 2),
    };
  }, [excellenceIndexes, serviceQualityScores, childWellnessIndexes, deps.complaints, deps.feedback, deps.sessions, deps.coachingAssignments, childProgress]);

  const getOperationalFlow = (centerId: string) =>
    buildOperationalFlow(centerId, {
      sessions: deps.sessions,
      activities: deps.activities,
      feedback: deps.feedback,
      complaints: deps.complaints,
      coaching: deps.coachingAssignments,
      childProgress,
      interventions,
    });

  const getWorkerGrowth = (workerId: string, workerName: string, centerId: string) =>
    buildWorkerGrowthProfile(workerId, workerName, centerId, {
      sessions: deps.sessions,
      coaching: deps.coachingAssignments,
      interventions,
    });

  const applyServiceImprovement = (centerId: string, trigger: "complaint_closed" | "survey_positive" | "coaching_completed" | "session_green" | "center_recovery") => {
    const c = mockCenters.find((x) => x.id === centerId);
    if (!c) return null;
    const result = applyImprovementEffects({
      center: c,
      trigger,
      ...aeiCtx,
      satisfactionBoost: satisfactionBoostByCenter[centerId] ?? 0,
    });
    setSatisfactionBoostByCenter((p) => ({
      ...p,
      [centerId]: (p[centerId] ?? 0) + (trigger === "complaint_closed" ? 5 : trigger === "coaching_completed" ? 6 : 3),
    }));
    refreshServiceQuality();
    refreshInterventions();
    deps.addNotification({
      userId: "system",
      role: "state_admin",
      channel: "in_app",
      title: "Service improvement loop",
      body: result.message,
    });
    return result;
  };

  const runHackathonFlow = async () => {
    const payload = await buildHackathonFullFlow();
    applyScenarioPayload(payload);
    setSatisfactionBoostByCenter({ "AWC-TPT-01": 8 });
    applyServiceImprovement("AWC-TPT-01", "center_recovery");
    setDemoModeActive(true);
    return payload;
  };

  return {
    childProgress,
    addChildProgress,
    surveys,
    submitSurvey,
    scheduleSurvey,
    interventions,
    refreshInterventions,
    setInterventions,
    serviceQualityScores,
    refreshServiceQuality,
    getTimeline,
    syncQueue,
    governmentStory,
    impactMetrics,
    publicTransparency,
    demoModeActive,
    setDemoModeActive,
    runScenarioById,
    runJourney,
    listScenarios,
    applyScenarioPayload,
    retrySyncItem,
    getCenterOutcome,
    childWellnessIndexes,
    childRiskSignals,
    missionControl,
    updateIntervention,
    launchIntervention,
    excellenceIndexes,
    getAEI,
    getCenterHealth,
    voiceOfCitizen,
    platformOutcomes,
    getOperationalFlow,
    getWorkerGrowth,
    applyServiceImprovement,
    runHackathonFlow,
  };
}
