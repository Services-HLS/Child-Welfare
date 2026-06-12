import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useUploads } from "@/context/worker/hooks";
import {
  Camera,
  Upload,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Sparkles,
  X,
  History,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  syncing: "Syncing",
  verified: "Verified",
  failed: "Returned",
};

export default function Uploads() {
  const { activities, user, t } = useApp();
  const { uploadQueue, retryUpload, batchSync, online } = useUploads();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const selected = uploadQueue.find((u) => u.id === selectedId);
  const activityItem = selected?.sourceType === "activity" ? activities.find((a) => a.id === selected.sourceId) : null;

  const handleRetry = async (id: string) => {
    setUploading(true);
    await retryUpload(id);
    setUploading(false);
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">{t("service_submission_queue")}</h1>
          <p className="text-sm text-slate-600">Unified queue · attendance · sessions · activities · issues</p>
        </div>
        <button type="button" onClick={() => batchSync()} disabled={!online} className="gov-btn-primary text-xs flex items-center gap-1">
          <RefreshCw className="h-4 w-4" /> Batch sync
        </button>
      </div>

      <div className="grid gap-2">
        {uploadQueue.length === 0 ? (
          <p className="text-sm text-slate-500 p-4 worker-card border">All submissions verified.</p>
        ) : (
          uploadQueue.map((item) => (
            <div key={item.id} className="worker-card border p-4 flex flex-wrap justify-between gap-2 items-center">
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-[10px] text-slate-500 uppercase">
                  {item.sourceType} · {STATUS_LABEL[item.status]} · {item.evidenceCount} evidence
                </p>
                <p className="text-[10px] text-slate-400">
                  {format(new Date(item.audit.updatedAt), "MMM d, h:mm a")}
                  {item.audit.offline && !item.audit.synced ? " · offline" : ""}
                  {item.audit.verified ? " · verified" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {item.sourceType === "activity" && item.status === "draft" && (
                  <button type="button" onClick={() => setSelectedId(item.id)} className="text-xs font-bold text-[#1e40af]">
                    Add proof
                  </button>
                )}
                {(item.status === "pending" || item.status === "failed") && (
                  <button type="button" disabled={uploading} onClick={() => handleRetry(item.id)} className="text-xs font-bold text-emerald-700">
                    Retry
                  </button>
                )}
                {item.sourceType === "session" && item.status === "verified" && (
                  <Link to={`/worker/session-feedback/${item.sourceId}`} className="text-xs font-bold text-[#1e40af]">Summary</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedId && activityItem && (
        <div className="worker-card border p-4 space-y-3">
          <div className="flex justify-between">
            <h3 className="text-sm font-bold">Upload evidence: {activityItem.type}</h3>
            <button type="button" onClick={() => { setSelectedId(null); setImage(null); }}><X className="h-4 w-4" /></button>
          </div>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setImage(r.result as string);
            r.readAsDataURL(f);
          }} className="text-xs" />
          {image && (
            <button type="button" className="w-full py-2 bg-[#1e3a5f] text-white text-xs font-bold" onClick={() => {
              handleRetry(selectedId);
              toast.success("Evidence queued for verification");
              setSelectedId(null);
            }}>
              Submit to queue
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-500 flex items-center gap-1">
        <History className="h-3 w-3" /> Worker: {user?.name} · Center {user?.centerId}
      </p>
    </div>
  );
}
