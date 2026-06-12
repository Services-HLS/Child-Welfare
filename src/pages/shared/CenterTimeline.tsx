import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { TimelineReplay } from "@/components/timeline/TimelineReplay";
import { Play, Pause, Camera } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Range = "day" | "week" | "month" | "all";
type EventFilter = "all" | "service" | "session" | "complaint" | "feedback" | "coaching" | "outcome";

export default function CenterTimeline() {
  const { id } = useParams();
  const { getTimeline } = useApp();
  const center = mockCenters.find((c) => c.id === id);
  const [range, setRange] = useState<Range>("week");
  const [playback, setPlayback] = useState<number | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [snapshotIdx, setSnapshotIdx] = useState<number | null>(null);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  const events = useMemo(() => {
    const raw = getTimeline(id ?? "", range === "all" ? "month" : range);
    if (eventFilter === "all") return raw;
    const map: Record<EventFilter, string[]> = {
      all: [],
      service: ["service"],
      session: ["session"],
      complaint: ["complaint", "escalation", "resolution"],
      feedback: ["feedback", "survey"],
      coaching: ["coaching"],
      outcome: ["outcome"],
    };
    return raw.filter((e) => map[eventFilter].includes(e.type));
  }, [id, range, getTimeline, eventFilter]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    setPlaying(true);
    setPlayback(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setPlayback(i);
      if (i >= events.length - 1) { clearInterval(t); setPlaying(false); }
    }, 700);
  };

  if (!center) return <div className="p-10">Center not found</div>;
  const snapshot = snapshotIdx !== null ? events[snapshotIdx] : null;

  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Timeline Replay Engine</h1>
          <Link to={`/center-command/${id}`} className="text-xs font-semibold text-[#1e40af]">← Center Command</Link>
          <p className="text-sm text-slate-500">{center.name} — service, sessions, grievances, outcomes & interventions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month", "all"] as Range[]).map((r) => (
            <button key={r} type="button" onClick={() => { setRange(r); setPlayback(undefined); }} className={cn("px-3 py-1.5 text-[10px] font-semibold uppercase border", range === r ? "bg-[#1e40af] text-white" : "bg-white")}>
              {r}
            </button>
          ))}
          {(["all", "service", "session", "complaint", "feedback", "coaching", "outcome"] as EventFilter[]).map((f) => (
            <button key={f} type="button" onClick={() => setEventFilter(f)} className={cn("px-3 py-1.5 text-[10px] font-semibold capitalize border", eventFilter === f ? "bg-teal-800 text-white" : "bg-white")}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={togglePlay} className="flex items-center gap-2 rounded-xl bg-[#0F172A] text-white px-4 py-2 text-[10px] font-black uppercase">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} Playback
        </button>
        <input type="range" min={0} max={Math.max(0, events.length - 1)} value={playback ?? events.length - 1} onChange={(e) => { setPlayback(+e.target.value); setPlaying(false); }} className="flex-1 min-w-[120px]" />
        <button onClick={() => setSnapshotIdx(playback ?? events.length - 1)} className="flex items-center gap-1 text-[10px] font-black uppercase border rounded-lg px-3 py-2">
          <Camera className="h-3 w-3" /> Event snapshot
        </button>
      </div>
      {snapshot && (
        <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4">
          <div className="text-[10px] font-black uppercase text-cyan-800">Snapshot · {format(new Date(snapshot.timestamp), "PPp")}</div>
          <div className="font-bold mt-1">{snapshot.title}</div>
          <p className="text-sm text-slate-700">{snapshot.description}</p>
        </div>
      )}
      <TimelineReplay events={events} playbackIndex={playback} />
    </div>
  );
}
