import { AIExplanation, AnganwadiExcellenceIndex } from "@/types/intelligence";
import { SessionRecording } from "@/types/session";
import { ComplaintRecord, ServiceQualityScore } from "@/types/platform";
import { ChildRiskSignal } from "@/types/intelligence";
import { Center } from "@/data/mockData";
import { AEI_WEIGHTS } from "@/services/excellence/aei";

export function explainSession(session: SessionRecording): AIExplanation {
  const sc = session.scorecard;
  if (!sc) {
    return {
      id: `EXP-${session.id}`,
      sourceType: "session",
      sourceId: session.id,
      confidence: 0.5,
      summary: "Session pending AI evaluation.",
      factors: [],
      evidenceUsed: ["Metadata only"],
      suggestedActions: ["Complete upload for full analysis"],
      thresholds: [{ label: "Minimum evidence", value: "Video + GPS", met: false }],
    };
  }
  const opi = sc.overallPerformanceIndex * 100;
  const factors = [
    { label: "Body language & teaching engagement", weight: 0.25, impact: sc.teachingEffectiveness > 0.7 ? "positive" as const : "negative" as const, detail: `Movement/interaction score ${(sc.teachingEffectiveness * 100).toFixed(0)}% — posture and activity pacing analyzed` },
    { label: "Child engagement signals", weight: 0.25, impact: sc.childEngagement > 0.65 ? "positive" as const : "negative" as const, detail: `${sc.childEngagementDetail.attentive + sc.childEngagementDetail.participating} engaged · ${sc.childEngagementDetail.distracted} distracted` },
    { label: "Communication & speech", weight: 0.2, impact: sc.communication > 0.65 ? "positive" as const : "negative" as const, detail: `Clarity ${(sc.speech.clarity * 100).toFixed(0)}% · pace suitable for ages 3–6` },
    { label: "Syllabus coverage", weight: 0.15, impact: sc.activityCompliance > 0.6 ? "positive" as const : "negative" as const, detail: sc.syllabus.gaps.length ? `Uncovered: ${sc.syllabus.gaps.join(", ")}` : "Planned topics delivered" },
    { label: "Classroom management", weight: 0.15, impact: sc.classroomManagement > 0.6 ? "positive" as const : "neutral" as const, detail: `Time utilization ${(sc.classroomQuality.timeUtilization * 100).toFixed(0)}%` },
  ];
  return {
    id: `EXP-SES-${session.id}`,
    sourceType: "session",
    sourceId: session.id,
    score: opi,
    confidence: 0.87,
    summary: `OPI ${opi.toFixed(0)}% → ${sc.band === "green" ? "performing well" : sc.band === "orange" ? "coaching recommended" : "supportive training offered"}.`,
    factors,
    evidenceUsed: ["Session video/audio", "GPS & timestamp", `Syllabus: ${session.metadata.syllabusCategory}`, "Child engagement frame analysis"],
    suggestedActions: sc.supportiveRecommendations,
    band: sc.band,
    thresholds: [
      { label: "Green band", value: "≥ 75% OPI", met: sc.band === "green" },
      { label: "Orange band", value: "55–74% OPI", met: sc.band === "orange" },
      { label: "Red band", value: "< 55% OPI", met: sc.band === "red" },
    ],
  };
}

