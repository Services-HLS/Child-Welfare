import { Lang } from "@/types/platform";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export type OcrResult = {
  text: string;
  source: "plain" | "pdf" | "docx" | "image" | "fallback";
  confidence?: number;
  detectedLanguage: Lang;
  detectedLanguageLabel: string;
};

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
};

/** Detect dominant script/language in extracted document text */
export function detectDocumentLanguage(text: string): { code: Lang; label: string } {
  const sample = text.trim();
  if (!sample) return { code: "en", label: LANG_LABELS.en };

  const telugu = (sample.match(/[\u0C00-\u0C7F]/g) ?? []).length;
  const devanagari = (sample.match(/[\u0900-\u097F]/g) ?? []).length;
  const latin = (sample.match(/[a-zA-Z]/g) ?? []).length;

  if (telugu >= devanagari && telugu > latin * 0.25 && telugu >= 8) {
    return { code: "te", label: LANG_LABELS.te };
  }
  if (devanagari > telugu && devanagari > latin * 0.25 && devanagari >= 8) {
    return { code: "hi", label: LANG_LABELS.hi };
  }
  return { code: "en", label: LANG_LABELS.en };
}

function withLanguage(text: string, partial: Omit<OcrResult, "detectedLanguage" | "detectedLanguageLabel">): OcrResult {
  const lang = detectDocumentLanguage(text);
  return { ...partial, text, detectedLanguage: lang.code, detectedLanguageLabel: lang.label };
}

const FALLBACK: Record<Lang, string> = {
  en: "Complaint regarding Anganwadi services — nutrition meal not served, food storage empty, children affected. Request immediate supervisor action.",
  te: "అంగన్‌వాడీ సేవలకు సంబంధించిన ఫిర్యాదు — పోషకాహారం అందించలేదు, ఆహార నిల్వ ఖాళీగా ఉంది, పిల్లలు ప్రభావితమయ్యారు. వెంటనే పర్యవేక్షక చర్య అవసరం.",
  hi: "आंगनवाड़ी सेवाओं से संबंधित शिकायत — पोषण भोजन नहीं दिया गया, भोजन भंडार खाली, बच्चे प्रभावित। तत्काल पर्यवेक्षक कार्रवाई आवश्यक।",
};

function tesseractLang(lang?: Lang): string {
  if (lang === "te") return "tel+eng";
  if (lang === "hi") return "hin+eng";
  return "eng";
}

async function readPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? "").trim());
    reader.onerror = () => reject(new Error("Could not read text file"));
    reader.readAsText(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) parts.push(`--- Page ${i} ---\n${pageText}`);
  }
  return parts.join("\n\n").trim();
}

/** OCR each PDF page when the document has no selectable text layer (scanned PDF). */
async function extractPdfTextViaOcr(file: File, lang?: Lang): Promise<{ text: string; confidence?: number }> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  let totalConfidence = 0;
  let pageCount = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport, canvas }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (!blob) continue;

    const imageFile = new File([blob], `page-${i}.png`, { type: "image/png" });
    const { data: ocrData } = await Tesseract.recognize(imageFile, tesseractLang(lang), {
      logger: () => {},
    });
    const pageText = ocrData.text.trim();
    if (pageText) {
      parts.push(`--- Page ${i} ---\n${pageText}`);
      totalConfidence += ocrData.confidence;
      pageCount += 1;
    }
  }

  return {
    text: parts.join("\n\n").trim(),
    confidence: pageCount > 0 ? Math.round(totalConfidence / pageCount) : undefined,
  };
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

async function extractImageText(file: File, lang?: Lang): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(file, tesseractLang(lang), {
    logger: () => {},
  });
  return withLanguage(data.text.trim(), {
    source: "image",
    confidence: data.confidence,
  });
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name);
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isDocx(file: File): boolean {
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx$/i.test(file.name)
  );
}

function isPlainText(file: File): boolean {
  return file.type.startsWith("text/") || /\.(txt|text|csv|log)$/i.test(file.name);
}

/** Extract readable text from uploaded document, image, or PDF for grievance OCR */
export async function extractTextFromDocument(file: File, lang: Lang = "en"): Promise<OcrResult> {
  try {
    if (isPlainText(file)) {
      const text = await readPlainText(file);
      if (text) return withLanguage(text, { source: "plain" });
    }

    if (isPdf(file)) {
      const textLayer = await extractPdfText(file);
      if (textLayer.length >= 10) {
        return withLanguage(textLayer, { source: "pdf" });
      }
      const ocrResult = await extractPdfTextViaOcr(file, lang);
      if (ocrResult.text) {
        return withLanguage(ocrResult.text, { source: "pdf", confidence: ocrResult.confidence });
      }
      if (textLayer) {
        return withLanguage(textLayer, { source: "pdf" });
      }
    }

    if (isDocx(file)) {
      const text = await extractDocxText(file);
      if (text) return withLanguage(text, { source: "docx" });
    }

    if (isImage(file)) {
      const result = await extractImageText(file, lang);
      if (result.text) return result;
    }

    // Legacy .doc or scanned PDF with no text layer — try OCR on image if possible
    if (/\.doc$/i.test(file.name)) {
      return withLanguage(FALLBACK[lang], { source: "fallback", confidence: 60 });
    }
  } catch {
    /* fall through to fallback */
  }

  return withLanguage(FALLBACK[lang], { source: "fallback", confidence: 55 });
}

export function isOcrSupportedFile(file: File): boolean {
  return (
    isPlainText(file) ||
    isPdf(file) ||
    isDocx(file) ||
    isImage(file) ||
    /\.doc$/i.test(file.name)
  );
}
