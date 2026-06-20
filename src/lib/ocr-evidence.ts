import { PublicEvidenceItem } from "@/types/public-request";
import { OcrResult } from "@/services/ai/document-ocr";
import { OcrAnalysisXAI } from "@/types/investigation-xai";

const PREVIEW_CHARS = 100;

export function inferOcrFileKind(
  source?: OcrResult["source"] | string,
  fileName?: string
): "document" | "image" {
  if (source === "image") return "image";
  if (source === "pdf" || source === "docx" || source === "plain") return "document";
  const name = (fileName ?? "").toLowerCase();
  if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name)) return "image";
  return "document";
}

export function buildOcrExtractionJson(
  item: PublicEvidenceItem,
  options?: { fullText?: boolean }
): Record<string, unknown> {
  const fileName = item.ocrFileName ?? item.label?.replace(/^OCR:\s*/i, "") ?? "document";
  const fullBody = item.text?.trim() ?? "";
  const characterCount = item.ocrCharacterCount ?? fullBody.length;

  const meta = {
    extractionId: item.id,
    fileName,
    fileKind: item.ocrFileKind ?? inferOcrFileKind(item.ocrSource, fileName),
    source: item.ocrSource ?? "fallback",
    language: item.ocrLanguageLabel ?? "English",
    languageCode: item.ocrLanguage ?? "en",
    characterCount,
    confidence: item.ocrConfidence ?? null,
    extractedAt: item.uploadedAt,
  };

  if (options?.fullText) {
    return { ...meta, body: fullBody };
  }

  const body =
    fullBody.length > PREVIEW_CHARS ? `${fullBody.slice(0, PREVIEW_CHARS)}…` : fullBody;

  return { ...meta, ...(body ? { body } : {}) };
}

export function buildOcrAnalysisJson(analysis: OcrAnalysisXAI): Record<string, unknown> {
  return {
    hasOcr: analysis.hasOcr,
    documentCount: analysis.documents.length,
    detectedLanguage: analysis.detectedLanguage,
    detectedLanguageCode: analysis.detectedLanguageCode,
    characterCount: analysis.characterCount,
    keywordAlignment: analysis.keywordAlignment,
    semanticMatchWithComplaint: analysis.semanticMatchWithComplaint,
    confidence: analysis.confidence,
    extractionMethod: analysis.extractionMethod,
    documents: analysis.documents.map((doc) => ({
      documentName: doc.documentName,
      documentType: doc.documentType,
      detectedLanguage: doc.detectedLanguage,
      characterCount: doc.characterCount,
    })),
  };
}

export function enrichOcrEvidenceItem(
  file: File,
  result: OcrResult,
  url: string
): Omit<PublicEvidenceItem, "id" | "uploadedAt"> {
  return {
    type: "ocr",
    url,
    text: result.text,
    label: `OCR: ${file.name}`,
    ocrLanguage: result.detectedLanguage,
    ocrLanguageLabel: result.detectedLanguageLabel,
    ocrSource: result.source,
    ocrFileKind: inferOcrFileKind(result.source, file.name),
    ocrFileName: file.name,
    ocrConfidence: result.confidence,
    ocrCharacterCount: result.text.length,
  };
}
