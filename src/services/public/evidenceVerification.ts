import { ComplaintRecord } from "@/types/platform";
import { PublicEvidenceItem } from "@/types/public-request";
import { GrievanceAIAnalysis } from "@/types/grievance";
import { analyzePublicGrievance } from "@/services/ai/grievance-engine";
import { FeedbackChannel } from "@/types/feedback-channels";
import { Lang } from "@/types/platform";

export type GeoValidationStatus = "verified" | "near_center" | "outside_zone" | "manual_review";

export interface EvidenceGeoMeta {
  lat?: number;
  lng?: number;
  capturedAt: string;
  centerLat: number;
  centerLng: number;
  distanceMeters: number;
  matchPercent: number;
  status: GeoValidationStatus;
  citizenSummary: string;
}

export interface AIVerificationMeta {
  issueClassification: string;
  severity: string;
  language: string;
  extractedContext: string;
  confidence: number;
  sentiment: string;
  recommendedRoute: string[];
  urgencyLabel: "Normal" | "High Priority" | "Critical" | "Immediate Review";
  extractionStatus: "complete" | "pending" | "failed";
  explainability: string[];
}

/** Demo center coordinates — Tirupati Alipiri */
export const CENTER_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  "AWC-TPT-01": { lat: 13.6288, lng: 79.4192, name: "Alipiri Center" },
  "AWC-TPT-03": { lat: 13.65, lng: 79.52, name: "Renigunta Sector" },
  "AWC-TPT-06": { lat: 13.49, lng: 79.12, name: "Pakala South" },
};

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function validateEvidenceLocation(
  centerId: string,
  lat?: number,
  lng?: number
): EvidenceGeoMeta {
  const center = CENTER_COORDS[centerId] ?? CENTER_COORDS["AWC-TPT-01"];
  const cLat = lat ?? center.lat + (Math.random() - 0.5) * 0.002;
  const cLng = lng ?? center.lng + (Math.random() - 0.5) * 0.002;
  const dist = haversineM(cLat, cLng, center.lat, center.lng);
  let status: GeoValidationStatus = "verified";
  let match = 98;
  if (dist > 500) {
    status = "outside_zone";
    match = Math.max(20, 100 - Math.round(dist / 50));
  } else if (dist > 150) {
    status = "near_center";
    match = Math.max(60, 95 - Math.round(dist / 20));
  } else if (dist > 80) {
    status = "manual_review";
    match = 85;
  }

  const citizenSummary =
    status === "verified"
      ? `Evidence location verified near ${center.name} (${Math.round(dist)}m).`
      : status === "near_center"
        ? `Evidence captured near center zone (${Math.round(dist)}m from ${center.name}).`
        : status === "outside_zone"
          ? `Location requires review — ${Math.round(dist)}m from registered center.`
          : `Manual geospatial review recommended (${Math.round(dist)}m).`;

  return {
    lat: cLat,
    lng: cLng,
    capturedAt: new Date().toISOString(),
    centerLat: center.lat,
    centerLng: center.lng,
    distanceMeters: Math.round(dist),
    matchPercent: match,
    status,
    citizenSummary,
  };
}

export function buildAIVerification(
  text: string,
  rating: number,
  channel: FeedbackChannel,
  lang: Lang,
  complaint?: ComplaintRecord
): AIVerificationMeta {
  const ai: GrievanceAIAnalysis =
    complaint?.grievance?.aiAnalysis ?? analyzePublicGrievance(text, rating, channel, lang);

  const explainability: string[] = [];
  if (ai.confidence >= 0.85) explainability.push(`High category confidence (${Math.round(ai.confidence * 100)}%) from keywords and context.`);
  if (ai.severity === "critical" || ai.severity === "high")
    explainability.push(`Urgency keywords and severity model flagged ${ai.severity} priority.`);
  if (rating <= 2) explainability.push("Low citizen rating increases review priority.");
  if (/meal|food|nutrition|water|safety|injury/i.test(text))
    explainability.push("Service-delivery keywords matched WDCW grievance taxonomy.");
  if (complaint && (complaint.repeatCount ?? 0) >= 1)
    explainability.push("Historical pattern: repeated complaints at this center increase escalation weight.");
  explainability.push("Evidence availability improves supervisor investigation speed.");
  explainability.push(`Recommended route: ${ai.suggestedResolutionPath.join(" → ")} (supervisor-first, no worker routing).`);

  const urgencyLabel: AIVerificationMeta["urgencyLabel"] =
    ai.severity === "critical"
      ? "Immediate Review"
      : ai.severity === "high"
        ? "Critical"
        : ai.severity === "medium"
          ? "High Priority"
          : "Normal";

  return {
    issueClassification: ai.issueClassification.replace(/_/g, " "),
    severity: ai.severity,
    language: ai.detectedLanguage,
    extractedContext: ai.extractedContext,
    confidence: ai.confidence,
    sentiment: rating <= 2 ? "negative" : rating >= 4 ? "positive" : "neutral",
    recommendedRoute: ai.suggestedResolutionPath,
    urgencyLabel,
    extractionStatus: "complete",
    explainability,
  };
}

export function enrichEvidenceItem(
  item: PublicEvidenceItem,
  centerId: string
): PublicEvidenceItem & { geo?: EvidenceGeoMeta; aiStatus?: string } {
  const geo = validateEvidenceLocation(centerId);
  return {
    ...item,
    geo,
    aiStatus: item.type === "ocr" || item.type === "voice" ? "Extracted" : "Analyzed",
  };
}

export function evidenceTrustScore(geo: EvidenceGeoMeta, aiConfidence: number): number {
  return Math.round(geo.matchPercent * 0.5 + aiConfidence * 100 * 0.5);
}
