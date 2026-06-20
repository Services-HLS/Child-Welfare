import { PublicEvidenceItem } from "@/types/public-request";
import { OcrEvidencePanel } from "@/components/public/OcrEvidencePanel";
import { EvidenceMediaTile } from "@/components/public/EvidenceMediaTile";

type Props = {
  items: PublicEvidenceItem[];
  ocrFullText?: boolean;
};

export function PublicEvidenceGallery({ items, ocrFullText }: Props) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No evidence attached to this submission yet.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((ev) => {
        if (ev.type === "ocr") {
          return <OcrEvidencePanel key={ev.id} item={ev} fullText={ocrFullText} />;
        }
        return <EvidenceMediaTile key={ev.id} item={ev} />;
      })}
    </div>
  );
}
