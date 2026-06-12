import { PublicEvidenceItem } from "@/types/public-request";
import { speechToText } from "@/services/ai/speech";
import { Lang } from "@/types/platform";
import { Mic, Loader2, Image as ImageIcon, FileText, Video, MessageCircle, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  evidence: PublicEvidenceItem[];
  onChange: (items: PublicEvidenceItem[]) => void;
  lang: Lang;
  optional?: boolean;
  label?: string;
};

export function PublicEvidenceUpload({ evidence, onChange, lang, optional, label }: Props) {
  const [voiceMode, setVoiceMode] = useState(false);

  const add = (item: Omit<PublicEvidenceItem, "id" | "uploadedAt">) => {
    onChange([
      ...evidence,
      { ...item, id: `ev-${Date.now()}-${evidence.length}`, uploadedAt: new Date().toISOString() },
    ]);
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
        <button
          type="button"
          disabled={voiceMode}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          onClick={async () => {
            setVoiceMode(true);
            const t = await speechToText(undefined, lang);
            add({ type: "voice", text: t, label: "Voice note" });
            setVoiceMode(false);
            toast.success("Voice captured");
          }}
        >
          {voiceMode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />} Voice
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          onClick={() => add({ type: "ocr", text: "Handwritten note captured (OCR demo)", label: "OCR note" })}
        >
          <FileText className="h-4 w-4" /> OCR
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          onClick={() => {
            add({ type: "transcript", text: "WhatsApp thread imported (demo)", label: "WhatsApp import" });
            toast.success("WhatsApp messages imported");
          }}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          onClick={() => {
            add({ type: "ocr", text: "QR scan: AWC-TPT-01 verified center context", label: "QR scan" });
            toast.success("QR center context captured");
          }}
        >
          <QrCode className="h-4 w-4" /> QR
        </button>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer">
          <FileText className="h-4 w-4" /> Document
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) add({ type: "document", url: URL.createObjectURL(f), label: f.name });
            }}
          />
        </label>
      </div>
      {evidence.length > 0 && (
        <p className="text-xs text-emerald-700 mt-2">{evidence.length} file(s) attached</p>
      )}
      {evidence[0]?.url && (evidence[0].type === "photo" || evidence[0].type === "video") && (
        <img src={evidence[0].url} alt="" className="mt-2 rounded-lg max-h-32 object-cover border" />
      )}
    </div>
  );
}
