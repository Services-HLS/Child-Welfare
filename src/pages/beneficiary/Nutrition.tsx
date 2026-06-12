import { useApp } from "@/context/AppContext";
import { useParentPortal } from "@/hooks/useParentPortal";
import { getNutritionRecords, getPrimaryChild } from "@/services/beneficiary/parentPortalData";
import { ParentPageHeader, GovParentChip } from "@/components/beneficiary/ParentPageHeader";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TODAY_MENU = "Rice, dal, seasonal vegetables, egg / fruit — ICDS mid-day meal";

export default function NutritionServices() {
  const { user } = useApp();
  const { childProgress } = useParentPortal();
  const child = getPrimaryChild(user!);
  const records = child ? getNutritionRecords(child.id, childProgress) : [];
  const today = records[0];
  const missed = records.filter((r) => !r.childReceived).length;

  return (
    <div className="space-y-6 pb-24 w-full">
      <ParentPageHeader
        badge="Nutrition & services · ICDS"
        title="Nutrition & Services"
        subtitle="Meals, supplements, and nutrition history for your child"
      />

      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
        <p className="text-[10px] font-bold uppercase text-emerald-800">Today&apos;s menu</p>
        <p className="text-sm font-bold text-[#0F172A] mt-2">{TODAY_MENU}</p>
        <p className="text-xs text-emerald-900 mt-2">
          Status: {today?.childReceived ? "Meal served and recorded for your child" : "Awaiting center log"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GovParentChip label="Today" value={today?.childReceived ? "Complete" : "Pending"} tone={today?.childReceived ? "good" : "pending"} />
        <GovParentChip label="Missed (14d)" value={`${missed} days`} tone={missed ? "warn" : "good"} />
        <GovParentChip label="Supplements" value="On schedule" tone="good" />
        <GovParentChip label="ICDS compliance" value="Active" tone="good" />
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase text-slate-500 mb-3">Nutrition history</h2>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.date} className="worker-card p-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-sm">{format(new Date(r.date), "EEE, d MMM")}</p>
                <p className="text-xs text-slate-600">{r.menu}</p>
              </div>
              <span
                className={cn(
                  "text-xs font-bold uppercase px-2 py-1 rounded",
                  r.childReceived ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                )}
              >
                {r.childReceived ? "Received" : "Not recorded"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
