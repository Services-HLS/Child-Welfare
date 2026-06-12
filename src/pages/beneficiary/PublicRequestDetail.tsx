import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { getPublicRequestById, submitterLabel } from "@/services/public/publicRequestService";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { PublicGrievanceTimeline } from "@/components/public/PublicGrievanceTimeline";
import { GrievanceAction } from "@/types/public-request";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Download, Clock, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIExplainabilityPanel } from "@/components/public/AIExplainabilityPanel";
import { EvidenceLocationCard } from "@/components/public/EvidenceLocationCard";
import { buildAIVerification, validateEvidenceLocation } from "@/services/public/evidenceVerification";

function actionsByRole(actions: GrievanceAction[], supervisorOwned: boolean) {
  return {
    worker: supervisorOwned ? [] : actions.filter((a) => a.ownerRole === "worker"),
    supervisor: actions.filter((a) => a.ownerRole === "supervisor" || a.ownerRole === "system"),
    district: actions.filter((a) => a.ownerRole === "district_admin" || a.ownerRole === "state_admin"),
  };
}

export default function PublicRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, advanceComplaint, escalatePublicGrievance, updateComplaint } = useApp();
  const { feedback, complaints, omnichannelInputs, surveys } = usePublicPortal();

  const request = id && user
    ? getPublicRequestById(id, user.id, feedback, complaints, omnichannelInputs, surveys)
    : null;

  if (!user) return null;
  if (!request) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Request not found.</p>
        <Link to="/beneficiary/my-child" className="text-sm font-bold text-[#1e40af] mt-2 inline-block">
          Back to My Services
        </Link>
      </div>
    );
  }

  const complaintId = request.complaintId ?? (request.type === "grievance" ? request.id : undefined);
  const supervisorOwned = request.complaint?.grievance?.ownerRole === "supervisor";
  const byRole = actionsByRole(request.actions, supervisorOwned);
  const statusForTimeline = request.complaint?.status ?? request.status;

  const confirmSatisfied = () => {
    if (!complaintId) {
      toast.success("Thank you — your feedback is recorded.");
      return;
    }
    advanceComplaint(complaintId, "closed", { beneficiaryConfirmed: true });
    toast.success("Closure confirmed — thank you for your feedback.");
  };

  const reopen = () => {
    if (!complaintId) {
      toast.info("Reopen is available for tracked grievances.");
      return;
    }
    updateComplaint(complaintId, { status: "supervisor_review", beneficiaryConfirmed: false });
    toast.info("Request reopened — returned to supervisor review.");
  };

  const escalate = () => {
    if (!complaintId) {
      toast.info("Escalation applies to grievance cases.");
      return;
    }
    escalatePublicGrievance(complaintId);
    toast.success("Escalated to senior officer for review.");
  };

  const downloadBundle = () => {
    toast.success("Download started", { description: `Reference ${request.referenceId} — demo export` });
  };

  return (
    <div className="space-y-6 pb-28 w-full">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-bold text-[#1e40af]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <PublicPageHeader
        badge="Public request · full transparency"
        title={request.title}
        subtitle={`Reference ${request.referenceId} · ${request.statusLabel}`}
      />

      {request.sla && (
        <div
          className={cn(
            "rounded-xl border p-4 flex flex-wrap justify-between gap-2",
            request.sla.breached ? "border-rose-300 bg-rose-50" : "border-amber-200 bg-amber-50"
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-700" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-600">SLA · {request.sla.targetHours}h target</p>
              <p className="text-sm font-bold">{request.sla.label}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 max-w-xs">{request.sla.escalationHint}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <Meta label="Submitted by" value={request.anonymous ? "Anonymous citizen" : user.name} />
        <Meta label="Submitted as" value={submitterLabel(request.submittedAs)} />
        <Meta label="Category" value={request.category ?? "—"} />
        <Meta label="Priority" value={request.priority ?? "Standard"} />
        <Meta label="Center" value={request.centerName ?? "—"} className="col-span-2" />
        <Meta label="Channel" value={(request.channel ?? "app").replace(/_/g, " ")} />
        <Meta label="Date" value={format(new Date(request.date), "PPp")} />
      </div>

      <Section title="Original Submission">
        <p className="text-sm text-slate-800 whitespace-pre-wrap">{request.summary}</p>
        {request.rating != null && (
          <p className="text-xs text-slate-500 mt-2">Rating: {request.rating}/5</p>
        )}
      </Section>

      <Section title="Uploaded Evidence">
        <PublicEvidenceGallery items={request.evidence} />
      </Section>

      <Section title="Extracted Content">
        {request.evidence.filter((e) => e.type === "ocr" || e.type === "transcript" || e.type === "text").length > 0 ? (
          <PublicEvidenceGallery
            items={request.evidence.filter((e) => e.type === "ocr" || e.type === "transcript" || e.type === "text")}
          />
        ) : (
          <p className="text-sm text-slate-500">No OCR or transcript extracted for this channel.</p>
        )}
      </Section>

      {request.aiExplain && request.complaint && (
        <AIExplainabilityPanel
          ai={buildAIVerification(
            request.summary,
            request.rating ?? 3,
            request.channel ?? "mobile_app",
            "en",
            request.complaint
          )}
        />
      )}

      {request.evidence[0]?.geo && (
        <EvidenceLocationCard
          geo={{
            ...validateEvidenceLocation(request.centerId ?? "AWC-TPT-01"),
            matchPercent: request.evidence[0].geo!.matchPercent,
            distanceMeters: request.evidence[0].geo!.distanceMeters,
            status: request.evidence[0].geo!.status,
            citizenSummary: request.evidence[0].geo!.citizenSummary,
          }}
          centerName={request.centerName ?? user.centerName ?? "Anganwadi"}
        />
      )}

      {request.complaint?.grievance?.aiAnalysis && !request.aiExplain && (
        <Section title="AI Summary">
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            <Meta label="Classification" value={request.complaint.grievance.aiAnalysis.issueClassification.replace(/_/g, " ")} />
            <Meta label="Severity" value={request.complaint.grievance.aiAnalysis.severity} />
            <Meta label="Confidence" value={`${Math.round(request.complaint.grievance.aiAnalysis.confidence * 100)}%`} />
            <Meta label="Language" value={request.complaint.grievance.aiAnalysis.detectedLanguage.toUpperCase()} />
          </dl>
          <p className="text-sm mt-2 text-slate-700">{request.complaint.grievance.aiAnalysis.extractedContext}</p>
        </Section>
      )}

      {complaintId && (
        <>
          <Section title="Resolution Timeline">
            <PublicGrievanceTimeline status={statusForTimeline} />
          </Section>

          <Section title="Supervisor Actions">
            {!supervisorOwned && <ActionRoleCard title="Worker Action" items={byRole.worker} />}
            <ActionRoleCard title="Supervisor Action" items={byRole.supervisor} className={supervisorOwned ? "" : "mt-3"} />
            <ActionRoleCard title="District Action" items={byRole.district} className="mt-3" />
          </Section>

          {request.resolution && (
            <Section title="Resolution Evidence">
              <div className="grid sm:grid-cols-2 gap-3">
                {request.resolution.beforeUrl && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Before</p>
                    <img src={request.resolution.beforeUrl} alt="" className="rounded-lg border w-full max-h-40 object-cover" />
                  </div>
                )}
                {(request.resolution.afterUrl || request.resolution.evidenceUrl) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">After</p>
                    <img
                      src={request.resolution.afterUrl ?? request.resolution.evidenceUrl}
                      alt=""
                      className="rounded-lg border w-full max-h-40 object-cover"
                    />
                  </div>
                )}
              </div>
              {request.resolution.note && (
                <p className="text-sm mt-3 text-slate-700">{request.resolution.note}</p>
              )}
              {request.resolution.documents?.map((doc) => (
                <a key={doc} href={doc} className="text-xs font-bold text-[#1e40af] block mt-2">
                  Document: {doc}
                </a>
              ))}
            </Section>
          )}

          {request.escalation && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Escalation path: {request.escalation.path.join(" → ") || "Worker → Supervisor → District"}
            </p>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2 sticky bottom-20 bg-white/95 py-3 border-t -mx-1 px-1">
        <button type="button" onClick={confirmSatisfied} className="gov-btn-primary text-xs">
          Satisfied
        </button>
        <button
          type="button"
          onClick={() => {
            toast.info("Not satisfied — reopening for supervisor");
            reopen();
          }}
          className="gov-btn-outline text-xs flex items-center gap-1 border-rose-200 text-rose-800"
        >
          <ThumbsDown className="h-3.5 w-3.5" /> Not Satisfied
        </button>
        <button type="button" onClick={reopen} className="gov-btn-outline text-xs">
          Reopen
        </button>
        <button type="button" onClick={escalate} className="gov-btn-outline text-xs border-amber-300 text-amber-900">
          Escalate to District
        </button>
        {complaintId && (request.status === "beneficiary_confirmation" || request.status === "resolution") && (
          <Link to="/beneficiary/surveys" className="gov-btn-outline text-xs">
            Satisfaction survey
          </Link>
        )}
        <button type="button" onClick={downloadBundle} className="gov-btn-outline text-xs ml-auto flex items-center gap-1">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-bold uppercase text-[#1e3a5f] mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Meta({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-lg bg-slate-50 border border-slate-100 p-2", className)}>
      <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  );
}

function ActionRoleCard({
  title,
  items,
  className,
}: {
  title: string;
  items: GrievanceAction[];
  className?: string;
}) {
  if (!items.length) {
    return (
      <div className={cn("rounded-xl border border-dashed border-slate-200 p-3", className)}>
        <p className="text-[10px] font-bold uppercase text-slate-400">{title}</p>
        <p className="text-xs text-slate-500 mt-1">No actions recorded yet.</p>
      </div>
    );
  }
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-bold uppercase text-slate-500">{title}</p>
      {items.map((a) => (
        <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <p className="text-sm font-bold text-slate-900">{a.officerName}</p>
          <p className="text-[10px] text-slate-500">{format(new Date(a.timestamp), "PPp")}</p>
          <p className="text-sm text-slate-700 mt-2">{a.notes}</p>
          {a.evidenceUrl && (
            <div className="mt-2">
              <p className="text-[9px] font-bold uppercase text-slate-500">Evidence</p>
              <img src={a.evidenceUrl} alt="" className="mt-1 rounded-lg border max-h-32 object-cover" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
