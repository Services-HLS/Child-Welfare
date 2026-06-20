import { PublicEvidenceItem } from "@/types/public-request";
import { isPdfUrl, isVideoUrl } from "@/lib/complaint-evidence";
import { ExternalLink, FileText, Mic, Image as ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  item: PublicEvidenceItem;
  compact?: boolean;
  showHeader?: boolean;
};

function OpenLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1e40af] hover:underline mt-2"
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}

export function EvidenceUrlPreview({
  url,
  label,
  compact,
}: {
  url: string;
  label?: string;
  compact?: boolean;
}) {
  const fileLabel = label ?? "Evidence file";
  const maxH = compact ? "max-h-28" : "max-h-48";

  if (isVideoUrl(url)) {
    return (
      <div>
        <video src={url} controls playsInline className={cn("w-full rounded-lg border bg-black", maxH)} />
        <OpenLink url={url} label="Open video" />
      </div>
    );
  }

  if (isPdfUrl(url, fileLabel)) {
    return (
      <div>
        <iframe title={fileLabel} src={url} className={cn("w-full rounded-lg border bg-white", compact ? "h-28" : "h-48")} />
        <OpenLink url={url} label="Open PDF" />
      </div>
    );
  }

  if (isImageUrl(url)) {
    return (
      <div>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={fileLabel} className={cn("w-full rounded-lg border object-cover bg-slate-50", maxH)} />
        </a>
        <OpenLink url={url} label="Open image" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border">
      <FileText className="h-8 w-8 text-[#1e40af]" />
      <p className="text-xs text-slate-600 truncate max-w-full">{fileLabel}</p>
      <OpenLink url={url} label="Open file" />
    </div>
  );
}

function iconFor(type: PublicEvidenceItem["type"]) {
  switch (type) {
    case "photo":
      return ImageIcon;
    case "video":
      return Video;
    case "voice":
      return Mic;
    default:
      return FileText;
  }
}

export function EvidenceMediaTile({ item, compact, showHeader = true }: Props) {
  const Icon = iconFor(item.type);
  const fileName = item.label ?? item.type;
  const maxH = compact ? "max-h-28" : "max-h-48";

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", compact && "max-w-[220px]")}>
      {showHeader && (
        <div className="px-3 py-2 bg-slate-50 border-b flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#1e40af]" />
          <span className="text-[10px] font-bold uppercase text-slate-600 truncate">{fileName}</span>
        </div>
      )}

      {item.type === "photo" && item.url && (
        <div className="p-2">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <img src={item.url} alt={fileName} className={cn("w-full rounded-lg object-cover bg-slate-50", maxH)} />
          </a>
          <OpenLink url={item.url} label="Open image" />
        </div>
      )}

      {item.type === "video" && item.url && (
        <div className="p-2">
          <video src={item.url} controls playsInline className={cn("w-full rounded-lg bg-black", maxH)} />
          <OpenLink url={item.url} label="Open video" />
        </div>
      )}

      {item.type === "document" && item.url && (
        <div className="p-2">
          {isPdfUrl(item.url, fileName) ? (
            <>
              <iframe
                title={fileName}
                src={item.url}
                className={cn("w-full rounded-lg border bg-white", compact ? "h-28" : "h-44")}
              />
              <OpenLink url={item.url} label="Open PDF" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-lg">
              <FileText className="h-8 w-8 text-[#1e40af]" />
              <p className="text-xs text-slate-600 truncate max-w-full px-2">{fileName}</p>
              <OpenLink url={item.url} label="Open document" />
            </div>
          )}
        </div>
      )}

      {item.type === "voice" && (
        <div className="p-3 space-y-2">
          {item.text && (
            <p className="text-sm italic text-slate-700 border-l-2 border-blue-300 pl-3">&ldquo;{item.text}&rdquo;</p>
          )}
          {item.url && (
            <>
              <audio src={item.url} controls className="w-full" />
              <OpenLink url={item.url} label="Open audio" />
            </>
          )}
        </div>
      )}

      {(item.type === "text" || item.type === "transcript") && item.text && (
        <p className="p-3 text-sm text-slate-700 whitespace-pre-wrap">{item.text}</p>
      )}

      {!item.url && !item.text && item.type !== "voice" && (
        <p className="p-3 text-xs text-slate-500">Evidence on file</p>
      )}
    </div>
  );
}

export function EvidenceStrip({ items }: { items: PublicEvidenceItem[] }) {
  const media = items.filter((e) => e.type !== "ocr");
  if (!media.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {media.slice(0, 4).map((item) => (
        <EvidenceMediaTile key={item.id} item={item} compact showHeader={false} />
      ))}
      {media.length > 4 && (
        <span className="self-center text-[10px] font-bold text-slate-500">+{media.length - 4} more</span>
      )}
    </div>
  );
}
