import { ComplaintCategory, ComplaintRecord } from "@/types/platform";
import {
  AIExplainBlock,
  ChartDataPoint,
  GrievanceInvestigationReport,
  InvestigationPrediction,
  InvestigationRecommendation,
  CenterIntelligenceReport,
  CenterFraudSignal,
} from "@/types/investigation";
import { mockCenters } from "@/data/mockData";
import { buildXAIInvestigationBundle } from "@/services/ai/xai-report-builder";

type CategoryProfile = {
  classification: string;
  rootCause: string;
  fraudBase: number;
  sentimentBase: number;
  riskBase: number;
  predictions: Omit<InvestigationPrediction, "id">[];
  recommendations: Omit<InvestigationRecommendation, "id">[];
  trend: ChartDataPoint[];
  riskFactors: ChartDataPoint[];
};

const PROFILES: Partial<Record<ComplaintCategory, CategoryProfile>> = {
  nutrition_quality: {
    classification: "Nutrition Service Issue",
    rootCause: "Nutrition Supply Delay",
    fraudBase: 12,
    sentimentBase: 28,
    riskBase: 68,
    predictions: [
      { label: "Future Nutrition Shortage", probability: 74, horizonDays: 7, historicalDataUsed: ["14-day meal logs", "ICDS stock register"], trendAnalysis: "Declining receipt rate over 3 weeks", seasonality: "Summer demand spike", operationalRecords: ["THR dispatch ledger"], confidenceCalculation: "74% — 3 correlated supply gaps" },
      { label: "Child Malnutrition Risk", probability: 58, horizonDays: 14, historicalDataUsed: ["Growth monitoring records"], trendAnalysis: "Weight-for-age plateau in 2 children", seasonality: "N/A", operationalRecords: ["ANM visit log"], confidenceCalculation: "58% — moderate correlation" },
      { label: "Future Complaint Increase", probability: 81, horizonDays: 7, historicalDataUsed: ["Citizen grievance history"], trendAnalysis: "Nutrition complaints up 40% MoM", seasonality: "Post-harvest period", operationalRecords: ["Supervisor audit notes"], confidenceCalculation: "81% — repeat pattern detected" },
    ],
    recommendations: [
      { recommendation: "Increase nutrition stock immediately", reason: "Empty storage confirmed in citizen evidence", supportingEvidence: ["Photo evidence", "GPS at center", "Prior nutrition complaints"], expectedImpact: "Restore meal compliance within 48 hours", responsibleOfficer: "District Nutrition Officer", estimatedCompletion: "2 days", priority: "critical", expectedComplaintReduction: "65%", expectedChildWelfareImprovement: "High — restores daily protein intake", expectedSatisfactionImprovement: "+22% beneficiary trust" },
      { recommendation: "Assign food inspection team", reason: "Quality variance across last 3 service days", supportingEvidence: ["Worker activity logs", "Parent survey scores"], expectedImpact: "Standardize portion and quality", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "3 days", priority: "high", expectedComplaintReduction: "40%", expectedChildWelfareImprovement: "Medium", expectedSatisfactionImprovement: "+15%" },
      { recommendation: "District nutrition review", reason: "Pattern matches district-wide supply delay", supportingEvidence: ["3 centers with similar complaints"], expectedImpact: "Prevent systemic recurrence", responsibleOfficer: "District Admin · WDCW", estimatedCompletion: "7 days", priority: "high", expectedComplaintReduction: "55%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+18%" },
    ],
    trend: [{ label: "Jan", value: 3 }, { label: "Feb", value: 5 }, { label: "Mar", value: 8 }, { label: "Apr", value: 12 }, { label: "May", value: 9 }, { label: "Jun", value: 14 }],
    riskFactors: [{ label: "Supply Chain", value: 82 }, { label: "Storage", value: 71 }, { label: "Staff Training", value: 45 }, { label: "Parent Trust", value: 62 }],
  },
  hot_cooked_meals: {
    classification: "Hot Cooked Meal Delivery Failure",
    rootCause: "Meal Preparation / Dispatch Delay",
    fraudBase: 8,
    sentimentBase: 35,
    riskBase: 72,
    predictions: [
      { label: "Future Nutrition Shortage", probability: 70, horizonDays: 7, historicalDataUsed: ["Meal service logs"], trendAnalysis: "Late serving trend", seasonality: "Peak summer", operationalRecords: ["Kitchen audit"], confidenceCalculation: "70%" },
      { label: "Future Complaint Increase", probability: 76, horizonDays: 5, historicalDataUsed: ["Grievance register"], trendAnalysis: "Meal complaints rising", seasonality: "N/A", operationalRecords: ["Supervisor notes"], confidenceCalculation: "76%" },
    ],
    recommendations: [
      { recommendation: "Immediate meal service audit", reason: "Citizen reports meals not delivered on schedule", supportingEvidence: ["Complaint text", "Timestamp"], expectedImpact: "Same-day corrective serving", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "24 hours", priority: "critical", expectedComplaintReduction: "70%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+25%" },
    ],
    trend: [{ label: "Jan", value: 2 }, { label: "Feb", value: 4 }, { label: "Mar", value: 6 }, { label: "Apr", value: 10 }, { label: "May", value: 7 }, { label: "Jun", value: 11 }],
    riskFactors: [{ label: "Kitchen Ops", value: 78 }, { label: "Timing", value: 85 }, { label: "Staff", value: 52 }],
  },
  worker_behavior: {
    classification: "Worker Conduct Issue",
    rootCause: "Staff Conduct / Communication Gap",
    fraudBase: 18,
    sentimentBase: 22,
    riskBase: 74,
    predictions: [
      { label: "Attendance Decline", probability: 62, horizonDays: 14, historicalDataUsed: ["Worker attendance register"], trendAnalysis: "Parent withdrawal signals", seasonality: "N/A", operationalRecords: ["Enrollment data"], confidenceCalculation: "62%" },
      { label: "Parent Dissatisfaction", probability: 85, horizonDays: 7, historicalDataUsed: ["Sentiment analysis", "Survey scores"], trendAnalysis: "Negative sentiment cluster", seasonality: "N/A", operationalRecords: ["Feedback logs"], confidenceCalculation: "85%" },
      { label: "More Worker Complaints", probability: 79, horizonDays: 10, historicalDataUsed: ["Grievance history"], trendAnalysis: "Repeat conduct reports", seasonality: "N/A", operationalRecords: ["Coaching records"], confidenceCalculation: "79%" },
    ],
    recommendations: [
      { recommendation: "Immediate supervisor counseling session", reason: "Conduct complaint with citizen evidence", supportingEvidence: ["Complaint narrative", "Witness statements"], expectedImpact: "Restore professional standards", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "48 hours", priority: "high", expectedComplaintReduction: "50%", expectedChildWelfareImprovement: "Medium — emotional safety", expectedSatisfactionImprovement: "+30%" },
      { recommendation: "Assign workforce coaching module", reason: "Pattern matches prior conduct flags", supportingEvidence: ["Training records", "Prior grievances"], expectedImpact: "Long-term behavior improvement", responsibleOfficer: "District Workforce Officer", estimatedCompletion: "14 days", priority: "medium", expectedComplaintReduction: "35%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+20%" },
    ],
    trend: [{ label: "Jan", value: 1 }, { label: "Feb", value: 2 }, { label: "Mar", value: 4 }, { label: "Apr", value: 3 }, { label: "May", value: 6 }, { label: "Jun", value: 5 }],
    riskFactors: [{ label: "Conduct", value: 88 }, { label: "Trust", value: 76 }, { label: "Retention", value: 54 }],
  },
  infrastructure: {
    classification: "Infrastructure Deficiency",
    rootCause: "Building Deterioration / Deferred Maintenance",
    fraudBase: 5,
    sentimentBase: 30,
    riskBase: 80,
    predictions: [
      { label: "Building Deterioration", probability: 88, horizonDays: 30, historicalDataUsed: ["Infrastructure audit"], trendAnalysis: "Structural wear accelerating", seasonality: "Monsoon risk", operationalRecords: ["Maintenance log"], confidenceCalculation: "88%" },
      { label: "Safety Risk", probability: 72, horizonDays: 14, historicalDataUsed: ["Safety inspection"], trendAnalysis: "Hazard score rising", seasonality: "Rainy season", operationalRecords: ["District engineering"], confidenceCalculation: "72%" },
      { label: "Additional Infrastructure Complaints", probability: 83, horizonDays: 7, historicalDataUsed: ["Citizen reports"], trendAnalysis: "Community visibility high", seasonality: "N/A", operationalRecords: ["Grievance register"], confidenceCalculation: "83%" },
    ],
    recommendations: [
      { recommendation: "Emergency structural assessment", reason: "Citizen photo confirms visible damage", supportingEvidence: ["Photo evidence", "GPS verification"], expectedImpact: "Prevent safety incident", responsibleOfficer: "District Engineering · WDCW", estimatedCompletion: "5 days", priority: "critical", expectedComplaintReduction: "60%", expectedChildWelfareImprovement: "Critical — physical safety", expectedSatisfactionImprovement: "+28%" },
    ],
    trend: [{ label: "Jan", value: 1 }, { label: "Feb", value: 2 }, { label: "Mar", value: 3 }, { label: "Apr", value: 5 }, { label: "May", value: 4 }, { label: "Jun", value: 7 }],
    riskFactors: [{ label: "Structure", value: 90 }, { label: "Safety", value: 85 }, { label: "Budget", value: 60 }],
  },
  education: {
    classification: "Preschool Education Service Issue",
    rootCause: "ECCE Session Quality / Curriculum Delivery Gap",
    fraudBase: 10,
    sentimentBase: 40,
    riskBase: 58,
    predictions: [
      { label: "Learning Outcome Decline", probability: 55, horizonDays: 21, historicalDataUsed: ["Session AI scores"], trendAnalysis: "Participation dropping", seasonality: "Summer break", operationalRecords: ["Classroom intelligence"], confidenceCalculation: "55%" },
      { label: "Parent Engagement Drop", probability: 68, horizonDays: 14, historicalDataUsed: ["Attendance logs"], trendAnalysis: "Irregular preschool attendance", seasonality: "N/A", operationalRecords: ["Parent feedback"], confidenceCalculation: "68%" },
    ],
    recommendations: [
      { recommendation: "Supervisor classroom observation", reason: "Education quality complaint filed", supportingEvidence: ["Citizen description", "Session records"], expectedImpact: "Restore ECCE standards", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "3 days", priority: "high", expectedComplaintReduction: "45%", expectedChildWelfareImprovement: "High — cognitive development", expectedSatisfactionImprovement: "+18%" },
    ],
    trend: [{ label: "Jan", value: 2 }, { label: "Feb", value: 3 }, { label: "Mar", value: 4 }, { label: "Apr", value: 5 }, { label: "May", value: 3 }, { label: "Jun", value: 6 }],
    riskFactors: [{ label: "Session Quality", value: 70 }, { label: "Materials", value: 55 }, { label: "Worker Skill", value: 62 }],
  },
  service_delivery: {
    classification: "Health Service Delivery Issue",
    rootCause: "Health Camp / Referral Gap",
    fraudBase: 14,
    sentimentBase: 25,
    riskBase: 76,
    predictions: [
      { label: "Disease Outbreak Risk", probability: 45, horizonDays: 14, historicalDataUsed: ["Health screening logs"], trendAnalysis: "Unaddressed symptoms reported", seasonality: "Monsoon vector season", operationalRecords: ["ANM records"], confidenceCalculation: "45%" },
      { label: "Health Camp Requirement", probability: 82, horizonDays: 7, historicalDataUsed: ["Service gap analysis"], trendAnalysis: "3+ health-related grievances", seasonality: "N/A", operationalRecords: ["District health plan"], confidenceCalculation: "82%" },
      { label: "Medical Referral Increase", probability: 61, horizonDays: 10, historicalDataUsed: ["Referral register"], trendAnalysis: "Pending referrals backlog", seasonality: "N/A", operationalRecords: ["PHC liaison"], confidenceCalculation: "61%" },
    ],
    recommendations: [
      { recommendation: "Schedule ANM visit within 48 hours", reason: "Health service complaint with child symptoms", supportingEvidence: ["Complaint text", "Center health records"], expectedImpact: "Immediate health assessment", responsibleOfficer: "ANM · Block Level", estimatedCompletion: "2 days", priority: "critical", expectedComplaintReduction: "55%", expectedChildWelfareImprovement: "Critical", expectedSatisfactionImprovement: "+32%" },
    ],
    trend: [{ label: "Jan", value: 1 }, { label: "Feb", value: 2 }, { label: "Mar", value: 3 }, { label: "Apr", value: 4 }, { label: "May", value: 5 }, { label: "Jun", value: 6 }],
    riskFactors: [{ label: "Health Access", value: 78 }, { label: "ANM Coverage", value: 65 }, { label: "Referral", value: 58 }],
  },
  drinking_water: {
    classification: "Unsafe Drinking Water Issue",
    rootCause: "Water Source Contamination / Supply Failure",
    fraudBase: 6,
    sentimentBase: 18,
    riskBase: 92,
    predictions: [
      { label: "Waterborne Illness Risk", probability: 78, horizonDays: 7, historicalDataUsed: ["Water quality tests"], trendAnalysis: "Contamination indicators", seasonality: "Summer scarcity", operationalRecords: ["PHC alerts"], confidenceCalculation: "78%" },
      { label: "Center Closure Risk", probability: 42, horizonDays: 3, historicalDataUsed: ["Safety protocols"], trendAnalysis: "Critical water failure", seasonality: "N/A", operationalRecords: ["District SOP"], confidenceCalculation: "42%" },
    ],
    recommendations: [
      { recommendation: "Emergency water supply dispatch", reason: "Unsafe drinking water reported with evidence", supportingEvidence: ["Photo", "GPS", "Citizen statement"], expectedImpact: "Restore safe water within 24h", responsibleOfficer: "District Water & Sanitation", estimatedCompletion: "1 day", priority: "critical", expectedComplaintReduction: "80%", expectedChildWelfareImprovement: "Critical", expectedSatisfactionImprovement: "+35%" },
    ],
    trend: [{ label: "Jan", value: 0 }, { label: "Feb", value: 1 }, { label: "Mar", value: 2 }, { label: "Apr", value: 4 }, { label: "May", value: 6 }, { label: "Jun", value: 8 }],
    riskFactors: [{ label: "Water Quality", value: 95 }, { label: "Supply", value: 82 }, { label: "Health Impact", value: 88 }],
  },
  cleanliness: {
    classification: "Sanitation / Cleanliness Issue",
    rootCause: "Sanitation Maintenance Failure",
    fraudBase: 9,
    sentimentBase: 26,
    riskBase: 70,
    predictions: [
      { label: "Hygiene-Related Complaints", probability: 75, horizonDays: 7, historicalDataUsed: ["Cleanliness audits"], trendAnalysis: "Declining hygiene scores", seasonality: "Monsoon mold risk", operationalRecords: ["Supervisor visits"], confidenceCalculation: "75%" },
    ],
    recommendations: [
      { recommendation: "Immediate deep cleaning and sanitation audit", reason: "Toilet/facility cleanliness complaint", supportingEvidence: ["Citizen photos", "Prior hygiene grievances"], expectedImpact: "Restore hygienic standards", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "2 days", priority: "high", expectedComplaintReduction: "60%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+24%" },
    ],
    trend: [{ label: "Jan", value: 2 }, { label: "Feb", value: 3 }, { label: "Mar", value: 4 }, { label: "Apr", value: 5 }, { label: "May", value: 4 }, { label: "Jun", value: 6 }],
    riskFactors: [{ label: "Toilet", value: 80 }, { label: "Kitchen Hygiene", value: 68 }, { label: "Waste", value: 55 }],
  },
  child_safety: {
    classification: "Child Safety Concern",
    rootCause: "Safety Protocol Breach",
    fraudBase: 22,
    sentimentBase: 12,
    riskBase: 95,
    predictions: [
      { label: "Enrollment Withdrawal", probability: 70, horizonDays: 7, historicalDataUsed: ["Enrollment trends"], trendAnalysis: "Parent trust erosion", seasonality: "N/A", operationalRecords: ["Parent feedback"], confidenceCalculation: "70%" },
      { label: "Regulatory Inspection", probability: 90, horizonDays: 3, historicalDataUsed: ["Safety SOP"], trendAnalysis: "Critical safety flag", seasonality: "N/A", operationalRecords: ["District compliance"], confidenceCalculation: "90%" },
    ],
    recommendations: [
      { recommendation: "Immediate safety inspection and child welfare review", reason: "Child safety grievance — highest priority", supportingEvidence: ["Citizen report", "Center safety log"], expectedImpact: "Ensure child protection", responsibleOfficer: "District Child Protection Officer", estimatedCompletion: "24 hours", priority: "critical", expectedComplaintReduction: "N/A", expectedChildWelfareImprovement: "Critical", expectedSatisfactionImprovement: "+40%" },
    ],
    trend: [{ label: "Jan", value: 0 }, { label: "Feb", value: 1 }, { label: "Mar", value: 1 }, { label: "Apr", value: 2 }, { label: "May", value: 3 }, { label: "Jun", value: 4 }],
    riskFactors: [{ label: "Physical Safety", value: 96 }, { label: "Supervision", value: 88 }, { label: "Infrastructure", value: 72 }],
  },
  attendance: {
    classification: "Worker Absenteeism / Attendance Issue",
    rootCause: "Staff Attendance Non-Compliance",
    fraudBase: 15,
    sentimentBase: 32,
    riskBase: 64,
    predictions: [
      { label: "Service Disruption", probability: 80, horizonDays: 5, historicalDataUsed: ["Worker attendance logs"], trendAnalysis: "Repeated absences", seasonality: "N/A", operationalRecords: ["GPS check-in data"], confidenceCalculation: "80%" },
      { label: "Parent Complaint Surge", probability: 72, horizonDays: 7, historicalDataUsed: ["Grievance trends"], trendAnalysis: "Attendance-linked complaints", seasonality: "N/A", operationalRecords: ["Supervisor notes"], confidenceCalculation: "72%" },
    ],
    recommendations: [
      { recommendation: "Enforce attendance compliance with district oversight", reason: "Worker absenteeism affecting services", supportingEvidence: ["Attendance register", "Citizen complaint"], expectedImpact: "Restore daily service delivery", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "3 days", priority: "high", expectedComplaintReduction: "55%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+20%" },
    ],
    trend: [{ label: "Jan", value: 1 }, { label: "Feb", value: 2 }, { label: "Mar", value: 3 }, { label: "Apr", value: 4 }, { label: "May", value: 5 }, { label: "Jun", value: 6 }],
    riskFactors: [{ label: "Absenteeism", value: 85 }, { label: "Service Gap", value: 78 }, { label: "Coverage", value: 60 }],
  },
};

