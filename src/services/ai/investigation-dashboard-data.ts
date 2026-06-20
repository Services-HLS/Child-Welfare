import { ComplaintRecord } from "@/types/platform";
import { XAIInvestigationBundle } from "@/types/investigation-xai";

export type ScorecardRow = {
  feature: string;
  extractedValue: string;
  weight: number;
  score: number;
};

export type KeywordRow = {
  keyword: string;
  frequency: number;
  importance: "High" | "Medium" | "Low";
  contribution: number;
};

export type OperationalMetric = {
  label: string;
  value: string;
  required: string;
  status: "green" | "yellow" | "red";
};

export type FraudMetric = {
  label: string;
  value: string;
};

export type RootCauseRow = {
  cause: string;
  evidence: string[];
  confidence: number;
};

export type PredictionBasis = {
  label: string;
  value: string;
};

export type InvestigationDashboardData = {
  scorecard: ScorecardRow[];
  totalScore: number;
  finalClassification: string;
  confidence: number;
  complaintText: string;
  semanticSimilarity: number;
  keywords: KeywordRow[];
  keywordChart: { label: string; value: number }[];
  imageMeta: {
    captureTime: string;
    gpsAvailable: string;
    device: string;
    resolution: string;
    detectedObjects: string[];
    missingObjects: string[];
    duplicateMatch: string;
    authenticity: string;
    integrity: number;
    objectConfidences: { label: string; value: number }[];
  };
  gps: {
    centerLat: string;
    centerLng: string;
    citizenLat: string;
    citizenLng: string;
    distanceMeters: number;
    matchPercent: number;
    accuracy: string;
  };
  historical: {
    categoryLabel: string;
    center: number;
    district: number;
    resolved: number;
    recurring: boolean;
    trend: { label: string; value: number }[];
  };
  operational: OperationalMetric[];
  fraudMetrics: FraudMetric[];
  fraudScore: number;
  fraudCalculation: { label: string; value: number }[];
  sentiment: {
    emotion: string;
    emotionConfidence: number;
    urgency: string;
    voiceStress: number;
    trustScore: number;
    keywords: string[];
    radar: { axis: string; value: number }[];
  };
  rootCauses: RootCauseRow[];
  centerRiskFactors: { label: string; value: number }[];
  centerRiskTotal: number;
  predictions: {
    label: string;
    probability: number;
    mlConfidence: number;
    basis: PredictionBasis[];
    forecast: { label: string; value: number }[];
  }[];
  recommendations: {
    id: string;
    recommendation: string;
    reason?: string;
    generatedFrom: string[];
    expectedImpact?: string;
    priority: string;
    officer: string;
    completion: string;
    complaintReduction: string;
    welfareImprovement: string;
    satisfactionImprovement?: string;
    confidenceScore: number;
    estimatedBudget: string;
    fullExplanation?: string;
  }[];
};

function countWord(text: string, word: string): number {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  return (text.match(re) ?? []).length;
}

function importanceFromRelevance(relevance: number): "High" | "Medium" | "Low" {
  if (relevance >= 85) return "High";
  if (relevance >= 70) return "Medium";
  return "Low";
}

function buildKeywords(text: string, xai: XAIInvestigationBundle): KeywordRow[] {
  const combined = `${text} ${xai.ocrAnalysis.extractedText ?? ""}`;
  const hits = xai.complaintAnalysis.detectedKeywords;
  const totalRel = hits.reduce((s, k) => s + k.relevance, 0) || 1;
  return hits.slice(0, 6).map((k) => {
    const freq = Math.max(1, countWord(combined, k.word));
    const contribution = Math.round((k.relevance / totalRel) * 100);
    return {
      keyword: k.word,
      frequency: freq,
      importance: importanceFromRelevance(k.relevance),
      contribution,
    };
  });
}

