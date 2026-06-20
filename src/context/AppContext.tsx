import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { translations, TKey } from "@/lib/i18n";
import { mockActivities, ActivityLog } from "@/data/mockData";
import { Role } from "@/types/platform";
import { mockComplaints, mockFeedback, mockPlatformNotifications } from "@/data/mockGrievances";
import { mergeDemoGrievances } from "@/data/demoGrievances";
import { mockSessionRecordings } from "@/data/mockSessions";
import {
  AppUser,
  ComplaintRecord,
  ComplaintStatus,
  FeedbackEntry,
  FeedbackChannel,
  Lang,
  PlatformNotification,
  ServiceQualityScore,
} from "@/types/platform";
import { SessionRecording, TrainingRecommendation, CoachingAssignment, SessionMetadata } from "@/types/session";
import { OmnichannelInput } from "@/types/feedback-channels";
import {
  ChildProgressRecord,
  BeneficiarySurvey,
  SurveyResponses,
  InterventionRecommendation,
  TimelineEvent,
  SyncQueueItem,
  GovernmentStoryInsight,
  ImpactMetrics,
  PublicTransparencyMetrics,
  DemoJourneyId,
} from "@/types/intelligence";
import { DemoScenarioId } from "@/types/intelligence";
import { ScenarioPayload } from "@/services/demo/scenarioGenerator";
import { authenticate, loadStoredUser, persistUser } from "@/services/auth/session";
import { processFeedbackWithAI } from "@/services/ai";
import { analyzePublicGrievance, classifyGrievance } from "@/services/ai/grievance-engine";
import { generateInvestigationReport } from "@/services/ai/investigation-engine";
import { PublicGrievancePriority } from "@/types/grievance";
import { analyzePreschoolSession } from "@/services/ai/session-analysis";
import { processChannelIntake, ChannelIntakePayload } from "@/services/feedback/intake";
import { applyEscalationRule } from "@/services/escalation/workflow";
import { usePlatformIntelligence } from "@/context/usePlatformIntelligence";
import {
  backfillClassroomAnalytics,
  publishClassroomIntelligence,
  buildOperationalSnapshot,
  buildExecutiveSnapshot,
  compareClassroomSessions,
} from "@/services/ai/classroom-intelligence";
import {
  ClassroomSessionAnalytics,
  ClassroomSupervisorReview,
  SessionComparisonResult,
  OperationalClassroomSnapshot,
  ExecutiveClassroomSnapshot,
} from "@/types/classroom-intelligence";
import {
  loadActivities,
  saveActivities,
  loadComplaints,
  saveComplaints,
  loadFeedback,
  saveFeedback,
  loadCitizenExperiences,
  saveCitizenExperiences,
  loadNotifications,
  saveNotifications,
  loadSessions,
  saveSessions,
  loadClassroomIntel,
  saveClassroomIntel,
  loadCoaching,
  saveCoaching,
  loadTrainingRecs,
  saveTrainingRecs,
  loadOmnichannel,
  saveOmnichannel,
  storageKeys,
  lsSet,
} from "@/lib/storage";
import { CitizenExperienceRecord, ExperienceType } from "@/types/citizen-experience";
import { PublicFeedbackSubmitterType } from "@/types/public-context";
import { PublicEvidenceItem } from "@/types/public-request";
import { analyzeShareExperience } from "@/services/public/experienceAnalysis";
import { ComplaintCategory } from "@/types/platform";

export type { AppUser as User };

