import { Link } from "react-router-dom";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { SubmittedEvidenceSection } from "@/components/beneficiary/SubmittedEvidenceSection";
import { useState } from "react";
import type { TransparencyBucket } from "@/services/public/publicRequestService";

/** Public citizen request tracker — alias route /public/my-requests */
export default function MyRequests() {
  const { publicRequests, requestBuckets } = usePublicPortal();
  const [filter, setFilter] = useState<TransparencyBucket | null>(null);

  return (
    <div className="space-y-6 pb-24 w-full">
      <PublicPageHeader
        badge="WDCW · Public portal"
        title="My Requests"
        subtitle="Submitted evidence, AI summaries, supervisor actions, and resolution proof"
      />
      <p className="text-xs text-slate-600 rounded-lg border bg-slate-50 p-3">
        Grievances are investigated by <strong>supervisors</strong> using your uploaded evidence. Anganwadi workers are not assigned as grievance handlers.
      </p>
      <SubmittedEvidenceSection
        requests={publicRequests}
        buckets={requestBuckets}
        filterBucket={filter}
        onFilterBucket={setFilter}
      />
      <div className="flex flex-wrap gap-4 text-sm font-bold text-[#1e40af]">
        <Link to="/beneficiary/omnichannel-feedback">Report Issue →</Link>
        <Link to="/beneficiary/feedback">Share Experience →</Link>
      </div>
    </div>
  );
}