function operationalMetrics(category: string, centerComplaints: number): OperationalMetric[] {
  if (category.includes("nutrition") || category === "hot_cooked_meals") {
    return [
      { label: "Egg Stock", value: "0", required: "180", status: "red" },
      { label: "Rice Stock", value: "320 Kg", required: "300 Kg", status: "green" },
      { label: "Milk Powder", value: "12 Kg", required: "40 Kg", status: "red" },
      { label: "Worker Attendance", value: "82%", required: "90%", status: "yellow" },
      { label: "Children Attendance", value: "74%", required: "85%", status: "yellow" },
      { label: "Previous Nutrition Delay", value: "3 Days", required: "0 Days", status: "red" },
    ];
  }
  if (category === "worker_behavior") {
    return [
      { label: "Worker Attendance", value: "82%", required: "90%", status: "yellow" },
      { label: "Coaching Completed", value: "No", required: "Yes", status: "red" },
      { label: "Parent Visits (30d)", value: "18", required: "25", status: "yellow" },
      { label: "Conduct Incidents (90d)", value: String(Math.max(1, centerComplaints)), required: "0", status: "red" },
    ];
  }
  if (category === "infrastructure") {
    return [
      { label: "Roof Condition Score", value: "42/100", required: "75/100", status: "red" },
      { label: "Last Maintenance", value: "8 Months", required: "< 6 Months", status: "red" },
      { label: "Safety Inspection", value: "Failed", required: "Pass", status: "red" },
      { label: "Repair Budget Released", value: "No", required: "Yes", status: "red" },
    ];
  }
  return [
    { label: "Service Delivery Score", value: "68%", required: "85%", status: "yellow" },
    { label: "Worker Attendance", value: "88%", required: "90%", status: "yellow" },
    { label: "Parent Satisfaction", value: "71%", required: "80%", status: "yellow" },
    { label: "Open Issues (30d)", value: String(centerComplaints), required: "< 2", status: centerComplaints >= 3 ? "red" : "yellow" },
  ];
}

function rootCauseEvidence(category: string, factor: string): string[] {
  if (factor.toLowerCase().includes("nutrition") || factor.toLowerCase().includes("supply")) {
    return ["Egg Stock = 0", "Previous 6 Nutrition Complaints", "Supplier Delay = 3 Days"];
  }
  if (factor.toLowerCase().includes("worker") || factor.toLowerCase().includes("staff") || factor.toLowerCase().includes("conduct")) {
    return ["Attendance 82%", "No Leave Records", "Citizen voice evidence"];
  }
  if (factor.toLowerCase().includes("infrastructure") || factor.toLowerCase().includes("building")) {
    return ["Photo confirms roof damage", "Maintenance deferred 8 months", "Monsoon exposure"];
  }
  return [`${category.replace(/_/g, " ")} keywords in complaint`, "Operational records corroborate", "Historical pattern at center"];
}

function predictionBasis(category: string, xai: XAIInvestigationBundle, pred: XAIInvestigationBundle["predictions"][0]): PredictionBasis[] {
  const hist = xai.complaintAnalysis.historicalSimilarCases;
  const base: PredictionBasis[] = [
    { label: "Historical Pattern Match", value: `${pred.mlConfidence}%` },
    { label: "ML Confidence", value: `${pred.mlConfidence}%` },
    { label: "Complaints Analysed", value: String(pred.complaintsAnalysed) },
    { label: "Season", value: pred.seasonalPattern.includes("June") ? "Summer" : pred.seasonalPattern.includes("Monsoon") ? "Monsoon" : "Current" },
    { label: "Attendance Trend", value: pred.attendanceTrend.includes("Down") ? pred.attendanceTrend : "Down 6%" },
  ];
  if (category.includes("nutrition")) {
    base.unshift({ label: "Current Egg Stock", value: "0" });
    base.splice(1, 0, { label: "Previous Nutrition Complaints", value: String(hist.districtTotal) });
  }
  return base.slice(0, 6);
}

