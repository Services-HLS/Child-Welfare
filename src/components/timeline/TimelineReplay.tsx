import { TimelineEvent } from "@/types/intelligence";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<TimelineEvent["type"], string> = {
  service: "bg-blue-500",
  feedback: "bg-purple-500",
  complaint: "bg-red-500",
  escalation: "bg-orange-500",
  resolution: "bg-emerald-500",
  coaching: "bg-indigo-500",
  session: "bg-cyan-500",
  outcome: "bg-teal-500",
  survey: "bg-pink-500",
};

export function TimelineReplay({ events, playbackIndex }: { events: TimelineEvent[]; playbackIndex?: number }) {
  const visible = playbackIndex !== undefined ? events.slice(0, playbackIndex + 1) : events;
  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
      {visible.map((e, i) => (
        <div key={e.id} className={cn("relative", playbackIndex === i && "animate-pulse")}>
          <div className={cn("absolute -left-[1.65rem] h-3 w-3 rounded-full ring-4 ring-white", TYPE_COLORS[e.type])} />
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>{e.type}</span>
              <span>{format(new Date(e.timestamp), "MMM d, h:mm a")}</span>
            </div>
            <div className="font-bold text-sm text-slate-900 mt-1">{e.title}</div>
            <p className="text-xs text-slate-600 mt-1">{e.description}</p>
            {e.actor && <p className="text-[10px] text-slate-400 mt-1">{e.actor}</p>}
          </div>
        </div>
      ))}
      {visible.length === 0 && <p className="text-sm text-slate-500">No events in this period.</p>}
    </div>
  );
}
