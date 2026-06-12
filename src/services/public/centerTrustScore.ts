import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord } from "@/types/platform";
import { FeedbackEntry } from "@/types/platform";
import { SessionRecording } from "@/types/session";

export interface CenterTrustDimension {
  id: string;
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
  color: "emerald" | "amber" | "rose" | "blue";
}

export interface CenterTrustScore {
  overall: number;
  dimensions: CenterTrustDimension[];
  summary: string;
}

export function buildCenterTrustScore(
  centerId: string,
  feedback: FeedbackEntry[],
  complaints: ComplaintRecord[],
  activities: ActivityLog[],
  sessions: SessionRecording[]
): CenterTrustScore {
  const centerFb = feedback.filter((f) => f.centerId === centerId);
  const avgRating =
    centerFb.reduce((a, f) => a + f.rating, 0) / Math.max(1, centerFb.length);
  const openComplaints = complaints.filter((c) => c.centerId === centerId && c.status !== "closed").length;
  const closed = complaints.filter((c) => c.centerId === centerId && c.status === "closed").length;
  const acts = activities.filter((a) => a.centerId === centerId).length;
  const sessionScores = sessions
    .filter((s) => s.metadata.centerId === centerId && s.scorecard)
    .map((s) => s.scorecard!.overallScore ?? 70);
  const teaching =
    sessionScores.length > 0
      ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
      : 78;

  const satisfaction = Math.round((avgRating / 5) * 100);
  const nutrition = Math.min(95, 70 + acts * 2);
  const infrastructure = Math.max(55, 88 - openComplaints * 8);
  const responsiveness = Math.min(95, 60 + closed * 5 - openComplaints * 10);

  const dimensions: CenterTrustDimension[] = [
    { id: "teaching", label: "Teaching Quality", score: teaching, trend: teaching >= 75 ? "up" : "stable", color: "blue" },
    { id: "nutrition", label: "Nutrition Reliability", score: nutrition, trend: "stable", color: "emerald" },
    { id: "infra", label: "Infrastructure Health", score: infrastructure, trend: openComplaints ? "down" : "up", color: infrastructure < 70 ? "amber" : "emerald" },
    { id: "response", label: "Service Responsiveness", score: responsiveness, trend: closed > openComplaints ? "up" : "stable", color: "blue" },
    { id: "satisfaction", label: "Citizen Satisfaction", score: satisfaction, trend: avgRating >= 4 ? "up" : "stable", color: satisfaction >= 70 ? "emerald" : "amber" },
  ];

  const overall = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);

  return {
    overall,
    dimensions,
    summary:
      "Citizen-safe index from AI session summaries, feedback sentiment, service logs, and grievance resolution — not individual worker punishment scores.",
  };
}