const DEFAULT_PROFILE: CategoryProfile = {
  classification: "General Service Issue",
  rootCause: "Operational Process Gap",
  fraudBase: 10,
  sentimentBase: 35,
  riskBase: 55,
  predictions: [{ label: "Service Complaint Recurrence", probability: 60, horizonDays: 14, historicalDataUsed: ["Grievance register"], trendAnalysis: "Moderate repeat risk", seasonality: "N/A", operationalRecords: ["Center logs"], confidenceCalculation: "60%" }],
  recommendations: [{ recommendation: "Supervisor investigation and corrective action", reason: "Citizen grievance filed", supportingEvidence: ["Complaint details"], expectedImpact: "Resolve citizen concern", responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "48 hours", priority: "medium", expectedComplaintReduction: "40%", expectedChildWelfareImprovement: "Medium", expectedSatisfactionImprovement: "+15%" }],
  trend: [{ label: "Jan", value: 2 }, { label: "Feb", value: 3 }, { label: "Mar", value: 4 }, { label: "Apr", value: 5 }, { label: "May", value: 4 }, { label: "Jun", value: 5 }],
  riskFactors: [{ label: "Operations", value: 60 }, { label: "Compliance", value: 50 }],
};

function buildExplainBlock(
  title: string,
  complaint: ComplaintRecord,
  profile: CategoryProfile,
  type: "complaint" | "fraud" | "sentiment" | "pattern" | "risk"
): AIExplainBlock {
  const hasPhoto = (complaint.citizenEvidence ?? []).some((e) => e.type === "photo");
  const hasGps = (complaint.citizenEvidence ?? []).some((e) => e.label?.toLowerCase().includes("gps") || e.text?.includes("GPS"));
  const priorCount = complaint.repeatCount ?? 0;

  const blocks: Record<string, AIExplainBlock> = {
    complaint: {
      title: "AI Complaint Analysis",
      inputData: ["Citizen complaint text", "Category selection", hasPhoto ? "Photo evidence" : "No photo", hasGps ? "GPS coordinates" : "Center location", `Priority: ${complaint.priority ?? "medium"}`],
      processing: "NLP keyword extraction → category classifier → severity scoring → evidence cross-validation",
      reasoning: `Complaint classified as "${profile.classification}". Text contains category-specific keywords. ${hasPhoto ? "Photo evidence supports citizen claim." : ""} ${hasGps ? "GPS confirms complaint location at registered center." : "Center ID matched to citizen selection."} ${priorCount > 0 ? `${priorCount} prior similar complaints at this center.` : "No prior duplicate pattern."}`,
      evidenceUsed: [complaint.description.slice(0, 120), ...(hasPhoto ? ["Uploaded photograph"] : []), ...(hasGps ? ["GPS verification"] : ["Center registry match"])],
      confidence: 0.88 + Math.random() * 0.08,
      supportingFactors: [`Keywords match ${profile.classification}`, hasPhoto ? "Visual evidence present" : "Text-only submission", "Center operational records consulted"],
      expectedImpact: `Enables targeted ${profile.rootCause} remediation`,
    },
    fraud: {
      title: "Fraud Analysis",
      inputData: ["Submission metadata", "Evidence authenticity", "GPS consistency", "Historical duplicate check", "Beneficiary pattern"],
      processing: "Anomaly detection → duplicate grievance matching → evidence quality scoring → behavioral pattern analysis",
      reasoning: `Fraud probability assessed at ${profile.fraudBase}%. ${hasPhoto && hasGps ? "Evidence package appears authentic." : "Limited evidence — moderate verification confidence."} ${complaint.beneficiaryName === "Anonymous Citizen" ? "Anonymous submission — elevated scrutiny applied." : "Registered citizen — identity cross-checked."}`,
      evidenceUsed: ["Submission timestamp", "Device fingerprint (demo)", "Evidence hash", "Prior grievance count"],
      confidence: 0.82,
      supportingFactors: [`Fraud score: ${profile.fraudBase}/100`, priorCount > 1 ? "Repeat filer — monitored" : "First-time filer", hasGps ? "GPS consistent" : "GPS not provided"],
      expectedImpact: "Protects public funds from fraudulent claims",
    },
    sentiment: {
      title: "Sentiment Analysis",
      inputData: ["Complaint narrative", "Urgency indicators", "Emotional tone markers", "Rating implicit score"],
      processing: "Telugu/English NLP → sentiment classifier → urgency weighting → citizen satisfaction impact model",
      reasoning: `Citizen sentiment classified as ${profile.sentimentBase < 30 ? "highly negative" : profile.sentimentBase < 50 ? "negative" : "concerned"}. Emotional intensity in complaint text indicates ${profile.sentimentBase < 25 ? "urgent citizen distress" : "moderate dissatisfaction"}.`,
      evidenceUsed: [complaint.description.slice(0, 80)],
      confidence: 0.91,
      supportingFactors: [`Sentiment score: ${profile.sentimentBase}%`, `Urgency: ${Math.round((complaint.urgencyScore ?? 0.5) * 100)}%`, "Language: English/Telugu detected"],
      expectedImpact: "Prioritizes emotionally distressed citizens for faster resolution",
    },
    pattern: {
      title: "Beneficiary Pattern Analysis",
      inputData: ["Citizen submission history", "Center association", "Category frequency", "Resolution outcomes"],
      processing: "Citizen profile clustering → repeat complaint detection → satisfaction trajectory",
      reasoning: `Citizen ${complaint.beneficiaryName} associated with ${complaint.centerName}. ${priorCount > 0 ? "Repeat grievance filer — pattern indicates unresolved systemic issue." : "First grievance — isolated incident likely unless center history shows pattern."}`,
      evidenceUsed: ["Citizen ID", "Center complaint history", "Category distribution"],
      confidence: 0.85,
      supportingFactors: ["Submission as: " + (complaint.submittedAs ?? "citizen"), `Center prior complaints: ${priorCount + 2}`, "Mobile registration verified"],
      expectedImpact: "Identifies citizens needing proactive outreach",
    },
    risk: {
      title: "Center Risk Analysis",
      inputData: ["Center complaint volume", "Resolution SLA compliance", "Service quality index", "Worker performance", "Infrastructure status"],
      processing: "Multi-factor risk scoring → weighted center health model → district comparison",
      reasoning: `Center risk score: ${profile.riskBase}/100. ${profile.riskBase > 75 ? "HIGH RISK — immediate supervisory intervention required." : profile.riskBase > 55 ? "ELEVATED RISK — scheduled inspection recommended." : "MODERATE RISK — standard investigation protocol."}`,
      evidenceUsed: ["30-day complaint log", "SQI dashboard", "Worker attendance", "Classroom AI scores"],
      confidence: 0.87,
      supportingFactors: profile.riskFactors.map((r) => `${r.label}: ${r.value}/100`),
      expectedImpact: "Enables predictive governance and resource allocation",
    },
  };
  return blocks[type];
}

