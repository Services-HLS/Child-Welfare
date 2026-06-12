import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { SessionClassroomVideo } from "@/components/worker/classroom/SessionClassroomVideo";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BAND_STYLE = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  orange: "bg-amber-100 text-amber-900 border-amber-200",
  red: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function SessionHistory() {
  const { sessions, user } = useApp();
  const mine = sessions.filter((s) => s.metadata.workerId === user?.id && (s.extractedAnalysis || s.scorecard));

  return (
    <div className="space-y-6 pb-24 w-full">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-bold text-[#0F172A]">Session history</h1>
        <Link to="/worker/session-monitor" className="text-xs font-bold text-[#1e40af]">+ New session / upload</Link>
      </div>
      <div className="space-y-4">
        {mine.map((s) => {
          const ext = s.extractedAnalysis;
          const band = ext?.supportLevel ?? s.scorecard?.band ?? "orange";
          const conf = ext?.confidence ?? 75;
          const children = ext?.childrenDetected ?? s.metadata.childCount ?? "—";
          return (
            <div key={s.id} className="worker-card border p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{s.id}</div>
                  <div className="font-bold text-slate-900">{ext?.activityType ?? s.metadata.sessionType}</div>
                  <div className="text-xs text-slate-500">{format(new Date(s.metadata.timestamp), "MMM d, yyyy h:mm a")}</div>
                </div>
                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded border", BAND_STYLE[band])}>
                  {band} support
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                <div className="bg-slate-50 p-2 rounded"><div className="font-bold">{children}</div>Children est.</div>
                <div className="bg-slate-50 p-2 rounded"><div className="font-bold">{conf}%</div>AI confidence</div>
                <div className="bg-slate-50 p-2 rounded"><div className="font-bold">{s.analysisSaved ? "Saved" : "Draft"}</div>Status</div>
              </div>
              {(s.hasLocalVideo || s.videoBlobUrl) && (
                <div className="mt-3">
                  <SessionClassroomVideo sessionId={s.id} src={s.videoBlobUrl} compact className="w-full h-full object-contain bg-black" />
                </div>
              )}
              {ext?.extractedContextTelugu && (
                <p className="mt-2 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 inline-block">
                  Telugu & English transcript available
                </p>
              )}
              <Link
                to="/worker/session-monitor"
                state={{ openSessionId: s.id }}
                className="mt-3 inline-block text-xs font-bold text-[#1e40af]"
              >
                Open analysis & transcript →
              </Link>
            </div>
          );
        })}
        {mine.length === 0 && <p className="text-center text-slate-500 py-12">No analyzed sessions yet. Upload a storytelling video to begin.</p>}
      </div>
    </div>
  );
}
