import { AppUser } from "@/types/platform";
import { ActivityLog, mockCenters } from "@/data/mockData";
import { ComplaintRecord } from "@/types/platform";
import { FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { ChildProgressRecord } from "@/types/intelligence";
import { BeneficiarySurvey } from "@/types/intelligence";
import { CoachingAssignment } from "@/types/session";
import { analyzePreschoolSession } from "@/services/ai/session-analysis";

export type ScenarioPayload = {
  activities: ActivityLog[];
  feedback: FeedbackEntry[];
  complaints: ComplaintRecord[];
  sessions: SessionRecording[];
  childProgress: ChildProgressRecord[];
  surveys: BeneficiarySurvey[];
  coaching: CoachingAssignment[];
};

const scenarios: Record<string, { title: string; description: string; run: () => Promise<ScenarioPayload> }> = {
  poor_meal_quality: {
    title: "Poor Meal Quality",
    description: "Beneficiary reports meal issue, grievance escalates, worker responds, survey after closure",
    run: async () => {
      const center = mockCenters.find((c) => c.id === "AWC-TPT-01")!;
      const fb: FeedbackEntry = {
        id: "FB-SC-1",
        beneficiaryId: "B-1001",
        beneficiaryName: "Sunita Rao",
        centerId: center.id,
        centerName: center.name,
        text: "Today's rice was undercooked and portion was small",
        rating: 2,
        lang: "en",
        sentiment: "negative",
        sentimentScore: 0.3,
        category: "hot_cooked_meals",
        urgencyScore: 0.85,
        isComplaint: true,
        timestamp: new Date().toISOString(),
        sourceChannel: "mobile_app",
        confidence: 0.9,
      };
      const cmp: ComplaintRecord = {
        id: "CMP-SC-1",
        feedbackId: fb.id,
        beneficiaryId: fb.beneficiaryId,
        beneficiaryName: fb.beneficiaryName,
        centerId: center.id,
        centerName: center.name,
        district: center.district,
        category: "hot_cooked_meals",
        title: "Meal quality grievance",
        description: fb.text,
        status: "worker_review",
        urgencyScore: 0.85,
        sentiment: "negative",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDueAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
        severity: "high",
      };
      return { activities: [], feedback: [fb], complaints: [cmp], sessions: [], childProgress: [], surveys: [], coaching: [] };
    },
  },
  weak_engagement: {
    title: "Weak classroom → AI coaching",
    description: "Low session OPI triggers orange band and training modules",
    run: async () => {
      const meta = {
        workerId: "W-1042",
        workerName: "Lakshmi Devi",
        centerId: "AWC-TPT-01",
        centerName: "Alipiri Center",
        timestamp: new Date().toISOString(),
        sessionType: "Preschool",
        gps: { lat: 13.62, lng: 79.41 },
        ageGroup: "3-6" as const,
        syllabusCategory: "language" as const,
      };
      const scorecard = await analyzePreschoolSession(meta, true, true);
      scorecard.overallPerformanceIndex = 0.52;
      scorecard.band = "orange";
      const ses: SessionRecording = {
        id: "SES-SC-2",
        metadata: meta,
        status: "completed",
        uploadProgress: 100,
        synced: true,
        createdAt: new Date().toISOString(),
        scorecard,
      };
      return {
        activities: [],
        feedback: [],
        complaints: [],
        sessions: [ses],
        childProgress: [],
        surveys: [],
        coaching: [{
          id: "COACH-SC-1",
          workerId: meta.workerId,
          workerName: meta.workerName,
          centerId: meta.centerId,
          supervisorId: "S-204",
          moduleIds: scorecard.trainingModuleIds,
          notes: "Scenario: engagement coaching",
          dueAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
          createdAt: new Date().toISOString(),
          status: "assigned",
        }],
      };
    },
  },
  infrastructure_escalation: {
    title: "Infrastructure Complaint",
    description: "Critical hygiene issue escalates to district",
    run: async () => {
      const center = mockCenters.find((c) => c.id === "AWC-TPT-06")!;
      const cmp: ComplaintRecord = {
        id: "CMP-SC-3",
        beneficiaryId: "B-1002",
        beneficiaryName: "Kamala Devi",
        centerId: center.id,
        centerName: center.name,
        district: center.district,
        category: "cleanliness",
        title: "Unsanitary facility",
        description: "Toilet not usable for children",
        status: "district_escalation",
        urgencyScore: 0.95,
        sentiment: "critical",
        escalationLevel: "district",
        severity: "critical",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDueAt: new Date(Date.now() - 3600_000).toISOString(),
      };
      return { activities: [], feedback: [], complaints: [cmp], sessions: [], childProgress: [], surveys: [], coaching: [] };
    },
  },
  repeat_complaints: {
    title: "Repeat complaints → district intervention",
    description: "Multiple open grievances trigger district review",
    run: async () => {
      const center = mockCenters.find((c) => c.id === "AWC-TPT-06")!;
      const mk = (i: number): ComplaintRecord => ({
        id: `CMP-SC-R${i}`,
        beneficiaryId: "B-X",
        beneficiaryName: "Parent",
        centerId: center.id,
        centerName: center.name,
        district: center.district,
        category: "service_delivery",
        title: `Repeat issue ${i}`,
        description: "Recurring service gap",
        status: "supervisor_review",
        urgencyScore: 0.7,
        sentiment: "negative",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDueAt: new Date(Date.now() + 48 * 3600_000).toISOString(),
        repeatCount: 3,
      });
      return { activities: [], feedback: [], complaints: [mk(1), mk(2), mk(3)], sessions: [], childProgress: [], surveys: [], coaching: [] };
    },
  },
  low_child_engagement: {
    title: "Low Child Engagement",
    description: "Participation drops trigger CWI risk and coaching",
    run: async () => {
      const center = mockCenters.find((c) => c.id === "AWC-TPT-01")!;
      const cp: ChildProgressRecord[] = [
        { id: "CP-SC-1", childId: "CH-99", childName: "Demo Child", centerId: center.id, workerId: "W-1042", date: new Date().toISOString().slice(0, 10), attended: true, nutritionCompleted: true, preschoolParticipation: 0.32, growthIndicator: "monitor", developmentalNote: "Low group participation", learningObservation: "Rarely joins circle time" },
      ];
      return { activities: [], feedback: [], complaints: [], sessions: [], childProgress: cp, surveys: [], coaching: [] };
    },
  },
  sqi_decline: {
    title: "Repeated complaints → lower SQI",
    description: "Multiple grievances and low ratings reduce center index",
    run: async () => {
      const center = mockCenters.find((c) => c.id === "AWC-TPT-06")!;
      const fb: FeedbackEntry = {
        id: "FB-SQI-1",
        beneficiaryId: "B-1002",
        beneficiaryName: "Parent",
        centerId: center.id,
        centerName: center.name,
        text: "Services inconsistent this month",
        rating: 2,
        lang: "en",
        sentiment: "negative",
        sentimentScore: 0.25,
        category: "service_delivery",
        urgencyScore: 0.7,
        isComplaint: true,
        timestamp: new Date().toISOString(),
        sourceChannel: "mobile_app",
        confidence: 0.88,
      };
      const cmp: ComplaintRecord = {
        id: "CMP-SQI-1",
        feedbackId: fb.id,
        beneficiaryId: fb.beneficiaryId,
        beneficiaryName: fb.beneficiaryName,
        centerId: center.id,
        centerName: center.name,
        district: center.district,
        category: "service_delivery",
        title: "Service gap",
        description: fb.text,
        status: "supervisor_review",
        urgencyScore: 0.7,
        sentiment: "negative",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDueAt: new Date(Date.now() + 48 * 3600_000).toISOString(),
        repeatCount: 2,
      };
      return { activities: [], feedback: [fb], complaints: [cmp], sessions: [], childProgress: [], surveys: [], coaching: [] };
    },
  },
  worker_improvement_journey: {
    title: "Worker Improvement Journey",
    description: "Coaching completed; sessions move from orange to green",
    run: async () => scenarios.training_improves_performance!.run(),
  },
  complaint_escalation: {
    title: "Complaint Escalation",
    description: "Infrastructure grievance escalates to district",
    run: async () => scenarios.infrastructure_escalation!.run(),
  },
  recovery_after_intervention: {
    title: "Recovery After Intervention",
    description: "Intervention completed — AEI and child outcomes improve",
    run: async () => {
      const uplift = await scenarios.training_improves_performance!.run();
      const cp: ChildProgressRecord[] = [
        { id: "CP-REC-1", childId: "CH-01", childName: "Aarav Rao", centerId: "AWC-TPT-01", workerId: "W-1042", date: new Date().toISOString().slice(0, 10), attended: true, nutritionCompleted: true, preschoolParticipation: 0.9, growthIndicator: "on_track", learningObservation: "Recovered after coaching" },
      ];
      const closed: ComplaintRecord = {
        id: "CMP-REC-1",
        beneficiaryId: "B-1001",
        beneficiaryName: "Sunita Rao",
        centerId: "AWC-TPT-01",
        centerName: "Alipiri Center",
        district: "Tirupati",
        category: "hot_cooked_meals",
        title: "Meal quality — resolved",
        description: "Worker improved meal prep; parent confirmed",
        status: "closed",
        urgencyScore: 0.5,
        sentiment: "neutral",
        createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
        updatedAt: new Date().toISOString(),
        slaDueAt: new Date().toISOString(),
      };
      return {
        ...uplift,
        complaints: [closed],
        childProgress: cp,
      };
    },
  },
  training_improves_performance: {
    title: "Training → worker performance uplift",
    description: "Coaching completed; session returns green band",
    run: async () => {
      const meta = {
        workerId: "W-1042",
        workerName: "Lakshmi Devi",
        centerId: "AWC-TPT-01",
        centerName: "Alipiri Center",
        timestamp: new Date().toISOString(),
        sessionType: "Preschool",
        gps: { lat: 13.62, lng: 79.41 },
        ageGroup: "3-6" as const,
        syllabusCategory: "numeracy" as const,
      };
      const scorecard = await analyzePreschoolSession(meta, true, true);
      scorecard.overallPerformanceIndex = 0.82;
      scorecard.band = "green";
      const ses: SessionRecording = {
        id: "SES-SC-GREEN",
        metadata: meta,
        status: "completed",
        uploadProgress: 100,
        synced: true,
        createdAt: new Date().toISOString(),
        scorecard,
      };
      return {
        activities: [],
        feedback: [],
        complaints: [],
        sessions: [ses],
        childProgress: [],
        surveys: [],
        coaching: [{ id: "COACH-DONE", workerId: "W-1042", workerName: "Lakshmi Devi", centerId: meta.centerId, supervisorId: "S-204", moduleIds: ["M1"], notes: "Coaching completed — impact measured", dueAt: new Date().toISOString(), createdAt: new Date(Date.now() - 14 * 86400_000).toISOString(), status: "completed" }],
      };
    },
  },
};

export function listScenarios() {
  return Object.entries(scenarios).map(([id, s]) => ({ id, title: s.title, description: s.description }));
}

export async function runScenario(id: string): Promise<ScenarioPayload | null> {
  const s = scenarios[id];
  if (!s) return null;
  return s.run();
}

export async function runDemoJourney(journey: string): Promise<Partial<ScenarioPayload>> {
  switch (journey) {
    case "parent":
    case "beneficiary":
      return runScenario("poor_meal_quality") ?? {};
    case "worker":
      return runScenario("weak_engagement") ?? {};
    case "coaching":
      return runScenario("low_child_engagement") ?? {};
    case "complaint":
    case "complaint_resolution":
      return runScenario("poor_meal_quality") ?? {};
    case "supervisor":
      return runScenario("repeat_complaints") ?? {};
    case "state_admin":
    case "state_monitoring":
      const a = await runScenario("sqi_decline");
      const b = await runScenario("training_improves_performance");
      return {
        activities: [...(a?.activities ?? []), ...(b?.activities ?? [])],
        feedback: [...(a?.feedback ?? []), ...(b?.feedback ?? [])],
        complaints: [...(a?.complaints ?? []), ...(b?.complaints ?? [])],
        sessions: [...(a?.sessions ?? []), ...(b?.sessions ?? [])],
        childProgress: [...(a?.childProgress ?? []), ...(b?.childProgress ?? [])],
        surveys: [...(a?.surveys ?? []), ...(b?.surveys ?? [])],
        coaching: [...(a?.coaching ?? []), ...(b?.coaching ?? [])],
      };
    default:
      return {};
  }
}