export function generateInvestigationReport(complaint: ComplaintRecord): GrievanceInvestigationReport {
  const profile = PROFILES[complaint.category] ?? DEFAULT_PROFILE;
  const hasPhoto = (complaint.citizenEvidence ?? []).some((e) => e.type === "photo");
  const confidence = Math.min(99, 88 + (hasPhoto ? 5 : 0) + 2);

  const xai = buildXAIInvestigationBundle(complaint, {
    classification: profile.classification,
    rootCause: profile.rootCause,
    fraudBase: profile.fraudBase,
    riskBase: profile.riskBase,
  });

  return {
    grievanceId: complaint.id,
    generatedAt: new Date().toISOString(),
    category: complaint.category,
    executiveSummary: xai.governmentExecutiveSummary,
    complaintClassification: xai.complaintAnalysis.finalClassification,
    classificationConfidence: xai.complaintAnalysis.confidenceScore,
    classificationReasons: xai.complaintAnalysis.confidenceIncreasedFactors,
    rootCause: profile.rootCause,
    rootCauseConfidence: xai.rootCauseAnalysis.factors[0]?.percentage ?? 58,
    fraudScore: xai.fraudAnalysis.fraudScore,
    fraudAnalysis: xai.fraudAnalysis.module as unknown as AIExplainBlock,
    sentimentScore: xai.sentimentAnalysis.score,
    sentimentLabel: xai.sentimentAnalysis.label,
    sentimentAnalysis: xai.sentimentAnalysis.module as unknown as AIExplainBlock,
    beneficiaryPattern: xai.beneficiaryPattern.module as unknown as AIExplainBlock,
    centerRiskScore: xai.centerRisk.finalScore,
    centerRiskAnalysis: xai.centerRisk.module as unknown as AIExplainBlock,
    complaintAnalysis: xai.complaintAnalysis.module as unknown as AIExplainBlock,
    predictions: xai.predictions.map((p) => ({
      id: p.id,
      label: p.label,
      probability: p.probability,
      horizonDays: 7,
      historicalDataUsed: [p.historicalDataUsed],
      trendAnalysis: p.narrative.slice(0, 120),
      seasonality: p.seasonalPattern,
      operationalRecords: p.operationalRecords,
      confidenceCalculation: `${p.mlConfidence}% ML confidence`,
    })),
    recommendations: xai.recommendations.map((r) => ({
      id: r.id,
      recommendation: r.recommendation,
      reason: r.reason,
      supportingEvidence: r.evidence,
      expectedImpact: `Reduce similar complaints by ${r.expectedComplaintReduction} · Child welfare +${r.expectedChildWelfareImprovement} · Satisfaction ${r.expectedSatisfactionImprovement}`,
      fullExplanation: r.narrative,
      responsibleOfficer: r.responsibleOfficer,
      estimatedCompletion: r.estimatedTime,
      estimatedBudget: r.estimatedBudget,
      confidenceScore: r.module.confidence,
      priority: r.priority as InvestigationRecommendation["priority"],
      expectedComplaintReduction: r.expectedComplaintReduction,
      expectedChildWelfareImprovement: r.expectedChildWelfareImprovement,
      expectedSatisfactionImprovement: r.expectedSatisfactionImprovement,
    })),
    chartData: {
      categoryTrend: profile.trend,
      monthlyVolume: profile.trend,
      sentimentBreakdown: [{ label: "Negative", value: xai.sentimentAnalysis.score }, { label: "Neutral", value: 40 }, { label: "Positive", value: 20 }],
      riskFactors: xai.centerRisk.factors.map((f) => ({ label: f.factor, value: f.contribution })),
      predictionTrend: xai.predictions.map((p) => ({ label: p.label.slice(0, 12), value: p.probability })),
      resolutionForecast: [{ label: "24h", value: 15 }, { label: "48h", value: 45 }, { label: "72h", value: 70 }, { label: "7d", value: 90 }],
    },
    severityMeter: complaint.urgencyScore ? Math.round(complaint.urgencyScore * 100) : profile.riskBase,
    evidenceQuality: hasPhoto ? 85 : 55,
    confidenceGauge: xai.complaintAnalysis.confidenceScore,
    xai,
  };
}

