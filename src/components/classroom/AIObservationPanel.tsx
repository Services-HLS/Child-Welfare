export function AIObservationPanel({
  title = "AI observation summary",
  summary,
  confidence,
  items,
}: {
  title?: string;
  summary: string;
  confidence?: number;
  items?: string[];
}) {
  return (
    <div className="border border-slate-200 bg-[#f8fafc] p-4">
      <h3 className="text-xs font-bold uppercase text-slate-600">{title}</h3>
      <p className="text-sm text-slate-800 mt-2 leading-relaxed">{summary}</p>
      {confidence != null && (
        <p className="text-[10px] text-slate-500 mt-2">AI confidence: {confidence}% · Scores are advisory; supervisors approve observations.</p>
      )}
      {items && items.length > 0 && (
        <ul className="mt-2 text-xs text-slate-700 space-y-1">
          {items.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
