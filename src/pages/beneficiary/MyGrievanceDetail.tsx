import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { getPublicRequestById } from "@/services/public/publicRequestService";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { OcrEvidencePanel } from "@/components/public/OcrEvidencePanel";
import { PublicGrievanceTimeline } from "@/components/public/PublicGrievanceTimeline";
import { getComplaintEvidence } from "@/lib/complaint-evidence";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

function mapEvidence(
  requestEvidence: ReturnType<typeof getPublicRequestById>["evidence"] | undefined,
  complaint: Parameters<typeof getComplaintEvidence>[0]
) {
  const fromRequest = requestEvidence ?? [];
  const fromComplaint = getComplaintEvidence(complaint);
  return fromRequest.length > 0 ? fromRequest : fromComplaint;
}

export default function MyGrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useApp();
  const { complaints, feedback, omnichannelInputs, surveys } = usePublicPortal();

  const complaint = complaints.find((c) => c.id === id);
  if (!complaint || !user) {
    return <Navigate to="/beneficiary/my-grievances" replace />;
  }

  const isOwner =
    complaint.beneficiaryId === user.id ||
    (user.phone && complaint.registeredMobile === user.phone);
  if (!isOwner) {
    return <Navigate to="/beneficiary/my-grievances" replace />;
  }

  const request = getPublicRequestById(
    complaint.id,
    user.id,
    feedback,
    complaints,
    omnichannelInputs,
    surveys
  );

  const evidence = mapEvidence(request?.evidence, complaint);
  const ocrEvidence = evidence.filter((e) => e.type === "ocr");
  const otherEvidence = evidence.filter((e) => e.type !== "ocr");

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <Link
        to="/beneficiary/my-grievances"
        className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to My Grievances
      </Link>

      <PublicPageHeader
        badge="Grievance Details"
        title={complaint.title}
        subtitle={`${complaint.id} · ${complaint.centerName}`}
      />

      <div className="rounded-sm border-2 border-[#1e3a5f] bg-white overflow-hidden">
        <div className="bg-[#0c1f3d] text-white px-4 py-3 flex flex-wrap justify-between gap-2 items-start">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#c9a227]">Status</p>
            <p className="text-sm font-bold capitalize">{complaint.status.replace(/_/g, " ")}</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-sm bg-white/10">
            {complaint.priority ?? "medium"} priority
          </span>
        </div>

        <div className="p-4 space-y-5">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Detail label="Grievance ID" value={complaint.id} />
            <Detail label="Category" value={complaint.category.replace(/_/g, " ")} />
            <Detail label="Submitted" value={format(new Date(complaint.createdAt), "PPp")} />
            <Detail label="Center" value={complaint.centerName} />
            <Detail label="Village" value={complaint.village ?? "—"} />
            <Detail label="SLA Due" value={format(new Date(complaint.slaDueAt), "PPp")} />
          </dl>

          <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-1">Complaint Description</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {otherEvidence.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Uploaded Evidence</p>
              <PublicEvidenceGallery items={otherEvidence} />
            </div>
          )}

          {ocrEvidence.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">OCR Extraction</p>
              <p className="text-xs text-slate-500 mb-3">
                All text extracted from the uploaded PDF or document is shown in the <code className="text-[10px]">body</code> field below.
              </p>
              <div className="space-y-4">
                {ocrEvidence.map((item) => (
                  <OcrEvidencePanel key={item.id} item={item} fullText />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Resolution Progress</p>
            <PublicGrievanceTimeline status={complaint.status} />
          </div>

          {(complaint.grievanceActions ?? []).length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Officer Updates</p>
              <ul className="space-y-2">
                {complaint.grievanceActions!.map((a) => (
                  <li key={a.id} className="text-sm border-l-4 border-[#1e40af] pl-3 py-1">
                    <span className="font-bold capitalize text-xs">{a.ownerRole}</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      {format(new Date(a.timestamp), "PPp")}
                    </span>
                    <p className="text-slate-700 text-xs mt-0.5">{a.notes}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {complaint.resolutionNote && (
            <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase text-emerald-800">Resolution</p>
              <p className="text-sm text-emerald-900 mt-1">{complaint.resolutionNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
      <p className="font-semibold text-sm capitalize">{value}</p>
    </div>
  );
}
