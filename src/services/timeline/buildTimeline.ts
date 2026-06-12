import { TimelineEvent } from "@/types/intelligence";
import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";
import { ChildProgressRecord, BeneficiarySurvey, InterventionRecommendation } from "@/types/intelligence";
import { CoachingAssignment } from "@/types/session";

export function buildCenterTimeline(
  centerId: string,
  data: {
    activities: ActivityLog[];
    feedback: FeedbackEntry[];
    complaints: ComplaintRecord[];
    sessions: SessionRecording[];
    childProgress: ChildProgressRecord[];
    surveys: BeneficiarySurvey[];
    coaching: CoachingAssignment[];
    interventions?: InterventionRecommendation[];
  }
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  data.activities.filter((a) => a.centerId === centerId).forEach((a) => {
    events.push({
      id: `TL-A-${a.id}`,
      centerId,
      timestamp: a.timestamp,
      type: "service",
      title: a.type,
      description: a.description,
      actor: a.worker,
    });
  });

  data.feedback.filter((f) => f.centerId === centerId).forEach((f) => {
    events.push({
      id: `TL-F-${f.id}`,
      centerId,
      timestamp: f.timestamp,
      type: "feedback",
      title: `Feedback ${f.rating}/5`,
      description: f.text.slice(0, 100),
      actor: f.beneficiaryName,
    });
  });

  data.complaints.filter((c) => c.centerId === centerId).forEach((c) => {
    events.push({
      id: `TL-C-${c.id}`,
      centerId,
      timestamp: c.createdAt,
      type: "complaint",
      title: c.title,
      description: c.status,
    });
    if (c.status === "closed" || c.resolutionNote) {
      events.push({
        id: `TL-R-${c.id}`,
        centerId,
        timestamp: c.updatedAt,
        type: "resolution",
        title: "Grievance resolved",
        description: c.resolutionNote ?? "Closed",
      });
    }
    (c.escalations ?? []).forEach((e) => {
      events.push({
        id: e.id,
        centerId,
        timestamp: e.triggeredAt,
        type: "escalation",
        title: `Escalation: ${e.toLevel}`,
        description: e.reason,
      });
    });
  });

  data.sessions.filter((s) => s.metadata.centerId === centerId).forEach((s) => {
    events.push({
      id: `TL-S-${s.id}`,
      centerId,
      timestamp: s.metadata.timestamp,
      type: "session",
      title: "Preschool session",
      description: s.scorecard ? `OPI ${(s.scorecard.overallPerformanceIndex * 100).toFixed(0)}% (${s.scorecard.band})` : s.status,
      actor: s.metadata.workerName,
    });
  });

  data.childProgress.filter((p) => p.centerId === centerId).forEach((p) => {
    events.push({
      id: `TL-O-${p.id}`,
      centerId,
      timestamp: `${p.date}T12:00:00.000Z`,
      type: "outcome",
      title: `Child progress: ${p.childName}`,
      description: p.attended ? `Participation ${(p.preschoolParticipation * 100).toFixed(0)}%` : "Absent",
    });
  });

  data.surveys.filter((s) => s.centerId === centerId && s.completedAt).forEach((s) => {
    events.push({
      id: `TL-V-${s.id}`,
      centerId,
      timestamp: s.completedAt!,
      type: "survey",
      title: "Beneficiary survey",
      description: s.responses ? `Satisfaction ${s.responses.overallSatisfaction}/5` : "Completed",
    });
  });

  data.coaching.filter((c) => c.centerId === centerId).forEach((c) => {
    events.push({
      id: `TL-CH-${c.id}`,
      centerId,
      timestamp: c.createdAt,
      type: "coaching",
      title: "Coaching assigned",
      description: c.notes,
      actor: c.workerName,
    });
  });

  (data.interventions ?? []).filter((i) => i.centerId === centerId).forEach((i) => {
    events.push({
      id: `TL-INT-${i.id}`,
      centerId,
      timestamp: i.createdAt,
      type: "coaching",
      title: `Intervention: ${i.title}`,
      description: `${i.status} · ${i.dimension.replace(/_/g, " ")}`,
    });
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
