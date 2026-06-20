import { ComplaintRecord } from "@/types/platform";
import { PublicEvidenceItem } from "@/types/public-request";

export function getComplaintEvidence(complaint: ComplaintRecord): PublicEvidenceItem[] {
  const grievanceItems = complaint.grievance?.evidence ?? [];
  const citizenItems = complaint.citizenEvidence ?? [];
  const source = grievanceItems.length > 0 ? grievanceItems : citizenItems;
  return source.map((e) => normalizeEvidenceItem(e));
}

function normalizeEvidenceItem(e: PublicEvidenceItem): PublicEvidenceItem {
  return {
    id: e.id,
    type: e.type,
    url: e.url,
    text: e.text,
    label: e.label,
    uploadedAt: e.uploadedAt,
    ocrLanguage: e.ocrLanguage,
    ocrLanguageLabel: e.ocrLanguageLabel,
    ocrSource: e.ocrSource,
    ocrFileKind: e.ocrFileKind,
    ocrFileName: e.ocrFileName,
    ocrConfidence: e.ocrConfidence,
    ocrCharacterCount: e.ocrCharacterCount,
    aiStatus: e.aiStatus,
    geo: e.geo,
  };
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg|m4v)(\?|$)/i.test(url) || url.includes("video");
}

export function isPdfUrl(url: string, label?: string): boolean {
  const name = (label ?? url).toLowerCase();
  return /\.pdf(\?|$)/i.test(name) || url.toLowerCase().includes(".pdf");
}

export function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url) || url.includes("placeholder-evidence");
}
