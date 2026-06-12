export function CoachingRecommendations({ items, title = "Coaching recommendations" }: { items: string[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="border-l-4 border-[#1e40af] bg-[#eff6ff] p-3">
      <h3 className="text-xs font-bold uppercase text-[#1e40af]">{title}</h3>
      <ul className="mt-2 text-sm space-y-1 text-slate-800">
        {items.map((r, i) => (
          <li key={i}>• {r}</li>
        ))}
      </ul>
    </div>
  );
}
