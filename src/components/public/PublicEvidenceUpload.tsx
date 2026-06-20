import { PublicEvidenceItem } from "@/types/public-request";
import { Lang } from "@/types/platform";
import { captureSpeechFromMicrophone } from "@/services/ai/speech";
import { extractTextFromDocument, isOcrSupportedFile } from "@/services/ai/document-ocr";
import { enrichOcrEvidenceItem } from "@/lib/ocr-evidence";
import { OcrEvidencePanel } from "@/components/public/OcrEvidencePanel";
import { EvidenceMediaTile } from "@/components/public/EvidenceMediaTile";
import { Mic, Loader2, Image as ImageIcon, FileText, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  evidence: PublicEvidenceItem[];
  onChange: (items: PublicEvidenceItem[]) => void;
  lang?: Lang;
  optional?: boolean;
  label?: string;
  showVoice?: boolean;
  showOcr?: boolean;
  /** Optional callback after OCR evidence is saved (does not modify description) */
  onOcrComplete?: (item: PublicEvidenceItem) => void;
  ocrUploadLabel?: string;
  ocrProcessingLabel?: string;
  ocrSuccessLabel?: string;
  ocrErrorLabel?: string;
};

export function PublicEvidenceUpload({
  evidence,
  onChange,
  lang = "en",
  optional,
  label,
  showVoice = true,
  showOcr = false,
  onOcrComplete,
  ocrUploadLabel = "Upload document (OCR)",
  ocrProcessingLabel = "Extracting text…",
  ocrSuccessLabel = "Text extracted from document",
  ocrErrorLabel = "Could not extract text from document",
}: Props) {
  const [voiceMode, setVoiceMode] = useState(false);
  const [ocrMode, setOcrMode] = useState(false);

  const add = (item: Omit<PublicEvidenceItem, "id" | "uploadedAt">) => {
    const full: PublicEvidenceItem = {
      ...item,
      id: `ev-${Date.now()}-${evidence.length}`,
      uploadedAt: new Date().toISOString(),
    };
    onChange([...evidence, full]);
    return full;
  };

  const handleOcrUpload = async (file: File) => {
    if (!isOcrSupportedFile(file)) {
      toast.error("Unsupported file. Use PDF, Word (.docx), image, or text file.");
      return;
    }
    setOcrMode(true);
    try {
      const url = URL.createObjectURL(file);
      const result = await extractTextFromDocument(file, lang);
      const item = add(enrichOcrEvidenceItem(file, result, url));
      onOcrComplete?.(item);
      toast.success(ocrSuccessLabel, {
        description: `${result.detectedLanguageLabel} · ${result.text.length} characters extracted`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : ocrErrorLabel);
    } finally {
      setOcrMode(false);
    }
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">
        {label ?? (optional ? "Optional evidence (context only)" : "Evidence upload")}
      </p>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
          <ImageIcon className="h-4 w-4" /> Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) add({ type: "photo", url: URL.createObjectURL(f), label: f.name });
            }}
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
          <Video className="h-4 w-4" /> Video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) add({ type: "video", url: URL.createObjectURL(f), label: f.name });
            }}
          />
        </label>
        {showVoice && (
          <button
            type="button"
            disabled={voiceMode}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
            onClick={async () => {
              setVoiceMode(true);
              try {
                const t = await captureSpeechFromMicrophone(lang);
                add({ type: "voice", text: t, label: "Voice note" });
                toast.success("Voice captured");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Voice capture failed");
              } finally {
                setVoiceMode(false);
              }
            }}
          >
            {voiceMode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />} Voice
          </button>
        )}
        {showOcr && (
          <label
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer ${
              ocrMode ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {ocrMode ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {ocrMode ? ocrProcessingLabel : ocrUploadLabel}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.text,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
              className="hidden"
              disabled={ocrMode}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleOcrUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        )}
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
          <FileText className="h-4 w-4" /> Document
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (showOcr) {
                await handleOcrUpload(f);
              } else {
                add({ type: "document", url: URL.createObjectURL(f), label: f.name });
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {evidence.length > 0 && (
        <p className="text-xs text-emerald-700 mt-2">{evidence.length} file(s) attached</p>
      )}
      {evidence.some((e) => e.type === "ocr") && (
        <div className="mt-3 space-y-3">
          {evidence.filter((e) => e.type === "ocr").map((e) => (
            <OcrEvidencePanel key={e.id} item={e} compact />
          ))}
        </div>
      )}
      {evidence.filter((e) => e.type !== "ocr" && e.url).slice(0, 3).map((e) => (
        <div key={e.id} className="mt-2">
          <EvidenceMediaTile item={e} compact showHeader />
        </div>
      ))}
    </div>
  );
}