export function explainGrievance(complaint: ComplaintRecord): AIExplanation {
  const repeat = (complaint.repeatCount ?? 0) >= 2;
  const escalate = complaint.status.includes("escalation") || complaint.escalationLevel;
  return {
    id: `EXP-CMP-${complaint.id}`,
    sourceType: "grievance",
    sourceId: complaint.id,
    score: complaint.urgencyScore * 100,
    confidence: 0.84,
    summary: complaint.aiClassification?.summary ?? `Classified as ${complaint.category.replace(/_/g, " ")}`,
    factors: [
      { label: "Category selection", weight: 0.35, impact: "negative", detail: `NLP matched ${complaint.category} with ${(complaint.urgencyScore * 100).toFixed(0)}% urgency` },
      { label: "Severity & SLA", weight: 0.25, impact: complaint.severity === "critical" ? "negative" : "neutral", detail: `${complaint.severity ?? "medium"} · SLA ${complaint.slaHours ?? 48}h` },
      { label: "Escalation trigger", weight: 0.2, impact: escalate || repeat ? "negative" : "neutral", detail: repeat ? `Repeat count ${complaint.repeatCount}` : escalate ? `Escalated to ${complaint.escalationLevel}` : "No auto-escalation yet" },
      { label: "Beneficiary sentiment", weight: 0.2, impact: complaint.sentiment === "negative" || complaint.sentiment === "critical" ? "negative" : "neutral", detail: complaint.sentiment },
    ],
    evidenceUsed: [complaint.description, `Channel: ${complaint.sourceChannel ?? "app"}`, complaint.feedbackId ? `Linked feedback ${complaint.feedbackId}` : "Direct intake"],
    suggestedActions: ["Worker field visit", "Supervisor verification", "Beneficiary confirmation survey on closure"],
    thresholds: [
      { label: "District escalation", value: "Repeat ≥ 2 or critical", met: !!escalate },
      { label: "SLA breach risk", value: "Due within 24h", met: new Date(complaint.slaDueAt) < new Date(Date.now() + 86400_000) },
    ],
  };
}

export function explainRisk(signal: ChildRiskSignal): AIExplanation {
  return {
    id: `EXP-RSK-${signal.id}`,
    sourceType: "risk",
    sourceId: signal.id,
    confidence: signal.confidence,
    summary: signal.summary,
    factors: [
      { label: "Signal type", weight: 0.4, impact: "negative", detail: signal.type.replace(/_/g, " ") },
      { label: "Severity", weight: 0.35, impact: signal.severity === "high" ? "negative" : "neutral", detail: signal.severity },
      { label: "Center context", weight: 0.25, impact: "neutral", detail: signal.centerName },
    ],
    evidenceUsed: ["Child progress logs", "Attendance & nutrition records", "Participation trends"],
    suggestedActions: [signal.recommendedAction, "Open center timeline replay", "Review CWI vs SQI"],
    thresholds: [{ label: "Intervention threshold", value: "High severity", met: signal.severity === "high" }],
  };
}

export function explainSQI(score: ServiceQualityScore, center?: Center): AIExplanation {
  return {
    id: `EXP-SQI-${score.centerId}`,
    sourceType: "sqi",
    sourceId: score.centerId,
    score: score.overallIndex,
    confidence: 0.9,
    summary: `Service Quality Index ${score.overallIndex} for ${score.centerName} (rank #${score.rank ?? "—"})`,
    factors: [
      { label: "Worker performance (22%)", weight: 0.22, impact: score.workerPerformance >= 75 ? "positive" : "negative", detail: `${score.workerPerformance}%` },
      { label: "Session evaluation (20%)", weight: 0.2, impact: score.sessionEvaluation >= 75 ? "positive" : "negative", detail: `${score.sessionEvaluation}%` },
      { label: "Complaint volume (18%)", weight: 0.18, impact: score.complaintVolume >= 70 ? "positive" : "negative", detail: `${score.complaintVolume}%` },
      { label: "Beneficiary satisfaction (18%)", weight: 0.18, impact: score.beneficiarySatisfaction >= 75 ? "positive" : "negative", detail: `${score.beneficiarySatisfaction}%` },
      { label: "Attendance compliance (12%)", weight: 0.12, impact: score.attendance >= 80 ? "positive" : "neutral", detail: `${score.attendance}%` },
      { label: "Verification confidence (10%)", weight: 0.1, impact: score.verificationConfidence >= 70 ? "positive" : "neutral", detail: `${score.verificationConfidence}%` },
    ],
    evidenceUsed: [
      "AI session scorecards",
      "Open & closed grievances",
      "Feedback & surveys",
      center ? `Center compliance baseline ${center.compliance}%` : "Center registry",
    ],
    suggestedActions:
      score.overallIndex < 65
        ? ["Launch intervention from supervisor queue", "Schedule operational visit"]
        : ["Maintain current coaching cadence", "Publish transparency aggregate"],
    thresholds: [
      { label: "Target SQI", value: "≥ 80", met: score.overallIndex >= 80 },
      { label: "At-risk", value: "< 65", met: score.overallIndex < 65 },
    ],
  };
}

