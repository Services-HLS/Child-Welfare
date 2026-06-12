interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  title?: string;
}

export function EngagementTrendChart({ data, title = "Last 3 sessions" }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="worker-card p-4">
      <p className="text-xs font-semibold text-slate-600 mb-3">{title}</p>
      <div className="flex items-end gap-3 h-24">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">No prior sessions yet.</p>
        ) : (
          data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-[#1e3a5f] min-h-[4px]"
                style={{ height: `${Math.max(8, (d.value / max) * 72)}px` }}
                title={`${d.value}%`}
              />
              <span className="text-[10px] text-slate-600">{d.label}</span>
              <span className="text-xs font-semibold">{d.value}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
