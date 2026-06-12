import { ScenarioPayload } from "./scenarioGenerator";
import { runScenario } from "./scenarioGenerator";
import { ChildProgressRecord } from "@/types/intelligence";
import { analyzePreschoolSession } from "@/services/ai/session-analysis";
import { SessionRecording } from "@/types/session";

export type HackathonStepId =
  | "session"
  | "ai_eval"
  | "supervisor_review"
  | "district_monitor"
  | "state_track"
  | "parent_view"
  | "feedback"
  | "complaint"
  | "supervisor"
  | "coaching"
  | "outcomes"
  | "recovery"
  | "dashboard";

export const HACKATHON_NARRATION: Record<HackathonStepId, { title: string; narrative: string }> = {
  session: { title: "Worker Session", narrative: "Lakshmi begins preschool with GPS evidence — service delivered at Alipiri center." },
  ai_eval: { title: "AI Evaluation", narrative: "Session analyzed for engagement, syllabus coverage, and OPI — classroom intelligence published to all government levels." },
  supervisor_review: { title: "Supervisor classroom review", narrative: "Supervisor opens Classroom Intelligence Center — approves observations and assigns supportive coaching." },
  district_monitor: { title: "District command", narrative: "District Classroom Command Center shows center rankings, heatmaps, and intervention signals — no raw video by default." },
  state_track: { title: "State executive tracking", narrative: "State Classroom Intelligence tracks district comparison and improvement after interventions." },
  parent_view: { title: "Parent visibility", narrative: "Sunita sees today's activity in the beneficiary portal — transparency builds trust." },
  feedback: { title: "Parent Feedback", narrative: "Meal quality concern submitted via mobile; AI sentiment analysis runs instantly." },
  complaint: { title: "Complaint generated", narrative: "Grievance classified with SLA, routing, and escalation rules — worker assigned." },
  supervisor: { title: "Supervisor Intervention", narrative: "Field audit and intervention OS — training, monitoring visit, or infrastructure support." },
  coaching: { title: "Worker Coaching", narrative: "Supportive modules assigned — growth journey tracks improvement, not punishment." },
  outcomes: { title: "Child Outcome", narrative: "CWI updated — attendance, nutrition, preschool participation measured." },
  recovery: { title: "Center Recovery", narrative: "Complaint closed, coaching completed — AEI components lift toward green." },
  dashboard: { title: "Dashboard Update", narrative: "Mission Control live session intelligence, classroom dashboards, Center Journey, and Impact reflect measurable improvement — center turns Green." },
};

/** Full judge walkthrough payload */
export async function buildHackathonFullFlow(): Promise<ScenarioPayload> {
  const meal = await runScenario("poor_meal_quality");
  const coach = await runScenario("weak_engagement");
  const recovery = await runScenario("recovery_after_intervention");
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
  scorecard.overallPerformanceIndex = 0.81;
  scorecard.band = "green";
  const greenSession: SessionRecording = {
    id: "SES-HACK-GREEN",
    metadata: meta,
    status: "completed",
    uploadProgress: 100,
    synced: true,
    createdAt: new Date().toISOString(),
    scorecard,
  };
  const outcomes: ChildProgressRecord[] = recovery?.childProgress?.length
    ? recovery.childProgress
    : [
        { id: "CP-H1", childId: "CH-01", childName: "Aarav Rao", centerId: "AWC-TPT-01", workerId: "W-1042", date: new Date().toISOString().slice(0, 10), attended: true, nutritionCompleted: true, preschoolParticipation: 0.92, growthIndicator: "on_track", learningObservation: "Active in numeracy" },
      ];
  return {
    activities: meal?.activities ?? [],
    feedback: meal?.feedback ?? [],
    complaints: recovery?.complaints ?? meal?.complaints ?? [],
    sessions: [...(coach?.sessions ?? []), greenSession, ...(recovery?.sessions ?? [])],
    childProgress: outcomes,
    surveys: meal?.surveys ?? [],
    coaching: [...(coach?.coaching ?? []), ...(recovery?.coaching ?? [])],
  };
}