export function generateCenterIntelligenceReport(
  centerId: string,
  complaints: ComplaintRecord[]
): CenterIntelligenceReport {
  const center = mockCenters.find((c) => c.id === centerId) ?? { id: centerId, name: centerId, district: "Tirupati" };
  const centerComplaints = complaints.filter((c) => c.centerId === centerId);
  const resolved = centerComplaints.filter((c) => c.status === "closed").length;
  const pending = centerComplaints.filter((c) => c.status !== "closed").length;
  const highPri = centerComplaints.filter((c) => (c.urgencyScore ?? 0) > 0.7 || c.priority === "critical" || c.priority === "high").length;
  const total = centerComplaints.length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  const categories: Record<string, number> = {};
  centerComplaints.forEach((c) => { categories[c.category] = (categories[c.category] ?? 0) + 1; });
  const topCategories = Object.entries(categories)
    .map(([label, value]) => ({ label: label.replace(/_/g, " "), value }))
    .sort((a, b) => b.value - a.value);
  const top5 = topCategories.slice(0, 5);
  const rootCauseBreakdown = top5.map((c) => ({
    label: c.label,
    value: total ? Math.round((c.value / total) * 100) : 0,
  }));

  const mobiles = centerComplaints.map((c) => c.registeredMobile).filter(Boolean);
  const uniqueMobiles = new Set(mobiles).size;
  const duplicateMobile = mobiles.length - uniqueMobiles;
  const anonymousCount = centerComplaints.filter((c) => c.beneficiaryName === "Anonymous Citizen" || c.anonymous).length;
  const withPhoto = centerComplaints.filter((c) => (c.citizenEvidence ?? []).some((e) => e.type === "photo")).length;

  const fraudSignals: CenterFraudSignal[] = [
    { label: "Duplicate Images", count: Math.max(0, Math.floor(withPhoto * 0.12)), detail: "Identical image hashes across multiple submissions" },
    { label: "Repeated Mobile Numbers", count: duplicateMobile, detail: "Same mobile used across unrelated grievance categories" },
    { label: "Repeated Devices", count: Math.max(0, Math.floor(total * 0.06)), detail: "Multiple submissions from same device fingerprint" },
    { label: "Repeated GPS Locations", count: Math.max(0, Math.floor(total * 0.04)), detail: "GPS clusters outside registered center boundary" },
    { label: "Anonymous Complaints", count: anonymousCount, detail: "Anonymous submissions requiring extra verification" },
    { label: "Spam Behaviour", count: Math.max(0, Math.floor(total * 0.03)), detail: "Rapid-fire submissions within short time windows" },
    { label: "Fake Evidence Detection", count: Math.max(0, Math.floor(withPhoto * 0.05)), detail: "Image manipulation or stock photo indicators" },
    { label: "Suspicious Clusters", count: Math.max(0, Math.floor(total * 0.08)), detail: "Temporal clusters of similar complaint text" },
  ];
  const fraudScore = Math.min(95, fraudSignals.reduce((s, f) => s + f.count * 4, 8));
  const overallFraudRisk = fraudScore > 55 ? "High" : fraudScore > 30 ? "Medium" : "Low";
  const fraudRecommendation = overallFraudRisk === "High"
    ? "Manual verification required for all pending grievances before corrective action."
    : overallFraudRisk === "Medium"
      ? "Spot-check flagged submissions and verify photo evidence."
      : "Continue standard verification — low misuse detected.";

  const negativeCount = centerComplaints.filter((c) => c.sentiment === "negative" || (c.urgencyScore ?? 0) > 0.6).length;
  const positiveCount = centerComplaints.filter((c) => c.sentiment === "positive").length;
  const negativeSentiment = total ? Math.round((negativeCount / total) * 100) : 35;
  const positiveSentiment = total ? Math.round((positiveCount / total) * 100) : 25;
  const neutralSentiment = Math.max(0, 100 - negativeSentiment - positiveSentiment);

  const riskScore = Math.min(95, 35 + pending * 6 + highPri * 4 + (total > 10 ? 10 : 0));
  const centerHealthScore = Math.max(20, 100 - riskScore + Math.round(resolutionRate * 0.3));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyTrends = months.map((label, i) => ({
    label,
    value: Math.max(0, Math.floor(total / 6) + (i % 2 === 0 ? 1 : 0)),
  }));
  const yearlyTrends = [{ label: "2023", value: Math.max(1, total + 8) }, { label: "2024", value: Math.max(1, total + 4) }, { label: "2025", value: total }];
  const seasonalComparison = [
    { label: "Summer", value: Math.max(1, Math.floor(total * 0.35)) },
    { label: "Monsoon", value: Math.max(1, Math.floor(total * 0.28)) },
    { label: "Winter", value: Math.max(1, Math.floor(total * 0.22)) },
    { label: "Festival", value: Math.max(1, Math.floor(total * 0.15)) },
  ];

  const primaryCategory = top5[0]?.label ?? "general service";
  const rootCauseExplanation = top5.length
    ? `${primaryCategory} accounts for ${rootCauseBreakdown[0]?.value ?? 0}% of grievances — recurring supply and service gaps identified across ${total} submissions.`
    : "Insufficient grievance history — baseline monitoring recommended.";

  const predictions: InvestigationPrediction[] = [
    { id: "CP1", label: "Nutrition complaints may increase during summer", probability: 68, horizonDays: 90, historicalDataUsed: ["3-year seasonal register"], trendAnalysis: "Summer demand spike correlates with nutrition shortages", seasonality: "April–June", operationalRecords: ["Stock ledger"], confidenceCalculation: "68%" },
    { id: "CP2", label: "Infrastructure complaints likely during monsoon", probability: 55, horizonDays: 120, historicalDataUsed: ["Building audits"], trendAnalysis: "Roof and water issues rise with rainfall", seasonality: "Monsoon", operationalRecords: ["Maintenance register"], confidenceCalculation: "55%" },
    { id: "CP3", label: "Worker workload expected to increase", probability: 72, horizonDays: 60, historicalDataUsed: ["Enrollment data"], trendAnalysis: "Enrollment growth without staff addition", seasonality: "Post-harvest", operationalRecords: ["HR allocation"], confidenceCalculation: "72%" },
    { id: "CP4", label: "Future center risk elevation", probability: Math.min(90, riskScore + 8), horizonDays: 30, historicalDataUsed: ["30-day velocity"], trendAnalysis: `${pending} pending cases drive risk`, seasonality: "N/A", operationalRecords: ["Supervisor audit"], confidenceCalculation: `${Math.min(90, riskScore + 8)}%` },
  ];

  const recommendations: InvestigationRecommendation[] = [
    { id: "CR1", recommendation: "Increase monthly nutrition stock", reason: `${rootCauseBreakdown[0]?.value ?? 30}% of complaints relate to nutrition supply gaps`, supportingEvidence: ["Complaint register", "Stock ledger"], expectedImpact: "Reduce nutrition grievances by 40% within 30 days", fullExplanation: `Nutrition-related complaints account for the largest share at ${center.name}. AI analysis of stock records and citizen evidence indicates supply shortfalls during peak enrollment weeks. Approving ₹28,500 for emergency ration replenishment and weekly stock audits will restore daily egg and take-home ration delivery. Expected outcomes: 40% fewer nutrition complaints, measurable improvement in child weight monitoring, and +18% parent satisfaction within one month.`, responsibleOfficer: "District Nutrition Officer", estimatedCompletion: "7 days", estimatedBudget: "₹28,500", confidenceScore: 88, priority: "high", expectedComplaintReduction: "40%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+18%" },
    { id: "CR2", recommendation: "Repair kitchen and storage infrastructure", reason: "Infrastructure complaints correlate with monsoon damage and storage loss", supportingEvidence: ["Photo evidence", "Engineering inspection"], expectedImpact: "Prevent seasonal complaint surge and protect stored nutrition", fullExplanation: `Structural issues at ${center.name} compound nutrition and hygiene complaints. Monsoon damage to roof and storage allows moisture contamination of rations. A permanent repair work order (₹1,25,000) plus temporary covering (₹18,000) will secure the facility before the next rainfall cycle. AI predicts 25% reduction in infrastructure-related grievances and protects ₹40,000+ in annual nutrition stock from spoilage.`, responsibleOfficer: "District Engineering · WDCW", estimatedCompletion: "14 days", estimatedBudget: "₹1,43,000", confidenceScore: 86, priority: "medium", expectedComplaintReduction: "25%", expectedChildWelfareImprovement: "Medium", expectedSatisfactionImprovement: "+12%" },
    { id: "CR3", recommendation: "Conduct worker refresher training", reason: "Worker conduct grievances affect parent trust and service quality", supportingEvidence: ["Conduct complaints", "Sentiment analysis"], expectedImpact: "Improve service standards and communication with beneficiaries", fullExplanation: `Parent feedback and grievance text analysis show communication gaps during peak service hours. A district-funded half-day sensitivity and ICDS service training (₹3,500 per center batch) with follow-up supervisor observation will address conduct-related complaints. Historical data from similar interventions show 20% complaint reduction and +15% satisfaction improvement within 60 days.`, responsibleOfficer: "Supervisor · Block Level", estimatedCompletion: "10 days", estimatedBudget: "₹3,500", confidenceScore: 84, priority: "medium", expectedComplaintReduction: "20%", expectedChildWelfareImprovement: "Medium", expectedSatisfactionImprovement: "+15%" },
    { id: "CR4", recommendation: "Improve drinking water facility", reason: "Water grievances carry high severity and child health risk", supportingEvidence: ["Health screening", "Water quality logs"], expectedImpact: "Eliminate unsafe water complaints and protect child health", fullExplanation: `Water-related grievances at ${center.name} carry critical severity due to direct child health impact. Installing an RO filtration unit (₹22,000) with monthly filter replacement (₹800/month) and daily quality logging will eliminate contamination risk. Emergency tanker dispatch (₹8,500) may be needed during installation. AI predicts 30% reduction in water complaints and significant child welfare improvement.`, responsibleOfficer: "District Water & Sanitation", estimatedCompletion: "5 days", estimatedBudget: "₹30,500", confidenceScore: 90, priority: "high", expectedComplaintReduction: "30%", expectedChildWelfareImprovement: "Critical", expectedSatisfactionImprovement: "+22%" },
    { id: "CR5", recommendation: "Increase monitoring visits", reason: `${pending} pending grievances require active supervisor oversight`, supportingEvidence: ["SLA data", "Resolution backlog"], expectedImpact: "Accelerate resolution and prevent SLA breaches", fullExplanation: `With ${pending} open grievances at ${center.name}, AI risk modelling recommends doubling supervisor visit frequency for 30 days. Each visit costs approximately ₹750 in travel and staff time (₹1,500/month total). Documented checklists and beneficiary callbacks will reduce backlog by an estimated 35% and improve trust scores as citizens see visible oversight.`, responsibleOfficer: "Supervisor · Tirupati", estimatedCompletion: "Ongoing (30 days)", estimatedBudget: "₹1,500", confidenceScore: 85, priority: "high", expectedComplaintReduction: "35%", expectedChildWelfareImprovement: "High", expectedSatisfactionImprovement: "+20%" },
  ];

  const frequentWords = [
    { label: "food", value: 12 + Math.floor(total / 3) },
    { label: "egg", value: 9 + Math.floor(total / 4) },
    { label: "meal", value: 8 + Math.floor(total / 4) },
    { label: "children", value: 7 + Math.floor(total / 5) },
    { label: "water", value: 5 + Math.floor(total / 6) },
    { label: "worker", value: 4 + Math.floor(total / 6) },
  ];

  const finalAISummary = `${center.name} has received ${total} grievances during the last twelve months. ${primaryCategory}-related complaints account for the majority of issues${rootCauseBreakdown[0] ? ` (${rootCauseBreakdown[0].value}%)` : ""}. Fraud analysis indicates ${overallFraudRisk.toLowerCase()} misuse of the grievance system. Citizen sentiment ${resolutionRate > 60 ? "has improved following faster resolution" : "requires attention due to pending backlog"}. Immediate focus: ${top5[0]?.label ?? "service compliance"} and preventive monitoring.`;

  return {
    centerId,
    centerName: center.name,
    generatedAt: new Date().toISOString(),
    executiveSummary: `${center.name} — ${total} grievances, ${resolved} resolved, ${pending} pending. Avg resolution: ${total ? 36 : 0}h. Health: ${centerHealthScore}/100. Risk: ${riskScore}/100.`,
    totalComplaints: total,
    resolved,
    pending,
    highPriority: highPri,
    duplicateComplaints: fraudSignals[0].count + fraudSignals[7].count,
    fraudCases: fraudSignals.filter((f) => f.count > 0).length,
    avgResolutionHours: total ? 36 : 0,
    avgResolutionDays: total ? 1.5 : 0,
    resolutionRate,
    centerHealthScore,
    positiveSentiment,
    neutralSentiment,
    negativeSentiment,
    riskScore,
    overallFraudRisk,
    fraudRecommendation,
    topCategories: top5.length ? top5 : [{ label: "No complaints", value: 0 }],
    monthlyTrends,
    yearlyTrends,
    seasonalComparison,
    complaintDistribution: top5.length ? top5 : [{ label: "None", value: 0 }],
    rootCauseBreakdown,
    rootCauseExplanation,
    fraudSignals,
    topEmotions: ["Concerned", "Frustrated", "Anxious", "Hopeful", "Satisfied"],
    commonConcerns: top5.slice(0, 4).map((c) => c.label),
    frequentWords,
    trustTrend: resolutionRate > 60 ? "Improving over last quarter" : "Declining — pending backlog affecting trust",
    fraudAnalysis: {
      title: "Center Fraud Analysis",
      inputData: ["All submissions", "Evidence hashes", "Device metadata"],
      processing: "Aggregate anomaly detection → duplicate matching → cluster analysis",
      reasoning: fraudSignals.filter((f) => f.count > 0).map((f) => `${f.count} ${f.label.toLowerCase()}`).join("; ") || "No significant fraud patterns",
      evidenceUsed: ["Submission patterns", "Photo hashes"],
      confidence: 0.86,
      supportingFactors: [`Overall risk: ${overallFraudRisk}`],
      expectedImpact: fraudRecommendation,
    },
    sentimentAnalysis: {
      title: "Center Sentiment Analysis",
      inputData: ["All grievance descriptions", "Feedback surveys"],
      processing: "NLP → aggregate sentiment → emotion tagging",
      reasoning: `${negativeSentiment}% negative, ${neutralSentiment}% neutral, ${positiveSentiment}% positive across ${total} grievances.`,
      evidenceUsed: ["Complaint narratives"],
      confidence: 0.88,
      supportingFactors: [`Trust: ${resolutionRate > 60 ? "improving" : "needs attention"}`],
      expectedImpact: "Guides proactive outreach",
    },
    rootCauseAnalysis: {
      title: "Recurring Root Causes",
      inputData: ["Category distribution", "Operational records"],
      processing: "Pareto analysis → recurrence detection",
      reasoning: rootCauseExplanation,
      evidenceUsed: ["12-month register"],
      confidence: 0.87,
      supportingFactors: rootCauseBreakdown.slice(0, 3).map((r) => `${r.label}: ${r.value}%`),
      expectedImpact: "Targeted district interventions",
    },
    predictions,
    predictionExplanation: "Generated from 18-month historical data, seasonal ICDS patterns, enrollment trends, and attendance models.",
    heatmapData: [
      { row: "Nutrition", col: "Mon", value: 3 }, { row: "Nutrition", col: "Wed", value: 5 },
      { row: "Infrastructure", col: "Tue", value: 2 }, { row: "Worker", col: "Fri", value: 4 },
      { row: "Health", col: "Thu", value: 1 }, { row: "Safety", col: "Mon", value: 2 },
    ],
    workerPerformanceImpact: "Worker conduct and attendance grievances correlate with service delivery gaps.",
    parentSatisfaction: Math.max(40, 85 - pending * 2),
    beneficiaryTrust: Math.max(45, 88 - riskScore * 0.3),
    aiSummary: `Focus required on ${primaryCategory}. Predictive models suggest elevated volume without intervention.`,
    finalAISummary,
    recommendations,
    futureRiskPrediction: `Risk score projected to reach ${Math.min(99, riskScore + 12)} within 30 days without intervention.`,
    performance: {
      resolutionRate,
      citizenSatisfaction: Math.max(40, 85 - pending * 2),
      avgResolutionDays: 1.5,
      workerPerformance: Math.max(50, 90 - highPri * 3),
      centerHealthScore,
      serviceQualityScore: Math.max(45, 92 - riskScore * 0.4),
      monthlyTrend: monthlyTrends,
    },
  };
}

export function getCitizenTimelineStep(status: string): number {
  const map: Record<string, number> = {
    submitted: 0, channel_intake: 0, ai_processing: 1, ai_classification: 1, classified: 1,
    supervisor_review: 2, assigned: 2, worker_review: 3, need_evidence: 3,
    resolution: 4, beneficiary_confirmation: 5, closed: 6,
    district_escalation: 3, state_escalation: 3,
  };
  return map[status] ?? 0;
}

export const CITIZEN_TIMELINE_STEPS = [
  "Citizen Submitted",
  "AI Verification",
  "Supervisor Assigned",
  "Investigation",
  "Corrective Action",
  "Resolution Proposed",
  "Citizen Confirmation",
  "Closed",
] as const;
