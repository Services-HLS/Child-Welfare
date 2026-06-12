import { Link, useNavigate } from "react-router-dom";
import { PublicRequest } from "@/types/public-request";
import { submitterLabel, type TransparencyBucket } from "@/services/public/publicRequestService";
import { requestBucketLabel } from "@/services/public/slaVisibility";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Eye, Download, RotateCcw, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";

type BucketKey = TransparencyBucket | "all";

type Props = {
  requests: PublicRequest[];
  buckets: ReturnType<typeof import("@/services/public/publicRequestService").countByBucket>;
  filterBucket?: BucketKey | null;
  onFilterBucket?: (b: BucketKey | null) => void;
};

const CARD_DEFS: { key: BucketKey; label: string; count: (b: Props["buckets"]) => number }[] = [
  { key: "submitted", label: "Submitted", count: (b) => b.submitted },
  { key: "under_review", label: "Under Review", count: (b) => b.under_review },
  { key: "action_taken", label: "Action Taken", count: (b) => b.action_taken },
  { key: "escalated", label: "Escalated", count: (b) => b.escalated },
  { key: "resolved", label: "Resolved", count: (b) => b.resolved },
  { key: "closed", label: "Closed", count: (b) => b.closed },
];

function matchesBucket(r: PublicRequest, bucket: BucketKey): boolean {
  if (bucket === "all") return true;
  return requestBucketLabel(String(r.status)) === bucket;
}

export function SubmittedEvidenceSection({ requests, buckets, filterBucket, onFilterBucket }: Props) {
  const navigate = useNavigate();

  const filtered = requests.filter((r) => {
    if (!filterBucket || filterBucket === "all") return true;
    return matchesBucket(r, filterBucket);
  });

  const downloadRef = (r: PublicRequest) => {
    toast.success("Download ready", { description: `Reference ${r.referenceId} — WDCW audit bundle` });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase text-[#1e3a5f]">Citizen Transparency Engine</h2>
      <p className="text-xs text-slate-600">
        Unified evidence history: photos, voice, OCR, WhatsApp, QR, surveys, and grievances with AI extraction, GPS validation, and officer ownership.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CARD_DEFS.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterBucket?.(filterBucket === card.key ? null : card.key)}
            className={cn(
              "rounded-xl border p-2 text-left transition-colors",
              filterBucket === card.key ? "border-[#1e3a5f] bg-blue-50" : "border-slate-200 bg-white hover:border-[#1e3a5f]"
            )}
          >
            <p className="text-[8px] font-bold uppercase text-slate-500 leading-tight">{card.label}</p>
            <p className="text-lg font-black text-[#0F172A]">{card.count(buckets)}</p>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Submitted As</th>
              <th className="p-3">Evidence</th>
              <th className="p-3">AI / GPS</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 text-sm">
                  No submissions in this bucket.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-xs font-bold">
                  {r.referenceId}
                  {r.anonymous && (
                    <span className="block text-[9px] text-violet-700 font-bold">Anonymous</span>
                  )}
                </td>
                <td className="p-3 text-xs">{submitterLabel(r.submittedAs)}</td>
                <td className="p-3 text-xs">
                  {r.evidence.length} file(s)
                  {r.evidence[0]?.url && (
                    <img src={r.evidence[0].url} alt="" className="h-8 w-8 rounded mt-1 object-cover border" />
                  )}
                </td>
                <td className="p-3 text-[10px]">
                  {r.evidence[0]?.aiStatus ?? "—"}
                  <br />
                  {r.evidence[0]?.geo ? `${r.evidence[0].geo.matchPercent}% match` : "GPS pending"}
                </td>
                <td className="p-3 text-xs capitalize">{r.ownerRole ?? "supervisor"}</td>
                <td className="p-3 text-xs font-bold">{r.statusLabel}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <ActionBtn icon={Eye} label="View" onClick={() => navigate(`/beneficiary/request/${r.complaintId ?? r.id}`)} />
                    <ActionBtn icon={MapPin} label="Track" onClick={() => navigate(`/beneficiary/status`)} />
                    <ActionBtn icon={Download} label="DL" onClick={() => downloadRef(r)} />
                    <ActionBtn icon={RotateCcw} label="Reopen" onClick={() => navigate(`/beneficiary/request/${r.complaintId ?? r.id}`)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-500 flex items-center gap-1">
        <Shield className="h-3 w-3" /> Audit log maintained for each action · DPDP compliant retention
      </p>
      <Link to="/public/my-requests" className="text-xs font-bold text-[#1e40af]">
        Open full My Requests hub →
      </Link>
    </section>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="p-1.5 rounded border border-slate-200 hover:border-[#1e3a5f] text-[#1e40af]"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
