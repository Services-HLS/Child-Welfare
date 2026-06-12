import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useParentPortal } from "@/hooks/useParentPortal";
import {
  activityCategory,
  childParticipatedInActivity,
  filterActivities,
  getPrimaryChild,
  ParentActivityFilter,
} from "@/services/beneficiary/parentPortalData";
import { ParentPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { format } from "date-fns";
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Image as ImageIcon } from "lucide-react";

const FILTERS: { id: ParentActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nutrition", label: "Nutrition" },
  { id: "preschool", label: "Preschool" },
  { id: "health", label: "Health" },
  { id: "special", label: "Special" },
];

export default function BeneficiaryActivities() {
  const { user } = useApp();
  const { centerActs, childProgress } = useParentPortal();
  const [filter, setFilter] = useState<ParentActivityFilter>("all");
  const child = getPrimaryChild(user!);
  const filtered = filterActivities(centerActs, filter).slice(0, 24);

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <ParentPageHeader
        badge="Center services"
        title="Center Services & Child Participation"
        subtitle="Activities logged at your Anganwadi with verification status"
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "text-xs font-bold uppercase px-3 py-1.5 rounded-lg border",
              filter === f.id ? "bg-[#1e3a5f] text-white" : "bg-white"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {child && (
        <p className="text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
          Showing whether <strong>{child.name}</strong> likely participated based on center records (not individual AI tracking).
        </p>
      )}

      <div className="space-y-4">
        {filtered.map((a) => {
          const participated = child ? childParticipatedInActivity(a, child.id, childProgress) : null;
          return (
            <div key={a.id} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
              {a.imageUrl && (
                <div className="relative h-36 bg-slate-100">
                  <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-white/90 text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Evidence shared
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-blue-600">{activityCategory(a.type)}</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{a.type}</div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(a.timestamp), "MMM d, h:mm a")} · {a.childrenPresent} children at center
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-slate-600 mt-2">{a.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
                  <span className={cn("px-2 py-1 rounded", a.status === "submitted" || a.status === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100")}>
                    {a.status === "verified" ? "Verified" : a.status === "submitted" ? "Completed" : "In progress"}
                  </span>
                  {participated !== null && (
                    <span className={cn("px-2 py-1 rounded flex items-center gap-1", participated ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600")}>
                      {participated && <CheckCircle2 className="h-3 w-3" />}
                      Child participation: {participated ? "Yes" : "Not confirmed"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">No activities in this category yet.</p>
        )}
      </div>
    </div>
  );
}
