import { ComplaintCategory, Lang, SentimentLabel } from "./platform";

export type FeedbackChannel =
  | "mobile_app"
  | "ivr"
  | "whatsapp"
  | "qr_code"
  | "sms"
  | "handwritten_ocr"
  | "photo_issue";

export interface OmnichannelInput {
  id: string;
  channel: FeedbackChannel;
  rawPayload: string;
  normalizedText: string;
  lang: Lang;
  rating?: number;
  imageUrl?: string;
  attachmentUrls?: string[];
  beneficiaryId?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  centerId: string;
  centerName: string;
  district: string;
  processedAt: string;
  ocrText?: string;
  detectedIssues?: string[];
  category?: string;
  priority?: string;
  metadata?: Record<string, unknown>;
  feedbackContext?: {
    submittedAs?: string;
    category?: string;
    channel?: FeedbackChannel;
    linkedChild?: string;
    linkedCenter?: string;
    grievance?: boolean;
  };
}

export interface UnifiedFeedbackSchema {
  id: string;
  sourceChannel: FeedbackChannel;
  omnichannelInputId: string;
  text: string;
  rating: number;
  category: ComplaintCategory;
  sentiment: SentimentLabel;
  sentimentScore: number;
  urgencyScore: number;
  confidence: number;
  beneficiaryId: string;
  beneficiaryName: string;
  centerId: string;
  centerName: string;
  district: string;
  isComplaint: boolean;
  complaintId?: string;
  timestamp: string;
}
