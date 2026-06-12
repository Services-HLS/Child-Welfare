import { useEffect, useRef, useState } from "react";
import { Loader2, VideoOff } from "lucide-react";
import { createSessionVideoObjectUrl, createVideoObjectUrlFromBlob, loadSessionVideoBlob } from "@/lib/storage/sessionVideo";
import { cn } from "@/lib/utils";

type Props = {
  sessionId?: string;
  /** Live blob URL from upload/record (same tab). */
  src?: string | null;
  /** Fallback file while pipeline runs (keeps playback without waiting for IDB). */
  file?: File | null;
  className?: string;
  wrapperClassName?: string;
  compact?: boolean;
};

export function SessionClassroomVideo({
  sessionId,
  src,
  file,
  className = "w-full h-full object-contain bg-black",
  wrapperClassName,
  compact,
}: Props) {
  const [playUrl, setPlayUrl] = useState<string | null>(src ?? null);
  const [loading, setLoading] = useState(Boolean(sessionId && !src && !file));
  const [failed, setFailed] = useState(false);
  const ownedUrlRef = useRef<string | null>(null);

  const setOwnedUrl = (url: string | null) => {
    if (ownedUrlRef.current && ownedUrlRef.current !== url) {
      URL.revokeObjectURL(ownedUrlRef.current);
    }
    ownedUrlRef.current = url;
    setPlayUrl(url);
  };

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setFailed(false);
      if (src) {
        setPlayUrl(src);
        setLoading(false);
        return;
      }
      if (file) {
        setOwnedUrl(createVideoObjectUrlFromBlob(file));
        setLoading(false);
        return;
      }
      if (!sessionId) {
        setPlayUrl(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const fromIdb = await createSessionVideoObjectUrl(sessionId);
      if (cancelled) {
        if (fromIdb) URL.revokeObjectURL(fromIdb);
        return;
      }
      if (fromIdb) {
        setOwnedUrl(fromIdb);
      } else {
        setPlayUrl(null);
      }
      setLoading(false);
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [sessionId, src, file]);

  useEffect(() => {
    return () => {
      if (ownedUrlRef.current) {
        URL.revokeObjectURL(ownedUrlRef.current);
        ownedUrlRef.current = null;
      }
    };
  }, []);

  const retryFromStore = async () => {
    if (!sessionId) {
      setFailed(true);
      return;
    }
    const blob = await loadSessionVideoBlob(sessionId);
    if (blob) {
      setOwnedUrl(createVideoObjectUrlFromBlob(blob));
      setFailed(false);
      return;
    }
    if (file) {
      setOwnedUrl(createVideoObjectUrlFromBlob(file));
      setFailed(false);
      return;
    }
    setFailed(true);
  };

  const wrapper = cn(
    "rounded-lg overflow-hidden border border-slate-300 bg-black",
    compact ? "aspect-video max-h-48" : "aspect-video max-h-[min(72vh,520px)]",
    wrapperClassName
  );

  if (loading) {
    return (
      <div className={cn(wrapper, "flex items-center justify-center text-slate-400")}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading video</span>
      </div>
    );
  }

  if (!playUrl || failed) {
    return (
      <div className={cn(wrapper, "flex flex-col items-center justify-center gap-2 text-slate-400 p-6")}>
        <VideoOff className="h-10 w-10" />
        <p className="text-xs text-center">Classroom video could not be loaded.</p>
        {sessionId && (
          <button type="button" className="text-xs font-bold text-blue-600 underline" onClick={() => void retryFromStore()}>
            Retry playback
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <video
        key={playUrl}
        src={playUrl}
        controls
        playsInline
        preload="auto"
        className={className}
        onError={() => void retryFromStore()}
      />
    </div>
  );
}
