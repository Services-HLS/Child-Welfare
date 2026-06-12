import { ClassroomHeatmapSegment } from "@/types/classroom-intelligence";

export function ClassroomHeatmap({ segments }: { segments: ClassroomHeatmapSegment[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {segments.map((s) => (
        <div key={s.segment} className="border border-slate-200 p-2 text-center bg-slate-50">
          <div className="text-[10px] font-semibold text-slate-600">{s.segment}</div>
          <div
            className="mt-1 h-8 rounded-sm"
            style={{
              background: `linear-gradient(90deg, #1e40af ${s.engagement}%, #e2e8f0 ${s.engagement}%)`,
            }}
          />
          <div className="text-xs font-bold mt-1">{s.engagement}%</div>
        </div>
      ))}
    </div>
  );
}
