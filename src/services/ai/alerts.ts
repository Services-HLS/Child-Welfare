import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { Center } from "@/data/mockData";

export interface RiskAlert {
  id: string;
  centerId: string;
  centerName: string;
  type: "sentiment_spike" | "sla_breach" | "low_verification" | "complaint_surge";
  message: string;
  severity: "high" | "medium" | "low";
}

export function generateRiskAlerts(
  centers: Center[],
  complaints: ComplaintRecord[],
  feedback: FeedbackEntry[]
): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  centers.forEach((c) => {
    const centerComplaints = complaints.filter((x) => x.centerId === c.id && x.status !== "closed");
    const negFeedback = feedback.filter((f) => f.centerId === c.id && (f.sentiment === "negative" || f.sentiment === "critical"));
    if (c.compliance < 70 || centerComplaints.length >= 2) {
      alerts.push({
        id: `risk-${c.id}`,
        centerId: c.id,
        centerName: c.name,
        type: "complaint_surge",
        message: `${centerComplaints.length} open grievances; compliance ${c.compliance}%`,
        severity: c.status === "critical" ? "high" : "medium",
      });
    }
    if (negFeedback.length >= 2) {
      alerts.push({
        id: `sent-${c.id}`,
        centerId: c.id,
        centerName: c.name,
        type: "sentiment_spike",
        message: "Multiple negative parent feedback entries detected",
        severity: "high",
      });
    }
  });
  return alerts.slice(0, 12);
}
