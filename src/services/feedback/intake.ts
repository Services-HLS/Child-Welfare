import { FeedbackChannel, OmnichannelInput } from "@/types/feedback-channels";
import { ComplaintCategory, Lang } from "@/types/platform";
import { ParentOmnichannelCategory } from "@/types/omnichannel-draft";
import { speechToText } from "@/services/ai/speech";
import { classifyGrievance } from "@/services/ai/grievance-engine";

export interface ChannelIntakePayload {
  channel: FeedbackChannel;
  centerId: string;
  centerName: string;
  district: string;
  text?: string;
  rating?: number;
  imageUrl?: string;
  attachmentUrls?: string[];
  audioBlob?: Blob;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  beneficiaryId?: string;
  lang?: Lang;
  transcript?: string;
  category?: ParentOmnichannelCategory;
  priority?: "low" | "medium" | "high" | "urgent";
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

export function parentCategoryToComplaint(cat: ParentOmnichannelCategory): ComplaintCategory {
  const map: Record<ParentOmnichannelCategory, ComplaintCategory> = {
    meals: "hot_cooked_meals",
    teaching: "education",
    infrastructure: "infrastructure",
    safety: "child_safety",
    hygiene: "cleanliness",
    suggestions: "other_concerns",
  };
  return map[cat];
}

function priorityUrgencyBoost(priority?: ChannelIntakePayload["priority"]): number {
  if (priority === "urgent") return 0.35;
  if (priority === "high") return 0.2;
  if (priority === "low") return -0.1;
  return 0;
}

const PHOTO_ISSUE_HINTS = ["food quality", "dirty", "broken", "water", "toilet", "unsafe"];

export async function processChannelIntake(payload: ChannelIntakePayload): Promise<{
  input: OmnichannelInput;
  normalizedText: string;
  category: ComplaintCategory;
  detectedIssues: string[];
}> {
  let normalizedText = payload.text ?? payload.transcript ?? "";
  let ocrText: string | undefined;
  const detectedIssues: string[] = [];
  let lang: Lang = payload.lang ?? "en";

  switch (payload.channel) {
    case "ivr":
      if (payload.transcript) normalizedText = payload.transcript;
      else if (payload.audioBlob) {
        normalizedText = await speechToText(payload.audioBlob, lang);
        lang = /[\u0C00-\u0C7F]/.test(normalizedText) ? "te" : /[\u0900-\u097F]/.test(normalizedText) ? "hi" : "en";
      }
      if (!normalizedText) normalizedText = "IVR voice feedback regarding Anganwadi services.";
      break;
    case "whatsapp":
      if (!normalizedText && payload.audioBlob) normalizedText = await speechToText(payload.audioBlob, lang);
      break;
    case "handwritten_ocr":
      ocrText = `[OCR] ${payload.text ?? "Handwritten complaint regarding center services."}`;
      normalizedText = ocrText;
      detectedIssues.push("handwritten_grievance");
      break;
    case "photo_issue":
      normalizedText = payload.text ?? "Photo evidence submitted by beneficiary";
      PHOTO_ISSUE_HINTS.forEach((h) => {
        if ((payload.text ?? "").toLowerCase().includes(h) || Math.random() > 0.5) detectedIssues.push(h);
      });
      if (detectedIssues.length === 0) detectedIssues.push("service_gap");
      break;
    case "qr_code": {
      const qr = payload.metadata?.qrCenter as { centerName?: string } | undefined;
      normalizedText = payload.text ?? `QR feedback for ${qr?.centerName ?? payload.centerName}`;
      detectedIssues.push("qr_verified");
      break;
    }
    case "sms":
      normalizedText = payload.text ?? "";
      break;
    default:
      normalizedText = payload.text ?? "";
  }

  const classification = classifyGrievance(normalizedText, payload.rating ?? 3, payload.channel);
  const category = payload.category
    ? parentCategoryToComplaint(payload.category)
    : classification.category;
  const urgencyBoost = priorityUrgencyBoost(payload.priority);

  const input: OmnichannelInput = {
    id: `OM-${Date.now()}`,
    channel: payload.channel,
    rawPayload: JSON.stringify({
      text: payload.text,
      transcript: payload.transcript,
      rating: payload.rating,
      metadata: payload.metadata,
    }),
    normalizedText,
    lang,
    rating: payload.rating,
    imageUrl: payload.imageUrl,
    attachmentUrls: payload.attachmentUrls,
    beneficiaryId: payload.beneficiaryId,
    beneficiaryName: payload.beneficiaryName,
    beneficiaryPhone: payload.beneficiaryPhone,
    centerId: payload.centerId,
    centerName: payload.centerName,
    district: payload.district,
    processedAt: new Date().toISOString(),
    ocrText,
    detectedIssues,
    category: payload.category,
    priority: payload.priority,
    metadata: payload.metadata,
    feedbackContext: payload.feedbackContext,
  };

  return {
    input,
    normalizedText,
    category,
    detectedIssues,
    urgencyBoost,
  };
}
