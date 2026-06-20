import { ComplaintCategory } from "./platform";

export interface AIReasoningStep {
  label: string;
  detail: string;
  weight: number;
}

export interface AIExplainBlock {
  title: string;
  inputData: string[];
  processing: string;
  reasoning: string;
  evidenceUsed: string[];
  confidence: number;
  supportingFactors: string[];
  expectedImpact: string;
}

export interface InvestigationPrediction {
  id: string;
  label: string;
  probability: number;
  horizonDays: number;
  historicalDataUsed: string[];
  trendAnalysis: string;
  seasonality: string;
  operationalRecords: string[];
  confidenceCalculation: string;
}

export interface InvestigationRecommendation {
  id: string;
  recommendation: string;
  reason: string;
  supportingEvidence: string[];
  expectedImpact: string;
  fullExplanation?: string;
  responsibleOfficer: string;
  estimatedCompletion: string;
  estimatedBudget?: string;
  confidenceScore?: number;
  priority: "low" | "medium" | "high" | "critical";
  expectedComplaintReduction: string;
  expectedChildWelfareImprovement: string;
  expectedSatisfactionImprovement: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface GrievanceInvestigationReport {
  grievanceId: string;
  generatedAt: string;
  category: ComplaintCategory;
  executiveSummary: string;
  complaintClassification: string;
  classificationConfidence: number;
  classificationReasons: string[];
  rootCause: string;
  rootCauseConfidence: number;
  fraudScore: number;
  fraudAnalysis: AIExplainBlock;
  sentimentScore: number;
  sentimentLabel: string;
  sentimentAnalysis: AIExplainBlock;
  beneficiaryPattern: AIExplainBlock;
  centerRiskScore: number;
  centerRiskAnalysis: AIExplainBlock;
  complaintAnalysis: AIExplainBlock;
  predictions: InvestigationPrediction[];
  recommendations: InvestigationRecommendation[];
  chartData: {
    categoryTrend: ChartDataPoint[];
    monthlyVolume: ChartDataPoint[];
    sentimentBreakdown: ChartDataPoint[];
    riskFactors: ChartDataPoint[];
    predictionTrend: ChartDataPoint[];
    resolutionForecast: ChartDataPoint[];
  };
  severityMeter: number;
  evidenceQuality: number;
  confidenceGauge: number;
  /** Full Explainable AI investigation bundle */
  xai: import("./investigation-xai").XAIInvestigationBundle;
}

export interface CenterFraudSignal {
  label: string;
  count: number;
  detail: string;
}

export interface CenterPerformanceMetrics {
  resolutionRate: number;
  citizenSatisfaction: number;
  avgResolutionDays: number;
  workerPerformance: number;
  centerHealthScore: number;
  serviceQualityScore: number;
  monthlyTrend: ChartDataPoint[];
}

export interface CenterIntelligenceReport {
  centerId: string;
  centerName: string;
  generatedAt: string;
  executiveSummary: string;
  totalComplaints: number;
  resolved: number;
  pending: number;
  highPriority: number;
  duplicateComplaints: number;
  fraudCases: number;
  avgResolutionHours: number;
  avgResolutionDays: number;
  resolutionRate: number;
  centerHealthScore: number;
  positiveSentiment: number;
  neutralSentiment: number;
  negativeSentiment: number;
  riskScore: number;
  overallFraudRisk: string;
  fraudRecommendation: string;
  topCategories: ChartDataPoint[];
  monthlyTrends: ChartDataPoint[];
  yearlyTrends: ChartDataPoint[];
  seasonalComparison: ChartDataPoint[];
  complaintDistribution: ChartDataPoint[];
  rootCauseBreakdown: ChartDataPoint[];
  rootCauseExplanation: string;
  fraudSignals: CenterFraudSignal[];
  topEmotions: string[];
  commonConcerns: string[];
  frequentWords: ChartDataPoint[];
  trustTrend: string;
  fraudAnalysis: AIExplainBlock;
  sentimentAnalysis: AIExplainBlock;
  rootCauseAnalysis: AIExplainBlock;
  predictions: InvestigationPrediction[];
  predictionExplanation: string;
  heatmapData: { row: string; col: string; value: number }[];
  workerPerformanceImpact: string;
  parentSatisfaction: number;
  beneficiaryTrust: number;
  aiSummary: string;
  finalAISummary: string;
  recommendations: InvestigationRecommendation[];
  futureRiskPrediction: string;
  performance: CenterPerformanceMetrics;
}
