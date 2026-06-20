import { PublicEvidenceItem } from "@/types/public-request";
import { OcrAnalysisXAI } from "@/types/investigation-xai";
import { buildOcrAnalysisJson, buildOcrExtractionJson } from "@/lib/ocr-evidence";
import { FileText, Image as ImageIcon, ScanText } from "lucide-react";

type Props = {
  item?: PublicEvidenceItem;
  analysis?: OcrAnalysisXAI;
  compact?: boolean;
  fullText?: boolean;
};

function JsonScroll({ data, fullText }: { data: Record<string, unknown>; fullText?: boolean }) {
  return (
    <div
      className={`rounded-sm border border-slate-700 bg-[#0c1f3d] overflow-auto ${
        fullText ? "max-h-[420px]" : "max-h-28"
      }`}
    >
      <pre className="p-2 text-[10px] leading-relaxed font-mono text-emerald-300 whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function FilePreview({ item }: { item: PublicEvidenceItem }) {
  const kind = item.ocrFileKind ?? "document";
  const fileName = item.ocrFileName ?? item.label?.replace(/^OCR:\s*/i, "") ?? "Uploaded file";
  const isPdf = item.ocrSource === "pdf" || /\.pdf$/i.test(fileName);

  if (kind === "image" && item.url) {
    return (
      <div className="rounded-sm border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="px-2 py-1.5 bg-slate-100 border-b flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-[#1e40af]" />
          <span className="text-[10px] font-bold uppercase text-slate-600">Image</span>
        </div>
        <img src={item.url} alt={fileName} className="w-full max-h-36 object-contain bg-white" />
        <p className="px-2 py-1 text-[10px] text-slate-500 truncate">{fileName}</p>
      </div>
    );
  }

  if (item.url && isPdf) {
    return (
      <div className="rounded-sm border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="px-2 py-1.5 bg-slate-100 border-b flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-[#1e40af]" />
          <span className="text-[10px] font-bold uppercase text-slate-600">Document</span>
        </div>
        <iframe
          title={fileName}
          src={item.url}
          className="w-full h-36 border-0 bg-white"
        />
        <p className="px-2 py-1 text-[10px] text-slate-500 truncate">{fileName}</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center gap-2 min-h-[88px]">
      <FileText className="h-8 w-8 text-[#1e40af]" />
      <span className="text-[10px] font-bold uppercase text-slate-600">Document</span>
      <p className="text-[10px] text-slate-500 text-center truncate max-w-full">{fileName}</p>
    </div>
  );
}

export function OcrEvidencePanel({ item, analysis, compact, fullText }: Props) {
  if (item) {
    return (
      <div className={`rounded-sm border border-blue-200 bg-blue-50/40 ${compact ? "p-2" : "p-3"} space-y-2`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ScanText className="h-3.5 w-3.5 text-[#1e40af]" />
            <p className="text-[10px] font-bold uppercase text-blue-900">OCR Extraction</p>
          </div>
          {item.ocrLanguageLabel && (
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm bg-blue-100 text-blue-900">
              {item.ocrLanguageLabel}
            </span>
          )}
        </div>
        <FilePreview item={item} />
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Extraction JSON</p>
          <JsonScroll data={buildOcrExtractionJson(item, { fullText })} fullText={fullText} />
        </div>
      </div>
    );
  }

  if (analysis?.hasOcr) {
    return (
      <div className={`rounded-sm border border-amber-200 bg-amber-50/50 ${compact ? "p-2" : "p-3"} space-y-2`}>
        <div className="flex items-center gap-1.5">
          <ScanText className="h-3.5 w-3.5 text-amber-800" />
          <p className="text-[10px] font-bold uppercase text-slate-700">
            AI OCR Analysis ({analysis.detectedLanguage})
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Analysis JSON</p>
          <JsonScroll data={buildOcrAnalysisJson(analysis)} />
        </div>
      </div>
    );
  }

  return null;
}
