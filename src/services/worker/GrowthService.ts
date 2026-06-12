import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord } from "@/types/platform";
import { SessionRecording, TrainingRecommendation } from "@/types/session";
import { WorkerAttendanceRecord } from "@/types/worker-flow";
import { WorkerGrowthProfile } from "@/types/intelligence";
import { buildWorkerGrowthProfile } from "./growthProfile";

export interface GrowthInputs {
  workerId: string;
  workerName: string;
  centerId: string;
  sessions: SessionRecording[];
  coaching: import("@/types/session").CoachingAssignment[];
  interventions: import("@/types/intelligence").InterventionRecommendation[];
  attendance?: WorkerAttendanceRecord;
  activitiesToday: number;
  complaintsResolved: number;
  trainingCompleted: number;
  serviceCompletionPercent: number;
}

export function buildEventDrivenGrowth(input: GrowthInputs): WorkerGrowthProfile & {
  timeline: { phase: string; status: string; detail: string }[];
  projectedGrowth: number;
} {
  const base = buildWorkerGrowthProfile(input.workerId, input.workerName, input.centerId, {
    sessions: input.sessions,
    coaching: input.coaching,
    interventions: input.interventions,
  });

  const attScore = input.attendance?.checkIn ? (input.attendance.checkOut ? 100 : 70) : 20;
  const sessionScore = input.sessions.filter((s) => s.scorecard).length * 8;
  const serviceScore = Math.min(25, input.activitiesToday * 8);
  const issueScore = Math.min(15, input.complaintsResolved * 5);
  const trainingScore = Math.min(20, input.trainingCompleted * 10);
  const projectedGrowth = Math.min(95, Math.round(attScore * 0.15 + sessionScore + serviceScore + issueScore + trainingScore));

  const timeline = [
    { phase: "Previous sessions", status: input.sessions.length ? "complete" : "pending", detail: `${input.sessions.filter((s) => s.scorecard).length} evaluated` },
    { phase: "Coaching", status: input.coaching.length ? "complete" : "pending", detail: `${input.coaching.length} assignments` },
    { phase: "Training", status: input.trainingCompleted ? "complete" : "active", detail: `${input.trainingCompleted} modules done` },
    { phase: "Improved sessions", status: base.beforeAfter.after > base.beforeAfter.before ? "complete" : "pending", detail: `${base.beforeAfter.before}% → ${base.beforeAfter.after}%` },
    { phase: "Current growth", status: "active", detail: `Projected ${projectedGrowth}% pathway score` },
  ];

  return {
    ...base,
    estimatedImprovement: Math.max(base.estimatedImprovement, projectedGrowth - base.beforeAfter.after),
    expectedImpactLabel: `Projected +${Math.max(5, projectedGrowth - base.beforeAfter.after)}% with today's completions`,
    timeline,
    projectedGrowth,
  };
}

export function growthFromLiveData(
  workerId: string,
  workerName: string,
  centerId: string,
  ctx: {
    sessions: SessionRecording[];
    coaching: import("@/types/session").CoachingAssignment[];
    interventions: import("@/types/intelligence").InterventionRecommendation[];
    attendance?: WorkerAttendanceRecord;
    activities: ActivityLog[];
    complaints: ComplaintRecord[];
    training: TrainingRecommendation[];
    bundleCompletedTraining: string[];
    serviceCompletionPercent: number;
  }
) {
  const today = new Date().toDateString();
  const activitiesToday = ctx.activities.filter(
    (a) => a.worker === workerName && new Date(a.timestamp).toDateString() === today
  ).length;
  const complaintsResolved = ctx.complaints.filter(
    (c) => c.assignedWorkerId === workerId && (c.status === "closed" || c.status === "beneficiary_confirmation")
  ).length;
  const trainingCompleted =
    ctx.training.filter(
      (t) => t.workerId === workerId && (t.status === "completed" || t.status === "improved")
    ).length +
    ctx.bundleCompletedTraining.length;

  return buildEventDrivenGrowth({
    workerId,
    workerName,
    centerId,
    sessions: ctx.sessions,
    coaching: ctx.coaching,
    interventions: ctx.interventions,
    attendance: ctx.attendance,
    activitiesToday,
    complaintsResolved,
    trainingCompleted,
    serviceCompletionPercent: ctx.serviceCompletionPercent,
  });
}
