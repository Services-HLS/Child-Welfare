import { IntegrationStatus } from "@/types/platform";
import { storageKeys, lsGet, lsSet } from "@/lib/storage";
import { useState } from "react";
import { toast } from "sonner";
import { Plug, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultIntegrations: IntegrationStatus[] = [
  { id: "icds", name: "ICDS MIS", description: "Integrated Child Development Services — beneficiary registry sync", status: "connected", lastSync: new Date().toISOString() },
  { id: "poshan", name: "POSHAN Tracker", description: "Nutrition & growth monitoring national platform", status: "connected", lastSync: new Date().toISOString() },
  { id: "attendance", name: "State Attendance API", description: "Worker geo-attendance federation", status: "pending" },
  { id: "reporting", name: "AP Govt Reporting Hub", description: "District compliance PDF & CSV exports", status: "pending" },
  { id: "beneficiary", name: "Beneficiary Master Dataset", description: "Parent-child linkage & Aadhaar tokenized IDs", status: "connected", lastSync: new Date().toISOString() },
];

export default function Integrations({ scope }: { scope: "district" | "state" }) {
  const [items, setItems] = useState<IntegrationStatus[]>(() =>
    lsGet(storageKeys.integrations, defaultIntegrations)
  );

  const sync = (id: string) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 1500)),
      { loading: "Syncing…", success: `${id} sync complete (mock)` }
    );
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, lastSync: new Date().toISOString(), status: "connected" as const } : i))
    );
    lsSet(storageKeys.integrations, items);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black uppercase">Integration Layer</h1>
        <p className="text-sm text-slate-500">
          {scope === "state" ? "Statewide API connections (mock — ready for backend)" : "District integration status"}
        </p>
      </div>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="rounded-2xl border border-slate-100 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Plug className="h-6 w-6" />
              </div>
              <div>
                <div className="font-black text-slate-900">{i.name}</div>
                <div className="text-xs text-slate-500 max-w-md">{i.description}</div>
                {i.lastSync && <div className="text-[10px] text-slate-400 mt-1">Last sync: {new Date(i.lastSync).toLocaleString()}</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1",
                i.status === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                {i.status === "connected" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {i.status}
              </span>
              <button onClick={() => sync(i.id)} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase hover:bg-slate-50">
                <RefreshCw className="h-3 w-3" /> Sync
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