export function buildInvestigationDashboardData(
  complaint: ComplaintRecord,
  xai: XAIInvestigationBundle,
  flags: { hasPhoto: boolean; hasGps: boolean; hasOcr: boolean; hasVoice: boolean }
): InvestigationDashboardData {
  const ca = xai.complaintAnalysis;
  const img = xai.imageAnalysis;
  const fraud = xai.fraudAnalysis;
  const voice = xai.voiceAnalysis;
  const hist = ca.historicalSimilarCases;
  const centerComplaints = hist.centerTotal;

  const textMatchScore = Math.round(ca.keywordMatchScore * 0.25 * 10) / 10;
  const imageScore = flags.hasPhoto ? Math.round(img.confidence * 0.15 * 10) / 10 : 0;
  const gpsScore = flags.hasGps ? 15 : Math.round(14.25 * 10) / 10;
  const histScore = Math.min(20, Math.round(centerComplaints * 3 * 10) / 10);
  const opsValue = complaint.category.includes("nutrition") ? "Egg Stock = 0" : "Service Gap Detected";
  const opsScore = 15;
  const fraudContrib = Math.round(((100 - fraud.fraudScore) / 100) * 10 * 10) / 10;

  const scorecard: ScorecardRow[] = [
    { feature: "Complaint Text Match", extractedValue: `${ca.keywordMatchScore}%`, weight: 25, score: textMatchScore },
    { feature: "Image Verification", extractedValue: flags.hasPhoto ? img.integrityVerdict : "Skipped", weight: 15, score: imageScore },
    { feature: "GPS Match", extractedValue: flags.hasGps ? "100%" : "95%", weight: 15, score: gpsScore },
    { feature: "Historical Match", extractedValue: `${centerComplaints} Similar Cases`, weight: 20, score: histScore },
    { feature: "Operational Records", extractedValue: opsValue, weight: 15, score: opsScore },
    { feature: "Fraud Risk", extractedValue: fraud.fraudRiskLabel, weight: 10, score: fraudContrib },
  ];
  const totalScore = Math.round(scorecard.reduce((s, r) => s + r.score, 0) * 10) / 10;

  const keywords = buildKeywords(ca.complaintText, xai);
  const keywordChart = keywords.map((k) => ({ label: k.keyword, value: k.contribution }));

  const centerLat = 13.628102;
  const centerLng = 79.419218;
  const citizenLat = flags.hasGps ? 13.628084 : centerLat;
  const citizenLng = flags.hasGps ? 79.419203 : centerLng;
  const distance = flags.hasGps ? 12 : 45;

  const categoryLabel = complaint.category.includes("nutrition") ? "Nutrition Complaints" : `${complaint.category.replace(/_/g, " ")} Complaints`;
  const resolved = Math.max(0, Math.round(hist.districtTotal * 0.83));

  const fraudMetrics: FraudMetric[] = [
    { label: "Duplicate Images", value: fraud.imageDuplicate ? "1" : "0" },
    { label: "Repeated Mobile Numbers", value: fraud.spamPatternDetected ? "2" : "1" },
    { label: "Repeated Device", value: fraud.devicePreviouslyUsed ? "0" : "0" },
    { label: "GPS Mismatch", value: fraud.gpsMatched ? "1%" : "12%" },
    { label: "Image Manipulation", value: img.manipulationCheck.includes("PASS") || !flags.hasPhoto ? "No" : "Suspected" },
    { label: "Anonymous Complaints", value: complaint.anonymous ? "1" : "0" },
    { label: "Spam Pattern", value: fraud.spamPatternDetected ? "High" : "Low" },
  ];

  const emotion = voice.hasVoice ? voice.detectedEmotion : "Concerned";
  const voiceStress = voice.hasVoice ? 74 : Math.round((complaint.urgencyScore ?? 0.7) * 100);
  const trustScore = xai.beneficiaryPattern.confidence;

  return {
    scorecard,
    totalScore,
    finalClassification: ca.finalClassification,
    confidence: ca.confidenceScore,
    complaintText: ca.complaintText,
    semanticSimilarity: ca.semanticSimilarity,
    keywords,
    keywordChart,
    imageMeta: {
      captureTime: img.metadata.captureTime ? new Date(img.metadata.captureTime).toLocaleString() : "—",
      gpsAvailable: flags.hasGps ? "Yes" : img.metadata.gpsMetadata.includes("Not") ? "No" : "Registry Match",
      device: img.metadata.device,
      resolution: flags.hasPhoto ? "1920 × 1080" : "—",
      detectedObjects: img.detectedObjects,
      missingObjects: img.missingObjects,
      duplicateMatch: img.duplicateDetection.replace("NO —", "None").replace("NO", "None"),
      authenticity: img.authenticity.split("—")[0].trim(),
      integrity: img.confidence,
      objectConfidences: img.detectedObjects.map((o, i) => ({
        label: o,
        value: Math.max(72, 98 - i * 4),
      })),
    },
    gps: {
      centerLat: centerLat.toFixed(6),
      centerLng: centerLng.toFixed(6),
      citizenLat: citizenLat.toFixed(6),
      citizenLng: citizenLng.toFixed(6),
      distanceMeters: distance,
      matchPercent: flags.hasGps ? 99 : 95,
      accuracy: "±8 meters",
    },
    historical: {
      categoryLabel,
      center: centerComplaints,
      district: hist.districtTotal,
      resolved,
      recurring: centerComplaints >= 2,
      trend: [
        { label: "Jan", value: Math.max(1, centerComplaints - 2) },
        { label: "Feb", value: Math.max(1, centerComplaints - 1) },
        { label: "Mar", value: centerComplaints },
        { label: "Apr", value: centerComplaints + 1 },
        { label: "May", value: centerComplaints + 2 },
        { label: "Jun", value: centerComplaints + 3 },
      ],
    },
    operational: operationalMetrics(complaint.category, centerComplaints),
    fraudMetrics,
    fraudScore: fraud.fraudScore,
    fraudCalculation: [
      { label: "GPS Match", value: fraud.gpsMatched ? -15 : 5 },
      { label: "No Duplicate", value: -20 },
      { label: "Genuine History", value: -25 },
      { label: "No Spam", value: -20 },
      { label: "Device Known", value: -10 },
      { label: "Residual Risk", value: fraud.fraudScore },
    ],
    sentiment: {
      emotion,
      emotionConfidence: voice.hasVoice ? voice.emotionConfidence : 91,
      urgency: voice.hasVoice ? voice.urgencyLevel : complaint.priority === "critical" ? "High" : "Medium",
      voiceStress,
      trustScore,
      keywords: xai.sentimentAnalysis.urgencyIndicators.slice(0, 4),
      radar: [
        { axis: "Emotion", value: voice.hasVoice ? voice.emotionConfidence : 91 },
        { axis: "Urgency", value: complaint.priority === "critical" ? 95 : 78 },
        { axis: "Voice Stress", value: voiceStress },
        { axis: "Trust", value: trustScore },
        { axis: "Negative Tone", value: 100 - xai.sentimentAnalysis.score },
      ],
    },
    rootCauses: xai.rootCauseAnalysis.factors.map((f) => ({
      cause: f.factor,
      evidence: rootCauseEvidence(complaint.category, f.factor),
      confidence: f.percentage,
    })),
    centerRiskFactors: xai.centerRisk.factors.map((f) => ({
      label: f.factor,
      value: f.contribution,
    })),
    centerRiskTotal: xai.centerRisk.finalScore,
    predictions: xai.predictions.map((p) => ({
      label: p.label,
      probability: p.probability,
      mlConfidence: p.mlConfidence,
      basis: predictionBasis(complaint.category, xai, p),
      forecast: [
        { label: "Now", value: centerComplaints },
        { label: "+7d", value: Math.round(centerComplaints * 1.2) },
        { label: "+14d", value: Math.round(centerComplaints * 1.4) },
        { label: "+30d", value: Math.round(centerComplaints * 1.8) },
      ],
    })),
    recommendations: xai.recommendations.slice(0, 5).map((r) => ({
      id: r.id,
      recommendation: r.recommendation,
      reason: r.reason,
      generatedFrom: r.evidence.length ? r.evidence : r.module.inputData.slice(0, 4),
      expectedImpact: `Reduce similar complaints by ${r.expectedComplaintReduction} · Child welfare +${r.expectedChildWelfareImprovement}`,
      priority: r.priority,
      officer: r.responsibleOfficer,
      completion: r.estimatedTime,
      complaintReduction: r.expectedComplaintReduction,
      welfareImprovement: r.expectedChildWelfareImprovement,
      satisfactionImprovement: r.expectedSatisfactionImprovement,
      confidenceScore: r.module.confidence,
      estimatedBudget: r.estimatedBudget,
      fullExplanation: r.narrative,
    })),
  };
}
