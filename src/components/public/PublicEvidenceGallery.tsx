import { PublicEvidenceItem } from "@/types/public-request";
import { FileText, Mic, ScanText, Image as ImageIcon, Video } from "lucide-react";

function iconFor(type: PublicEvidenceItem["type"]) {
  switch (type) {
    case "photo":
      return ImageIcon;
    case "voice":
      return Mic;
    case "ocr":
      return ScanText;
    case "video":
      return Video;
    default:
      return FileText;
  }
}

export function PublicEvidenceGallery({ items }: { items: PublicEvidenceItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No evidence attached to this submission yet.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((ev) => {
        const Icon = iconFor(ev.type);
        return (
          <div key={ev.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#1e40af]" />
              <span className="text-[10px] font-bold uppercase text-slate-600">{ev.label ?? ev.type}</span>
            </div>
            {ev.url && (ev.type === "photo" || ev.type === "video") && (
              <img src={ev.url} alt="" className="w-full max-h-48 object-cover" />
            )}
            {ev.text && (
              <p className="p-3 text-sm text-slate-700 whitespace-pre-wrap">{ev.text}</p>
            )}
            {!ev.url && !ev.text && (
              <p className="p-3 text-xs text-slate-500">Evidence on file</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
