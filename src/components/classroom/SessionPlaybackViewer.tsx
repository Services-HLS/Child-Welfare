import { useState } from "react";
import { Play, Shield } from "lucide-react";

/** Privacy-first: recording hidden until explicit supervisor/district action */
export function SessionPlaybackViewer({
  sessionId,
  hasRecording = true,
  roleLabel = "Official",
}: {
  sessionId: string;
  hasRecording?: boolean;
  roleLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  if (!hasRecording) {
    return <p className="text-xs text-slate-500">No recording attached (audio/metadata only).</p>;
  }
  if (!revealed) {
    return (
      <div className="border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Shield className="h-8 w-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-600">Raw classroom recording is restricted.</p>
        <p className="text-[10px] text-slate-500 mt-1">AI summaries and thumbnails are shown by default for privacy.</p>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 gov-btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
        >
          <Play className="h-3.5 w-3.5" /> {roleLabel}: open recording (demo)
        </button>
      </div>
    );
  }
  return (
    <div className="border border-slate-300 bg-black/90 aspect-video flex items-center justify-center text-white text-sm">
      <span>Demo playback · Session {sessionId}</span>
    </div>
  );
}
