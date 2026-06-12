import { Link } from "react-router-dom";
import { useState } from "react";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { experienceStatusLabel } from "@/services/public/publicExperienceService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type Bucket = "all" | "submitted" | "appreciated" | "included";

export default function MyExperiences() {
  const { myExperiences, experienceBuckets } = usePublicPortal();
  const [filter, setFilter] = useState<Bucket>("all");

  const filtered = myExperiences.filter((e) => {
    if (filter === "all") return true;
    if (filter === "submitted") return e.status === "recorded" || e.status === "acknowledged";
    if (filter === "appreciated") return e.sentiment === "positive" || e.experienceType === "appreciation";
    if (filter === "included") return e.status === "included_in_improvement";
    return true;
  });

  const chips: { id: Bucket; label: string; count: number }[] = [
    { id: "all", label: "All", count: myExperiences.length },
    { id: "submitted", label: "Submitted", count: experienceBuckets.submitted },
    { id: "appreciated", label: "Appreciated", count: experienceBuckets.appreciated },
    { id: "included", label: "Included in Improvements", count: experienceBuckets.included },
  ];

  return (
    <div className="space-y-6 pb-24 w-full">
      <PublicPageHeader
        badge="WDCW · Public portal"
        title="My Experiences"
        subtitle="Share Experience submissions — sentiment, AI summary, and service improvement status (no grievance timeline)"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={cn(
              "rounded-lg border p-2 text-center text-xs font-bold",
              filter === c.id ? "bg-emerald-700 text-white border-emerald-800" : "bg-white"
            )}
          >
            <p className="uppercase text-[9px] opacity-80">{c.label}</p>
            <p className="text-lg font-black">{c.count}</p>
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.map((e) => (
          <li key={e.id}>
            <Link
              to={`/public/experience/${e.id}`}
              className="block rounded-xl border bg-white p-4 shadow-sm hover:border-emerald-200"
            >
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>{e.id}</span>
                <span>{format(new Date(e.timestamp), "d MMM yyyy")}</span>
              </div>
              <p className="font-bold text-sm mt-1">{e.category}</p>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">{e.text}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 font-bold">
                  {experienceStatusLabel(e.status)}
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {e.rating}/5
                </span>
                <span className="capitalize text-slate-500">{e.sentiment}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">
          No experiences in this view.{" "}
          <Link to="/beneficiary/feedback" className="font-bold text-[#1e40af] underline">
            Share Experience
          </Link>
        </p>
      )}

      <Link to="/beneficiary/omnichannel-feedback" className="text-sm font-bold text-[#1e40af]">
        Need formal action? Report Issue →
      </Link>
    </div>
  );
}