export function explainAEI(aei: AnganwadiExcellenceIndex): AIExplanation {
  const c = aei.components;
  const w = AEI_WEIGHTS;
  return {
    id: `EXP-AEI-${aei.centerId}`,
    sourceType: "aei",
    sourceId: aei.centerId,
    score: aei.score,
    confidence: 0.88,
    summary: `Anganwadi Excellence Index ${aei.score} — official center score indicating ${aei.band === "green" ? "strong service delivery" : aei.band === "orange" ? "improvement opportunity with support" : "attention required with assigned coaching"}.`,
    factors: [
      { label: "Worker performance", weight: w.workerPerformance, impact: c.workerPerformance >= 70 ? "positive" : "negative", detail: `${c.workerPerformance}% from session service insights` },
      { label: "Child engagement", weight: w.childEngagement, impact: c.childEngagement >= 65 ? "positive" : "negative", detail: `${c.childEngagement}% preschool participation (CWI inputs)` },
      { label: "Beneficiary satisfaction", weight: w.beneficiarySatisfaction, impact: c.beneficiarySatisfaction >= 70 ? "positive" : "negative", detail: `${c.beneficiarySatisfaction}% surveys & feedback` },
      { label: "Grievance closure", weight: w.complaintClosure, impact: c.complaintClosure >= 60 ? "positive" : "negative", detail: `${c.complaintClosure}% closed grievances` },
      { label: "Attendance & compliance", weight: w.attendanceCompliance, impact: c.attendanceCompliance >= 75 ? "positive" : "neutral", detail: `${c.attendanceCompliance}%` },
      { label: "Service verification confidence", weight: w.serviceVerificationConfidence, impact: c.serviceVerificationConfidence >= 70 ? "positive" : "negative", detail: `${c.serviceVerificationConfidence}% AI evidence confidence on submitted proof` },
      { label: "Intervention success", weight: w.interventionSuccess, impact: c.interventionSuccess >= 65 ? "positive" : "neutral", detail: `${c.interventionSuccess}% interventions completed or impact measured` },
    ],
    evidenceUsed: ["Session observations", "Child progress records", "Beneficiary feedback & surveys", "Grievance register", "Activity verification logs", "Intervention OS"],
    suggestedActions: aei.recommendations,
    band: aei.band,
    thresholds: [
      { label: "Green — quality delivery", value: "≥ 75", met: aei.band === "green" },
      { label: "Orange — strengthen service", value: "55–74", met: aei.band === "orange" },
      { label: "Red — supportive intervention", value: "< 55", met: aei.band === "red" },
    ],
  };
}

export function explainSentiment(text: string, score: number): AIExplanation {
  return {
    id: `EXP-SEN-${Date.now()}`,
    sourceType: "sentiment",
    sourceId: "feedback",
    score: score * 20,
    confidence: 0.79,
    summary: score >= 4 ? "Positive beneficiary experience detected" : score <= 2 ? "Dissatisfaction pattern — proactive outreach recommended" : "Neutral feedback",
    factors: [
      { label: "Rating", weight: 0.5, impact: score >= 4 ? "positive" : score <= 2 ? "negative" : "neutral", detail: `${score}/5` },
      { label: "Text signals", weight: 0.5, impact: "neutral", detail: text.slice(0, 120) },
    ],
    evidenceUsed: ["Feedback text", "Star rating"],
    suggestedActions: score <= 3 ? ["Schedule follow-up survey", "Review center digital twin"] : ["Publish thank-you acknowledgment"],
  };
}