interface AppCtx {
  user: AppUser | null;
  login: (role: Role, credentials?: { phone?: string; password?: string }) => Promise<void>;
  logout: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  online: boolean;
  toggleOnline: () => void;
  lastSync: Date;
  setLastSync: (d: Date) => void;
  activities: ActivityLog[];
  addActivity: (a: ActivityLog) => void;
  updateActivity: (id: string, updates: Partial<ActivityLog>) => void;
  removeActivity: (id: string) => void;
  feedback: FeedbackEntry[];
  citizenExperiences: CitizenExperienceRecord[];
  submitFeedback: (entry: Omit<FeedbackEntry, "id" | "timestamp" | "sentiment" | "sentimentScore" | "category" | "urgencyScore" | "isComplaint" | "translatedText" | "aiSummary" | "sourceChannel" | "confidence">) => Promise<FeedbackEntry>;
  submitShareExperience: (input: {
    beneficiaryId: string;
    beneficiaryName: string;
    centerId: string;
    centerName: string;
    submittedAs: PublicFeedbackSubmitterType;
    category: string;
    experienceType: ExperienceType;
    rating: number;
    text: string;
    evidence: PublicEvidenceItem[];
    lang: Lang;
  }) => Promise<CitizenExperienceRecord>;
  submitReportIssue: (input: {
    beneficiaryId: string;
    beneficiaryName: string;
    centerId: string;
    centerName: string;
    submittedAs: PublicFeedbackSubmitterType;
    issueCategoryLabel: string;
    complaintCategory: ComplaintCategory;
    priority: PublicGrievancePriority;
    resolutionPreference: string;
    text: string;
    evidence: PublicEvidenceItem[];
    consent: boolean;
    anonymous: boolean;
    aiAnalysis: import("@/types/grievance").GrievanceAIAnalysis;
    lang: Lang;
  }) => Promise<ComplaintRecord>;
  submitPublicGrievance: (input: import("@/components/beneficiary/SubmitGrievanceForm").PublicGrievancePayload) => Promise<ComplaintRecord>;
  submitOmnichannel: (payload: ChannelIntakePayload) => Promise<FeedbackEntry>;
  complaints: ComplaintRecord[];
  updateComplaint: (id: string, updates: Partial<ComplaintRecord>) => void;
  advanceComplaint: (id: string, next: ComplaintStatus, extra?: Partial<ComplaintRecord>) => void;
  addGrievanceAction: (
    complaintId: string,
    action: Omit<import("@/types/public-request").GrievanceAction, "id">
  ) => void;
  escalatePublicGrievance: (complaintId: string, reason?: string) => void;
  notifications: PlatformNotification[];
  addNotification: (n: Omit<PlatformNotification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  sessions: SessionRecording[];
  addSession: (s: SessionRecording) => void;
  updateSession: (id: string, updates: Partial<SessionRecording>) => void;
  processSessionUpload: (
    id: string,
    videoUrl?: string,
    existingScorecard?: import("@/types/session").SessionScorecard,
    sessionOverride?: SessionRecording
  ) => Promise<SessionRecording | null>;
  trainingRecommendations: TrainingRecommendation[];
  updateTrainingRecommendation: (id: string, updates: Partial<TrainingRecommendation>) => void;
  coachingAssignments: CoachingAssignment[];
  assignCoaching: (assignment: Omit<CoachingAssignment, "id" | "createdAt" | "status">) => void;
  omnichannelInputs: OmnichannelInput[];
  serviceQualityScores: ServiceQualityScore[];
  refreshServiceQuality: () => void;
  workerRedFlagCount: (workerId: string) => number;
  childProgress: ChildProgressRecord[];
  addChildProgress: (r: ChildProgressRecord) => void;
  surveys: BeneficiarySurvey[];
  submitSurvey: (surveyId: string, responses: SurveyResponses) => void;
  scheduleSurvey: (beneficiaryId: string, centerId: string, trigger: BeneficiarySurvey["trigger"]) => BeneficiarySurvey;
  interventions: InterventionRecommendation[];
  refreshInterventions: (centerId?: string) => void;
  updateIntervention: (id: string, status: import("@/types/intelligence").InterventionStatus) => void;
  launchIntervention: (id: string) => void;
  childWellnessIndexes: import("@/types/intelligence").ChildWellnessIndex[];
  childRiskSignals: import("@/types/intelligence").ChildRiskSignal[];
  missionControl: import("@/types/intelligence").MissionControlSnapshot;
  getTimeline: (centerId: string, range?: "day" | "week" | "month") => TimelineEvent[];
  syncQueue: SyncQueueItem[];
  retrySyncItem: (id: string) => void;
  governmentStory: GovernmentStoryInsight[];
  impactMetrics: ImpactMetrics;
  publicTransparency: PublicTransparencyMetrics;
  demoModeActive: boolean;
  setDemoModeActive: (v: boolean) => void;
  runScenarioById: (id: string) => Promise<ScenarioPayload | null>;
  runJourney: (journey: DemoJourneyId) => Promise<void>;
  listScenarios: () => DemoScenarioId[];
  getCenterOutcome: (centerId: string) => import("@/types/intelligence").CenterOutcomeSummary | null;
  excellenceIndexes: import("@/types/intelligence").AnganwadiExcellenceIndex[];
  getAEI: (centerId: string) => import("@/types/intelligence").AnganwadiExcellenceIndex | null;
  getCenterHealth: (centerId: string) => import("@/types/intelligence").CenterHealthProfile | null;
  voiceOfCitizen: import("@/types/intelligence").VoiceOfCitizenInsights;
  platformOutcomes: import("@/types/intelligence").PlatformOutcomeMetrics;
  getOperationalFlow: (centerId: string) => import("@/types/intelligence").OperationalFlowStep[];
  getWorkerGrowth: (workerId: string, workerName: string, centerId: string) => import("@/types/intelligence").WorkerGrowthProfile;
  applyServiceImprovement: (centerId: string, trigger: "complaint_closed" | "survey_positive" | "coaching_completed" | "session_green" | "center_recovery") => { message: string; delta: number } | null;
  runHackathonFlow: () => Promise<ScenarioPayload>;
  classroomAnalytics: Record<string, ClassroomSessionAnalytics>;
  classroomReviews: Record<string, ClassroomSupervisorReview>;
  getClassroomAnalytics: (sessionId: string) => ClassroomSessionAnalytics | null;
  getOperationalClassroom: (district?: string) => OperationalClassroomSnapshot;
  getExecutiveClassroom: () => ExecutiveClassroomSnapshot;
  saveSupervisorReview: (review: Omit<ClassroomSupervisorReview, "updatedAt">) => void;
  compareSessions: (beforeId: string, afterId: string) => SessionComparisonResult | null;
  refreshClassroomIntel: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

function createComplaintFromText(
  entry: {
    beneficiaryId: string;
    beneficiaryName: string;
    centerId: string;
    centerName: string;
    district: string;
    text: string;
    rating: number;
    submittedAs?: ComplaintRecord["submittedAs"];
    priority?: string;
    citizenEvidence?: ComplaintRecord["citizenEvidence"];
    citizenPriority?: PublicGrievancePriority;
    lang?: import("@/types/platform").Lang;
    consentGiven?: boolean;
    aiAnalysis?: import("@/types/grievance").GrievanceAIAnalysis;
    customTitle?: string;
    customCategory?: ComplaintCategory;
    village?: string;
    mandal?: string;
    registeredMobile?: string;
    anonymous?: boolean;
    grievanceId?: string;
  },
  channel: FeedbackChannel,
  feedbackId: string
): ComplaintRecord {
  const g = classifyGrievance(entry.text, entry.rating, channel);
  const category = entry.customCategory ?? g.category;
  const ai = entry.aiAnalysis ?? analyzePublicGrievance(entry.text, entry.rating, channel, entry.lang ?? "en");
  const slaDue = new Date(Date.now() + g.slaHours * 3600_000).toISOString();
  const evidence = entry.citizenEvidence ?? [];
  const actions = [
    {
      id: `GA-${Date.now()}`,
      ownerRole: "beneficiary" as const,
      officerName: entry.beneficiaryName,
      notes: "Citizen submission received — complete context provided for supervisor review",
      timestamp: new Date().toISOString(),
    },
  ];
  const id = entry.grievanceId ?? `GRV-${Date.now().toString().slice(-6)}`;
  const draft: ComplaintRecord = {
    id,
    feedbackId,
    beneficiaryId: entry.beneficiaryId,
    beneficiaryName: entry.anonymous ? "Anonymous Citizen" : entry.beneficiaryName,
    registeredMobile: entry.anonymous ? undefined : entry.registeredMobile,
    village: entry.village,
    mandal: entry.mandal,
    anonymous: entry.anonymous,
    centerId: entry.centerId,
    centerName: entry.centerName,
    district: entry.district,
    category,
    title: entry.customTitle ?? `Grievance: ${category.replace(/_/g, " ")}`,
    description: entry.text,
    status: "ai_processing",
    urgencyScore: g.urgencyScore,
    sentiment: entry.rating <= 2 ? "negative" : "neutral",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDueAt: slaDue,
    sourceChannel: channel,
    severity: g.severity,
    routingPath: g.routingPath,
    slaHours: g.slaHours,
    aiClassification: { category, urgency: g.urgencyScore, summary: g.summary },
    submittedAs: entry.submittedAs,
    priority: entry.priority ?? entry.citizenPriority,
    citizenEvidence: evidence,
    grievanceActions: actions,
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar · Supervisor",
      evidence,
      aiAnalysis: ai,
      actions,
      consentGiven: entry.consentGiven ?? true,
      citizenPriority: entry.citizenPriority,
    },
  };
  return { ...draft, investigationReport: generateInvestigationReport(draft) };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => loadStoredUser());
  const [lang, setLangState] = useState<Lang>(() => {
    const u = loadStoredUser();
    if (u?.languagePreference && ["en", "te", "hi"].includes(u.languagePreference)) {
      return u.languagePreference;
    }
    const stored = localStorage.getItem(storageKeys.lang) ?? localStorage.getItem("awai.lang");
    return (stored === "te" || stored === "hi" || stored === "en" ? stored : "en") as Lang;
  });
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(mockFeedback);
  const [citizenExperiences, setCitizenExperiences] = useState<CitizenExperienceRecord[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(() => mergeDemoGrievances(mockComplaints));
  const [notifications, setNotifications] = useState<PlatformNotification[]>(mockPlatformNotifications);
  const [sessions, setSessions] = useState<SessionRecording[]>(mockSessionRecordings);
  const [trainingRecommendations, setTrainingRecommendations] = useState<TrainingRecommendation[]>([]);
  const [coachingAssignments, setCoachingAssignments] = useState<CoachingAssignment[]>([]);
  const [omnichannelInputs, setOmnichannelInputs] = useState<OmnichannelInput[]>([]);
  const [classroomAnalytics, setClassroomAnalytics] = useState<Record<string, ClassroomSessionAnalytics>>({});
  const [classroomReviews, setClassroomReviews] = useState<Record<string, ClassroomSupervisorReview>>({});
  const [satisfactionBoostByCenter, setSatisfactionBoostByCenter] = useState<Record<string, number>>({});

  const persistClassroomBundle = useCallback(
    (analytics: Record<string, ClassroomSessionAnalytics>, reviews: Record<string, ClassroomSupervisorReview>) => {
      saveClassroomIntel({ analytics, reviews });
    },
    []
  );

  const refreshClassroomIntel = useCallback(() => {
    setClassroomAnalytics((prev) => {
      const next = { ...prev, ...backfillClassroomAnalytics(sessions) };
      persistClassroomBundle(next, classroomReviews);
      return next;
    });
  }, [sessions, classroomReviews, persistClassroomBundle]);

  useEffect(() => {
    loadActivities().then((l) => { if (l?.length) setActivities(l); });
    loadFeedback().then((l) => { if (l?.length) setFeedback(l); });
    loadCitizenExperiences().then((l) => { if (l?.length) setCitizenExperiences(l); });
    loadComplaints().then((l) => {
      setComplaints(mergeDemoGrievances(l?.length ? l : mockComplaints));
    });
    loadNotifications().then((l) => { if (l?.length) setNotifications(l); });
    loadSessions().then((l) => { if (l?.length) setSessions(l); });
    loadCoaching().then((l) => { if (l?.length) setCoachingAssignments(l); });
    loadTrainingRecs().then((l) => { if (l?.length) setTrainingRecommendations(l); });
    loadOmnichannel().then((l) => { if (l?.length) setOmnichannelInputs(l); });
    loadClassroomIntel().then((b) => {
      if (b?.analytics) setClassroomAnalytics(b.analytics);
      if (b?.reviews) setClassroomReviews(b.reviews);
    });
  }, []);

  useEffect(() => {
    if (sessions.length) {
      setClassroomAnalytics((prev) => {
        const merged = { ...backfillClassroomAnalytics(sessions), ...prev };
        Object.keys(merged).forEach((id) => {
          if (!sessions.find((s) => s.id === id && s.scorecard)) delete merged[id];
        });
        sessions.filter((s) => s.scorecard).forEach((s) => {
          if (!merged[s.id]) {
            const a = publishClassroomIntelligence(s, sessions);
            if (a) merged[s.id] = a;
          }
        });
        saveClassroomIntel({ analytics: merged, reviews: classroomReviews });
        return merged;
      });
    }
  }, [sessions.length]);

  useEffect(() => { persistUser(user); }, [user]);
  useEffect(() => { lsSet(storageKeys.lang, lang); localStorage.setItem("awai.lang", lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { saveActivities(activities); }, [activities]);
  useEffect(() => { saveFeedback(feedback); }, [feedback]);
  useEffect(() => { saveCitizenExperiences(citizenExperiences); }, [citizenExperiences]);
  useEffect(() => { saveComplaints(complaints); }, [complaints]);
  useEffect(() => { saveNotifications(notifications); }, [notifications]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { saveCoaching(coachingAssignments); }, [coachingAssignments]);
  useEffect(() => { saveTrainingRecs(trainingRecommendations); }, [trainingRecommendations]);
  useEffect(() => { saveOmnichannel(omnichannelInputs); }, [omnichannelInputs]);

  const login = useCallback(async (role: Role, credentials?: { phone?: string; password?: string }) => {
    const u = await authenticate(role, credentials);
    const stored = localStorage.getItem(storageKeys.lang) ?? localStorage.getItem("awai.lang");
    const preferred = (stored === "te" || stored === "hi" || stored === "en" ? stored : u.languagePreference ?? "en") as Lang;
    setLangState(preferred);
    lsSet(storageKeys.lang, preferred);
    localStorage.setItem("awai.lang", preferred);
    setUser({ ...u, languagePreference: preferred });
  }, []);

  const logout = () => {
    setUser(null);
    setLangState("en");
    lsSet(storageKeys.lang, "en");
    localStorage.setItem("awai.lang", "en");
  };
  const setLang = (l: Lang) => { setLangState(l); if (user) setUser({ ...user, languagePreference: l }); };
  const t = (k: TKey) => translations[lang]?.[k] ?? translations.en[k] ?? String(k);
  const toggleOnline = () => setOnline((p) => { const n = !p; if (n) setLastSync(new Date()); return n; });

  const addActivity = (a: ActivityLog) => setActivities((p) => [a, ...p]);
  const updateActivity = (id: string, u: Partial<ActivityLog>) => setActivities((p) => p.map((a) => (a.id === id ? { ...a, ...u } : a)));
  const removeActivity = (id: string) => setActivities((p) => p.filter((a) => a.id !== id));

  const addNotification = (n: Omit<PlatformNotification, "id" | "createdAt" | "read">) => {
    setNotifications((p) => [{ ...n, id: `N-${crypto.randomUUID().slice(0, 8)}`, createdAt: new Date().toISOString(), read: false }, ...p]);
  };
  const markNotificationRead = (id: string) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const platform = usePlatformIntelligence({
    activities,
    feedback,
    complaints,
    sessions,
    coachingAssignments,
    trainingRecommendations,
    omnichannelInputs,
    classroomAnalytics,
    satisfactionBoostByCenter,
    online,
    setActivities,
    setFeedback,
    setComplaints,
    setSessions,
    setCoachingAssignments,
    setNotifications,
    addNotification,
  });

  const registerComplaint = (complaint: ComplaintRecord, beneficiaryId: string) => {
    setComplaints((p) => [complaint, ...p]);
    setTimeout(() => {
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id !== complaint.id) return c;
          const aiAction = {
            id: `GA-${Date.now()}-ai`,
            ownerRole: "system" as const,
            officerName: "AI Grievance Engine",
            notes: `AI reviewed: ${c.grievance?.aiAnalysis?.issueClassification?.replace(/_/g, " ") ?? c.category} · ${Math.round((c.grievance?.aiAnalysis?.confidence ?? 0.88) * 100)}% confidence`,
            timestamp: new Date().toISOString(),
          };
          const supAction = {
            id: `GA-${Date.now()}-sup`,
            ownerRole: "supervisor" as const,
            officerName: c.supervisorName ?? "Supervisor · Tirupati",
            notes: "Queued for supervisor investigation — public grievance (no worker routing)",
            timestamp: new Date().toISOString(),
          };
          const actions = [...(c.grievanceActions ?? []), aiAction, supAction];
          return {
            ...c,
            status: "classified" as ComplaintStatus,
            grievanceActions: actions,
            grievance: c.grievance
              ? { ...c.grievance, actions, ownerRole: "supervisor" as const }
              : c.grievance,
          };
        })
      );
    }, 1200);
    addNotification({
      userId: beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title: "Grievance under supervisor review",
      body: `Your grievance ${complaint.id} is with the supervisor. Track evidence and actions in My Requests.`,
      actionUrl: `/beneficiary/request/${complaint.id}`,
    });
    addNotification({
      userId: "SUP-TPT-01",
      role: "supervisor",
      channel: "in_app",
      title: "New public grievance",
      body: `${complaint.title} — ${complaint.beneficiaryName} · AI severity ${complaint.severity ?? "medium"}`,
      actionUrl: `/supervisor/grievance/${complaint.id}`,
    });
  };

  const submitShareExperience = async (input: {
    beneficiaryId: string;
    beneficiaryName: string;
    centerId: string;
    centerName: string;
    submittedAs: PublicFeedbackSubmitterType;
    category: string;
    experienceType: ExperienceType;
    rating: number;
    text: string;
    evidence: PublicEvidenceItem[];
    lang: Lang;
  }): Promise<CitizenExperienceRecord> => {
    const analysis = await analyzeShareExperience(input.text, input.rating, input.lang, input.category);
    const fbId = `FB-${Date.now()}`;
    const expId = `EXP-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();
    const status =
      analysis.sentiment === "positive" && input.rating >= 4
        ? ("included_in_improvement" as const)
        : ("acknowledged" as const);

    const fullFb: FeedbackEntry = {
      beneficiaryId: input.beneficiaryId,
      beneficiaryName: input.beneficiaryName,
      centerId: input.centerId,
      centerName: input.centerName,
      text: input.text,
      rating: input.rating,
      lang: input.lang,
      id: fbId,
      timestamp,
      translatedText: analysis.translatedText,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.satisfactionScore / 100,
      category: input.category.toLowerCase().replace(/\s+/g, "_"),
      urgencyScore: 0.1,
      isComplaint: false,
      aiSummary: analysis.aiSummary,
      sourceChannel: "mobile_app",
      confidence: 0.9,
      feedbackContext: {
        submittedAs: input.submittedAs,
        category: input.category,
        channel: "mobile_app",
        grievance: false,
      },
      imageUrl: input.evidence.find((e) => e.type === "photo")?.url,
      voiceTranscript: input.evidence.find((e) => e.type === "voice")?.text,
    };
    setFeedback((p) => [fullFb, ...p]);

    const record: CitizenExperienceRecord = {
      id: expId,
      beneficiaryId: input.beneficiaryId,
      beneficiaryName: input.beneficiaryName,
      centerId: input.centerId,
      centerName: input.centerName,
      submittedAs: input.submittedAs,
      category: input.category,
      experienceType: input.experienceType,
      rating: input.rating,
      text: input.text,
      evidence: input.evidence,
      sentiment: analysis.sentiment,
      satisfactionScore: analysis.satisfactionScore,
      aiSummary: analysis.aiSummary,
      suggestedImprovements: [analysis.suggestedImprovements],
      detectedLanguage: analysis.detectedLanguage,
      status,
      timestamp,
      sourceChannel: "mobile_app",
      feedbackId: fbId,
    };
    setCitizenExperiences((p) => [record, ...p]);

    addNotification({
      userId: input.beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title: "Thank you for sharing your experience",
      body:
        status === "included_in_improvement"
          ? "Your suggestion improved center services and is included in service improvement planning."
          : "Your experience was recorded for Center Trust Score and public insights — no grievance was created.",
      actionUrl: `/public/experience/${expId}`,
    });
    return record;
  };

  const submitReportIssue = async (input: {
    beneficiaryId: string;
    beneficiaryName: string;
    centerId: string;
    centerName: string;
    submittedAs: PublicFeedbackSubmitterType;
    issueCategoryLabel: string;
    complaintCategory: ComplaintCategory;
    priority: PublicGrievancePriority;
    resolutionPreference: string;
    text: string;
    evidence: PublicEvidenceItem[];
    consent: boolean;
    anonymous: boolean;
    aiAnalysis: import("@/types/grievance").GrievanceAIAnalysis;
    lang: Lang;
  }): Promise<ComplaintRecord> => {
    const rating =
      input.priority === "critical" ? 1 : input.priority === "high" ? 2 : input.priority === "medium" ? 3 : 4;
    const fullText = `[${input.issueCategoryLabel}] [${input.resolutionPreference}] ${input.text}`;
    const fbId = `FB-${Date.now()}`;
    const ai = await processFeedbackWithAI(fullText, rating, input.lang);
    const g = classifyGrievance(ai.translatedText ?? fullText, rating, "mobile_app");
    const timestamp = new Date().toISOString();
    const full: FeedbackEntry = {
      beneficiaryId: input.beneficiaryId,
      beneficiaryName: input.anonymous ? "Anonymous Citizen" : input.beneficiaryName,
      centerId: input.centerId,
      centerName: input.centerName,
      text: fullText,
      rating,
      lang: input.lang,
      id: fbId,
      timestamp,
      translatedText: ai.translatedText,
      sentiment: ai.sentiment.label,
      sentimentScore: ai.sentiment.score,
      category: input.complaintCategory,
      urgencyScore: g.urgencyScore,
      isComplaint: true,
      aiSummary: input.aiAnalysis.summary,
      sourceChannel: "mobile_app",
      confidence: input.aiAnalysis.confidence,
      feedbackContext: {
        submittedAs: input.submittedAs,
        category: input.issueCategoryLabel,
        channel: "mobile_app",
        grievance: true,
      },
    };
    setFeedback((p) => [full, ...p]);
    const cmp = createComplaintFromText(
      {
        beneficiaryId: input.beneficiaryId,
        beneficiaryName: full.beneficiaryName,
        centerId: input.centerId,
        centerName: input.centerName,
        district: "Tirupati",
        text: fullText,
        rating,
        submittedAs: input.submittedAs,
        priority: input.issueCategoryLabel,
        citizenEvidence: input.evidence,
        citizenPriority: input.priority,
        consentGiven: input.consent,
        aiAnalysis: input.aiAnalysis,
        lang: input.lang,
      },
      "mobile_app",
      fbId
    );
    full.complaintId = cmp.id;
    registerComplaint(cmp, input.beneficiaryId);
    if (user?.role === "beneficiary") {
      setUser({ ...user, complaintCount: (user.complaintCount ?? 0) + 1 });
    }
    addNotification({
      userId: input.beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title: "Your issue is under supervisor review",
      body: `Grievance ${cmp.id} — AI analysis complete. Track resolution and uploaded proof in My Requests.`,
      actionUrl: `/beneficiary/request/${cmp.id}`,
    });
    return cmp;
  };

  const submitPublicGrievance = async (
    input: import("@/components/beneficiary/SubmitGrievanceForm").PublicGrievancePayload
  ): Promise<ComplaintRecord> => {
    const rating = input.priority === "critical" ? 1 : input.priority === "high" ? 2 : input.priority === "medium" ? 3 : 4;
    const fullText = input.description;
    const fbId = `FB-${Date.now()}`;
    const beneficiaryId = input.anonymous
      ? `PUB-ANON-${Date.now().toString().slice(-6)}`
      : user?.id ?? `PUB-${input.registeredMobile.slice(-4)}`;
    const beneficiaryName = input.anonymous
      ? "Anonymous Citizen"
      : input.beneficiaryName.trim() || `Citizen · ${input.registeredMobile}`;
    const ai = analyzePublicGrievance(fullText, rating, "mobile_app", lang);
    const evidence = [...input.evidence];
    const cmp = createComplaintFromText(
      {
        beneficiaryId,
        beneficiaryName,
        centerId: input.centerId,
        centerName: input.centerName,
        district: input.district,
        text: fullText,
        rating,
        submittedAs: input.submittedAs,
        priority: input.priority,
        citizenEvidence: evidence,
        citizenPriority: input.priority,
        consentGiven: input.consent,
        aiAnalysis: ai,
        customTitle: input.title,
        customCategory: input.category,
        village: input.village,
        mandal: input.mandal,
        registeredMobile: input.anonymous ? undefined : input.registeredMobile,
        anonymous: input.anonymous,
        lang,
      },
      "mobile_app",
      fbId
    );
    registerComplaint(cmp, beneficiaryId);
    addNotification({
      userId: beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title: "Grievance submitted successfully",
      body: `${cmp.id} — Assigned for AI Verification and Supervisor Investigation. Expected resolution: 48 hours.`,
      actionUrl: `/beneficiary/track-grievance`,
    });
    addNotification({
      userId: "SUP-TPT-01",
      role: "supervisor",
      channel: "in_app",
      title: "New public grievance",
      body: `${cmp.id} — ${input.title} · ${input.category.replace(/_/g, " ")}`,
      actionUrl: `/supervisor/grievance/${cmp.id}`,
    });
    return cmp;
  };

  const submitFeedback = async (
    entry: Omit<FeedbackEntry, "id" | "timestamp" | "sentiment" | "sentimentScore" | "category" | "urgencyScore" | "isComplaint" | "translatedText" | "aiSummary" | "sourceChannel" | "confidence"> & {
      grievanceBundle?: {
        evidence: import("@/types/public-request").PublicEvidenceItem[];
        aiAnalysis: import("@/types/grievance").GrievanceAIAnalysis;
        priority: import("@/types/grievance").PublicGrievancePriority;
        consent: boolean;
        issueCategory: ComplaintCategory;
      };
    }
  ) => {
    const ai = await processFeedbackWithAI(entry.text, entry.rating, entry.lang);
    const g = classifyGrievance(ai.translatedText ?? entry.text, entry.rating, "mobile_app");
    const id = `FB-${Date.now()}`;
    const full: FeedbackEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
      translatedText: ai.translatedText,
      sentiment: ai.sentiment.label,
      sentimentScore: ai.sentiment.score,
      category: g.category,
      urgencyScore: g.urgencyScore,
      isComplaint: !!entry.grievanceBundle || ai.classification.isComplaint || g.severity === "critical" || g.severity === "high",
      aiSummary: g.summary,
      sourceChannel: "mobile_app",
      confidence: 0.88,
      feedbackContext: entry.feedbackContext,
    };
    setFeedback((p) => [full, ...p]);
    if (full.isComplaint || entry.grievanceBundle) {
      const bundle = entry.grievanceBundle;
      const evidence =
        bundle?.evidence ??
        (entry.imageUrl
          ? [
              {
                id: `ev-${id}`,
                type: "photo" as const,
                url: entry.imageUrl,
                label: "Citizen upload",
                uploadedAt: full.timestamp,
              },
            ]
          : []);
      if (entry.voiceTranscript) {
        evidence.push({
          id: `ev-voice-${id}`,
          type: "voice",
          text: entry.voiceTranscript,
          label: "Voice transcript",
          uploadedAt: full.timestamp,
        });
      }
      const cmp = createComplaintFromText(
        {
          ...entry,
          district: "Tirupati",
          text: entry.text,
          submittedAs: entry.feedbackContext?.submittedAs,
          priority: entry.feedbackContext?.category,
          citizenEvidence: evidence,
          citizenPriority: bundle?.priority,
          consentGiven: bundle?.consent ?? true,
          aiAnalysis: bundle?.aiAnalysis,
          lang: entry.lang,
        },
        "mobile_app",
        id
      );
      full.complaintId = cmp.id;
      registerComplaint(cmp, entry.beneficiaryId);
    }
    if (user?.role === "beneficiary" && full.isComplaint) {
      setUser({ ...user, complaintCount: (user.complaintCount ?? 0) + 1 });
    }
    return full;
  };

  const submitOmnichannel = async (payload: ChannelIntakePayload) => {
    const { input, normalizedText, category, urgencyBoost } = await processChannelIntake(payload);
    setOmnichannelInputs((p) => [input, ...p]);
    const rating = payload.rating ?? 3;
    const beneficiaryId = payload.beneficiaryId ?? "B-ANON";
    const entry = {
      beneficiaryId,
      beneficiaryName: payload.beneficiaryName ?? "Beneficiary",
      centerId: payload.centerId,
      centerName: payload.centerName,
      text: normalizedText,
      rating,
      lang: input.lang,
      imageUrl: payload.imageUrl,
    };
    const ai = await processFeedbackWithAI(normalizedText, rating, input.lang);
    const id = `FB-${Date.now()}`;
    const isComplaint = rating <= 3 || category !== "other_concerns";
    const full: FeedbackEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
      translatedText: ai.translatedText,
      sentiment: ai.sentiment.label,
      sentimentScore: ai.sentiment.score,
      category,
      urgencyScore: Math.min(
        1,
        classifyGrievance(normalizedText, rating, payload.channel).urgencyScore + (urgencyBoost ?? 0)
      ),
      isComplaint,
      aiSummary: `Omnichannel ${payload.channel}`,
      sourceChannel: payload.channel,
      confidence: 0.82,
      feedbackContext: payload.feedbackContext,
    };
    setFeedback((p) => [full, ...p]);
    if (isComplaint) {
      const evidence: ComplaintRecord["citizenEvidence"] = [];
      if (payload.imageUrl) {
        evidence.push({
          id: `ev-${id}`,
          type: "photo",
          url: payload.imageUrl,
          label: "Channel upload",
          uploadedAt: full.timestamp,
        });
      }
      payload.attachmentUrls?.forEach((url, i) => {
        evidence.push({
          id: `ev-${id}-${i}`,
          type: "photo",
          url,
          label: `Attachment ${i + 1}`,
          uploadedAt: full.timestamp,
        });
      });
      const cmp = createComplaintFromText(
        {
          ...entry,
          district: payload.district,
          text: normalizedText,
          submittedAs: payload.feedbackContext?.submittedAs,
          priority: payload.feedbackContext?.category ?? payload.priority,
          citizenEvidence: evidence,
        },
        payload.channel,
        id
      );
      cmp.status = "channel_intake";
      full.complaintId = cmp.id;
      registerComplaint(cmp, beneficiaryId);
    }
    return full;
  };

  const updateComplaint = (id: string, updates: Partial<ComplaintRecord>) => {
    setComplaints((p) => {
      const next = p.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      const updated = next.find((c) => c.id === id);
      if (updated) {
        const repeat = next.filter((x) => x.centerId === updated.centerId && x.id !== id).length;
        const redFlags = sessions.filter((s) => s.metadata.centerId === updated.centerId && s.scorecard?.band === "red").length;
        const avgSat = feedback.filter((f) => f.centerId === updated.centerId).reduce((a, f) => a + f.rating, 0) / Math.max(1, feedback.filter((f) => f.centerId === updated.centerId).length);
        const esc = applyEscalationRule(updated, { repeatCount: repeat, workerRedFlags: redFlags, avgSatisfaction: avgSat });
        if (esc) return next.map((c) => (c.id === id ? esc.complaint : c));
      }
      return next;
    });
  };

  const addGrievanceAction = (
    complaintId: string,
    action: Omit<import("@/types/public-request").GrievanceAction, "id">
  ) => {
    const c = complaints.find((x) => x.id === complaintId);
    if (!c) return;
    const full = { ...action, id: `GA-${Date.now()}` };
    const actions = [...(c.grievanceActions ?? []), full];
    updateComplaint(complaintId, {
      grievanceActions: actions,
      grievance: c.grievance ? { ...c.grievance, actions } : c.grievance,
    });
    const title =
      action.notes.toLowerCase().includes("evidence")
        ? "Additional evidence requested"
        : action.notes.toLowerCase().includes("resolved")
          ? "Issue resolved"
          : "Your grievance is under supervisor review";
    addNotification({
      userId: c.beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title,
      body: `${full.officerName}: ${full.notes.slice(0, 80)}`,
      actionUrl: `/beneficiary/request/${complaintId}`,
    });
  };

  const escalatePublicGrievance = (complaintId: string, reason?: string) => {
    const c = complaints.find((x) => x.id === complaintId);
    if (!c) return;
    const atDistrict = ["district_escalation"].includes(c.status);
    const toSupervisor = !atDistrict;
    const nextStatus: ComplaintStatus = atDistrict ? "state_escalation" : "district_escalation";
    addGrievanceAction(complaintId, {
      ownerRole: "beneficiary",
      officerName: c.beneficiaryName,
      notes: reason ?? "Citizen requested escalation to higher officer",
      timestamp: new Date().toISOString(),
    });
    if (!toSupervisor) {
      addGrievanceAction(complaintId, {
        ownerRole: "district_admin",
        officerName: "District Officer · Tirupati",
        notes: "Escalated to district administration for intervention",
        timestamp: new Date().toISOString(),
      });
    }
    updateComplaint(complaintId, {
      status: nextStatus,
      escalationLevel: toSupervisor ? "L1" : "L2",
      urgencyScore: Math.min(1, (c.urgencyScore ?? 0.5) + 0.2),
    });
    addNotification({
      userId: c.beneficiaryId,
      role: "beneficiary",
      channel: "in_app",
      title: "Escalation recorded",
      body: `Your request ${complaintId} has been escalated for senior review.`,
      actionUrl: `/beneficiary/request/${complaintId}`,
    });
  };

  const advanceComplaint = (id: string, next: ComplaintStatus, extra?: Partial<ComplaintRecord>) => {
    const c = complaints.find((x) => x.id === id);
    updateComplaint(id, { status: next, ...extra });
    if (c && extra?.resolutionEvidenceUrl) {
      addNotification({
        userId: c.beneficiaryId,
        role: "beneficiary",
        channel: "in_app",
        title: "Resolution uploaded",
        body: `Supervisor uploaded resolution proof for grievance ${id}. Please review and confirm closure.`,
        actionUrl: `/beneficiary/request/${id}`,
      });
    }
    if (next === "closed" || next === "beneficiary_confirmation") {
      if (c) {
        platform.scheduleSurvey(c.beneficiaryId, c.centerId, "complaint_closed");
        platform.applyServiceImprovement(c.centerId, "complaint_closed");
      }
    }
  };

  const addSession = (s: SessionRecording) => setSessions((p) => [s, ...p]);
  const updateSession = (id: string, u: Partial<SessionRecording>) => setSessions((p) => p.map((s) => (s.id === id ? { ...s, ...u } : s)));

  const processSessionUpload = async (
    id: string,
    videoUrl?: string,
    existingScorecard?: SessionScorecard,
    sessionOverride?: SessionRecording
  ) => {
    const session = sessionOverride ?? sessions.find((s) => s.id === id);
    if (!session) return null;
    updateSession(id, { status: "processing", uploadProgress: 100, videoBlobUrl: videoUrl, synced: online });
    const scorecard = existingScorecard ?? (await analyzePreschoolSession(session.metadata, !!videoUrl, true));
    const updated: SessionRecording = {
      ...session,
      videoBlobUrl: videoUrl,
      status: "completed",
      scorecard,
      processedAt: new Date().toISOString(),
      synced: online,
    };
    const allAfter = sessions.map((s) => (s.id === id ? updated : s));
    updateSession(id, updated);
    const intel = publishClassroomIntelligence(updated, allAfter);
    if (intel) {
      setClassroomAnalytics((p) => {
        const next = { ...p, [id]: intel };
        persistClassroomBundle(next, classroomReviews);
        return next;
      });
      addNotification({
        userId: "S-204",
        role: "supervisor",
        channel: "in_app",
        title: "Classroom intelligence published",
        body: `${session.metadata.workerName} session · OPI ${intel.indices.opi}% · ${intel.band} band`,
        actionUrl: `/supervisor/session-analysis/${id}`,
      });
      addNotification({
        userId: "DA-01",
        role: "district_admin",
        channel: "in_app",
        title: "District classroom summary updated",
        body: `${session.metadata.centerName} — operational view ready`,
        actionUrl: "/district-admin/classroom-intelligence",
      });
      addNotification({
        userId: "SA-01",
        role: "state_admin",
        channel: "in_app",
        title: "State classroom metrics updated",
        body: `Executive snapshot includes ${session.metadata.centerName}`,
        actionUrl: "/state-admin/classroom-intelligence",
      });
    }
    platform.refreshServiceQuality();
    if (scorecard.band === "green") {
      platform.applyServiceImprovement(session.metadata.centerId, "session_green");
    }
    const primaryModule = scorecard.trainingModuleIds[0];
    const rec: TrainingRecommendation = {
      id: `TR-${Date.now()}`,
      workerId: session.metadata.workerId,
      sessionId: id,
      moduleIds: scorecard.trainingModuleIds,
      primaryModuleId: primaryModule,
      reason: scorecard.supportiveRecommendations[0] ?? "AI coaching path",
      band: scorecard.band,
      createdAt: new Date().toISOString(),
      assignedBy: "ai",
      status: "pending",
      dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    setTrainingRecommendations((p) => [rec, ...p]);
    if (scorecard.band === "red" || scorecard.band === "orange") {
      addNotification({
        userId: session.metadata.workerId,
        role: "worker",
        channel: "in_app",
        title: "Coaching insights ready",
        body: "Review your session scorecard — supportive training modules assigned.",
        actionUrl: "/worker/training",
      });
    }
    return updated;
  };

  const updateTrainingRecommendation = (id: string, updates: Partial<TrainingRecommendation>) => {
    setTrainingRecommendations((p) => p.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const assignCoaching = (a: Omit<CoachingAssignment, "id" | "createdAt" | "status">) => {
    const item: CoachingAssignment = { ...a, id: `COACH-${Date.now()}`, createdAt: new Date().toISOString(), status: "assigned" };
    setCoachingAssignments((p) => [item, ...p]);
    addNotification({ userId: a.workerId, role: "worker", channel: "push", title: "Coaching assigned", body: a.notes, actionUrl: "/worker/training" });
  };

  const workerRedFlagCount = (workerId: string) =>
    sessions.filter((s) => s.metadata.workerId === workerId && s.scorecard?.band === "red").length;

  const getClassroomAnalytics = (sessionId: string) => classroomAnalytics[sessionId] ?? null;

  const getOperationalClassroom = (district?: string) =>
    buildOperationalSnapshot(Object.values(classroomAnalytics), district);

  const getExecutiveClassroom = () =>
    buildExecutiveSnapshot(
      Object.values(classroomAnalytics),
      sessions,
      complaints,
      coachingAssignments,
      feedback
    );

  const saveSupervisorReview = (review: Omit<ClassroomSupervisorReview, "updatedAt">) => {
    const full: ClassroomSupervisorReview = { ...review, updatedAt: new Date().toISOString() };
    setClassroomReviews((p) => {
      const next = { ...p, [review.sessionId]: full };
      persistClassroomBundle(classroomAnalytics, next);
      return next;
    });
    if (review.coachingAssigned && user) {
      const session = sessions.find((s) => s.id === review.sessionId);
      if (session) {
        assignCoaching({
          workerId: session.metadata.workerId,
          workerName: session.metadata.workerName,
          centerId: session.metadata.centerId,
          supervisorId: review.supervisorId,
          moduleIds: session.scorecard?.trainingModuleIds ?? ["TM-COACH-03"],
          notes: review.remarks || "Supervisor classroom coaching follow-up",
          dueAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
        });
      }
    }
  };

  const compareSessions = (beforeId: string, afterId: string) => {
    const b = classroomAnalytics[beforeId];
    const a = classroomAnalytics[afterId];
    if (!b || !a) return null;
    return compareClassroomSessions(b, a);
  };

  const value = useMemo<AppCtx>(
    () => ({
      user, login, logout, lang, setLang, t, online, toggleOnline, lastSync, setLastSync,
      activities, addActivity, updateActivity, removeActivity,
      feedback,
      citizenExperiences,
      submitFeedback,
      submitShareExperience,
      submitReportIssue,
      submitPublicGrievance,
      submitOmnichannel,
      complaints, updateComplaint, advanceComplaint, addGrievanceAction, escalatePublicGrievance,
      notifications, addNotification, markNotificationRead,
      sessions, addSession, updateSession, processSessionUpload,
      trainingRecommendations, updateTrainingRecommendation, coachingAssignments, assignCoaching,
      omnichannelInputs,
      serviceQualityScores: platform.serviceQualityScores,
      refreshServiceQuality: platform.refreshServiceQuality,
      workerRedFlagCount,
      childProgress: platform.childProgress,
      addChildProgress: platform.addChildProgress,
      surveys: platform.surveys,
      submitSurvey: platform.submitSurvey,
      scheduleSurvey: platform.scheduleSurvey,
      interventions: platform.interventions,
      refreshInterventions: platform.refreshInterventions,
      updateIntervention: platform.updateIntervention,
      launchIntervention: platform.launchIntervention,
      childWellnessIndexes: platform.childWellnessIndexes,
      childRiskSignals: platform.childRiskSignals,
      missionControl: platform.missionControl,
      getTimeline: platform.getTimeline,
      syncQueue: platform.syncQueue,
      retrySyncItem: platform.retrySyncItem,
      governmentStory: platform.governmentStory,
      impactMetrics: platform.impactMetrics,
      publicTransparency: platform.publicTransparency,
      demoModeActive: platform.demoModeActive,
      setDemoModeActive: platform.setDemoModeActive,
      runScenarioById: platform.runScenarioById,
      runJourney: platform.runJourney,
      listScenarios: platform.listScenarios,
      getCenterOutcome: platform.getCenterOutcome,
      excellenceIndexes: platform.excellenceIndexes,
      getAEI: platform.getAEI,
      getCenterHealth: platform.getCenterHealth,
      voiceOfCitizen: platform.voiceOfCitizen,
      platformOutcomes: platform.platformOutcomes,
      getOperationalFlow: platform.getOperationalFlow,
      getWorkerGrowth: platform.getWorkerGrowth,
      applyServiceImprovement: platform.applyServiceImprovement,
      runHackathonFlow: platform.runHackathonFlow,
      classroomAnalytics,
      classroomReviews,
      getClassroomAnalytics,
      getOperationalClassroom,
      getExecutiveClassroom,
      saveSupervisorReview,
      compareSessions,
      refreshClassroomIntel,
    }),
    [
      user,
      lang,
      online,
      lastSync,
      activities,
      feedback,
      citizenExperiences,
      complaints,
      notifications,
      sessions,
      trainingRecommendations,
      coachingAssignments,
      omnichannelInputs,
      classroomAnalytics,
      classroomReviews,
      login,
      platform,
      workerRedFlagCount,
      satisfactionBoostByCenter,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
