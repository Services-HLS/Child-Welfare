import { ComplaintCategory, Lang } from "./platform";

/** Standard 5-section structure for every AI module */
export interface XAIModule {
  title: string;
  inputData: string[];
  aiProcessing: string;
  aiReasoning: string;
  confidenceCalculation: string;
  governmentRecommendation: string;
  confidence: number;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
  detail: string;
}

export interface KeywordHit {
  word: string;
  relevance: number;
}

export interface ComplaintAnalysisXAI {
  complaintText: string;
  detectedKeywords: KeywordHit[];
  detectedIntent: string;
  complaintCategory: string;
  keywordMatchScore: number;
  historicalSimilarCases: { districtTotal: number; centerTotal: number; periodDays: number };
  semanticSimilarity: number;
  imageAnalysisSummary: string;
  ocrAnalysisSummary: string;
  gpsVerificationSummary: string;
  operationalDataSummary: string;
  matchingHistoricalCases: string[];
  classificationLogic: string;
  evidenceUsed: string[];
  confidenceScore: number;
  confidenceIncreasedFactors: string[];
  confidenceDecreasedFactors: string[];
  finalClassification: string;
  finalDecisionNarrative: string;
  module: XAIModule;
}

export interface ImageAnalysisXAI {
  hasImage: boolean;
  metadata: { captureTime: string; device: string; gpsMetadata: string };
  authenticity: string;
  detectedObjects: string[];
  missingObjects: string[];
  duplicateDetection: string;
  manipulationCheck: string;
  integrityVerdict: string;
  confidence: number;
  narrative: string;
  module: XAIModule;
}

export interface VoiceAnalysisXAI {
  hasVoice: boolean;
  transcribedText: string;
  detectedEmotion: string;
  emotionConfidence: number;
  speakingSpeed: string;
  stressLevel: string;
  voiceConfidence: number;
  urgencyLevel: string;
  emotionReason: string;
  module: XAIModule;
}

export interface OcrDocumentXAI {
  documentName: string;
  documentType: string;
  extractedText: string;
  detectedLanguage: string;
  detectedLanguageCode: Lang;
  characterCount: number;
}

export interface OcrAnalysisXAI {
  hasOcr: boolean;
  documentName: string;
  documentType: string;
  detectedLanguage: string;
  detectedLanguageCode: Lang;
  documents: OcrDocumentXAI[];
  extractedText: string;
  characterCount: number;
  keywordAlignment: number;
  semanticMatchWithComplaint: number;
  detectedEntities: string[];
  extractionMethod: string;
  integrityCheck: string;
  confidence: number;
  narrative: string;
  module: XAIModule;
}

export interface FraudAnalysisXAI {
  fraudRiskLabel: string;
  fraudScore: number;
  gpsMatched: boolean;
  imageDuplicate: boolean;
  devicePreviouslyUsed: boolean;
  previousGenuineComplaints: number;
  spamPatternDetected: boolean;
  mobileAnalysis: string;
  submissionTiming: string;
  checks: { label: string; result: string; explanation: string }[];
  finalNarrative: string;
  module: XAIModule;
}

export interface BeneficiaryPatternXAI {
  previousComplaints: number;
  resolvedComplaints: number;
  avgResolutionDays: number;
  centerHistory: string;
  complaintFrequency: string;
  timeBetweenComplaints: string;
  satisfactionTrend: string;
  classification: string;
  confidence: number;
  narrative: string;
  module: XAIModule;
}

export interface RootCauseFactorXAI {
  factor: string;
  percentage: number;
  reason: string;
}

export interface RootCauseAnalysisXAI {
  primaryRootCause: string;
  factors: RootCauseFactorXAI[];
  narrative: string;
  module: XAIModule;
}

export interface CenterRiskFactorXAI {
  factor: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface CenterRiskXAI {
  finalScore: number;
  riskCategory: string;
  factors: CenterRiskFactorXAI[];
  narrative: string;
  module: XAIModule;
}

export interface PredictionXAI {
  id: string;
  label: string;
  probability: number;
  mlConfidence: number;
  historicalDataUsed: string;
  complaintsAnalysed: number;
  timePeriodMonths: number;
  seasonalPattern: string;
  operationalRecords: string[];
  attendanceTrend: string;
  nutritionTrend: string;
  narrative: string;
  module: XAIModule;
}

export interface RecommendationXAI {
  id: string;
  recommendation: string;
  reason: string;
  evidence: string[];
  priority: string;
  responsibleOfficer: string;
  estimatedBudget: string;
  estimatedTime: string;
  expectedComplaintReduction: string;
  expectedChildWelfareImprovement: string;
  expectedSatisfactionImprovement: string;
  narrative: string;
  module: XAIModule;
}

export interface SentimentAnalysisXAI {
  score: number;
  label: string;
  urgencyIndicators: string[];
  narrative: string;
  module: XAIModule;
}

export interface XAIInvestigationBundle {
  governmentExecutiveSummary: string;
  processingPipeline: PipelineStep[];
  complaintAnalysis: ComplaintAnalysisXAI;
  imageAnalysis: ImageAnalysisXAI;
  ocrAnalysis: OcrAnalysisXAI;
  voiceAnalysis: VoiceAnalysisXAI;
  fraudAnalysis: FraudAnalysisXAI;
  beneficiaryPattern: BeneficiaryPatternXAI;
  rootCauseAnalysis: RootCauseAnalysisXAI;
  centerRisk: CenterRiskXAI;
  sentimentAnalysis: SentimentAnalysisXAI;
  predictions: PredictionXAI[];
  recommendations: RecommendationXAI[];
}
