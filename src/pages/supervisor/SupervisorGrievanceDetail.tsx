import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { PublicGrievanceTimeline } from "@/components/public/PublicGrievanceTimeline";
import { PublicEvidenceItem } from "@/types/public-request";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { priorityLabel } from "@/services/grievance/publicGrievanceService";

export default function SupervisorGrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { complaints, addGrievanceAction, advanceComplaint, updateComplaint } = useApp();
  const c = complaints.find((x) => x.id === id);

  const [comment, setComment] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("/evidence.jpg");
  const [actionTaken, setActionTaken] = useState("");
  const [eta, setEta] = useState("");

  if (!c) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Grievance not found.</p>
        <Link to="/supervisor/public-grievance-center" className="text-sm font-bold text-[#1e40af]">
          Back to Public Grievance Center
        </Link>
      </div>
    );
  }

  const ai = c.grievance?.aiAnalysis;
  const evidence: PublicEvidenceItem[] = (c.grievance?.evidence ?? c.citizenEvidence ?? []).map((e) => ({
    id: e.id,
    type: e.type === "document" ? "document" : e.type === "photo" ? "photo" : e.type === "voice" ? "voice" : "text",
    url: e.url,
    text: e.text ?? e.label,
    label: e.label,
    uploadedAt: e.uploadedAt,
  }));

  const logAction = (notes: string, status?: typeof c.status) => {
    addGrievanceAction(c.id, {
      ownerRole: "supervisor",
      officerName: c.supervisorName ?? "Supervisor · Tirupati",
      notes,
      evidenceUrl: evidenceUrl || undefined,
      timestamp: new Date().toISOString(),
    });
    if (status) updateComplaint(c.id, { status });
  };

  const resolveCase = () => {
    const reportId = `RES-${Date.now().toString().slice(-6)}`;
    const resolution = {
      note: comment || "Resolved per WDCW SOP",
      actionTaken: actionTaken || "Supervisor verified citizen evidence and closed the case",
      evidenceUrl,
      afterUrl: evidenceUrl,
      beforeUrl: c.resolutionBeforeUrl,
      estimatedCompletion: eta || new Date().toISOString(),
      resolvedBy: "supervisor" as const,
      resolvedByName: c.supervisorName ?? "Supervisor · Tirupati",
      resolvedAt: new Date().toISOString(),
      reportId,
    };
    updateComplaint(c.id, {
      resolutionNote: resolution.note,
      resolutionEvidenceUrl: evidenceUrl,
      resolutionAfterUrl: evidenceUrl,
      grievance: c.grievance
        ? { ...c.grievance, resolution, ownerRole: "supervisor" }
        : c.grievance,
    });
    logAction(`Resolution report ${reportId}: ${resolution.actionTaken}`, "beneficiary_confirmation");
    advanceComplaint(c.id, "beneficiary_confirmation");
    toast.success("Resolution report generated — citizen notified");
  };

  return (
    <div className="space-y-6 pb-28">
      <Link to="/supervisor/public-grievance-center" className="flex items-center gap-1 text-xs font-bold text-[#1e40af]">
        <ArrowLeft className="h-3.5 w-3.5" /> Public Grievance Center
      </Link>

      <div>
        <p className="text-[10px] font-mono font-bold text-slate-500">{c.id}</p>
        <h1 className="text-2xl font-black text-[#0F172A]">{c.title}</h1>
        <p className="text-sm text-slate-600 mt-1">Owner: Supervisor · No worker routing</p>
      </div>

      <Section title="Citizen Submission">
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <Item label="Who submitted" value={c.beneficiaryName} />
          <Item label="Submitted as" value={c.submittedAs ? PUBLIC_FEEDBACK_SUBMITTER_LABELS[c.submittedAs] : "Public citizen"} />
          <Item label="Category" value={c.category.replace(/_/g, " ")} />
          <Item label="Center" value={c.centerName} />
          <Item label="Priority" value={priorityLabel(c.grievance?.citizenPriority ?? c.priority)} />
        </dl>
        <p className="text-sm mt-3 text-slate-800 whitespace-pre-wrap">{c.description}</p>
        <div className="mt-3">
          <PublicGrievanceTimeline status={c.status} />
        </div>
      </Section>

      {ai && (
        <Section title="AI Findings">
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            <Item label="Issue classification" value={ai.issueClassification.replace(/_/g, " ")} />
            <Item label="Severity" value={ai.severity} />
            <Item label="Language" value={ai.detectedLanguage.toUpperCase()} />
            <Item label="Confidence" value={`${Math.round(ai.confidence * 100)}%`} />
          </dl>
          <p className="text-sm mt-2"><strong>Extracted summary:</strong> {ai.extractedContext}</p>
          <p className="text-sm mt-2"><strong>Recommended action:</strong> {ai.recommendedAction}</p>
          <p className="text-xs text-slate-500 mt-1">Path: {ai.suggestedResolutionPath.join(" → ")}</p>
        </Section>
      )}

      <Section title="Evidence">
        <PublicEvidenceGallery items={evidence} />
        {evidence.some((e) => e.type === "ocr" || e.text) && (
          <div className="mt-3 rounded-lg border border-dashed p-3 text-xs text-slate-600">
            Uploaded content → OCR / transcript → extracted complaint text shown above in AI findings.
          </div>
        )}
      </Section>

      <Section title="History">
        <ul className="space-y-2">
          {(c.grievanceActions ?? []).map((a) => (
            <li key={a.id} className="text-sm border-l-2 border-blue-200 pl-3">
              <span className="font-bold capitalize">{a.ownerRole}</span> · {a.officerName} — {a.notes}
              <span className="text-[10px] text-slate-500 block">{format(new Date(a.timestamp), "PPp")}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Supervisor Investigation Panel">
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Resolution note…" className="w-full rounded-lg border p-3 text-sm min-h-[72px]" />
        <input value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mt-2" placeholder="Action taken" />
        <input value={eta} onChange={(e) => setEta(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mt-2" placeholder="Estimated completion (e.g. 2 days)" />
        <input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mt-2" placeholder="Resolution evidence URL" />
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction(comment || "Supervisor review started", "supervisor_review")}>Review</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction(comment || "Additional evidence requested", "need_evidence")}>Request More Evidence</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction(comment || "Citizen contacted for clarification")}>Call Citizen</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction(comment || "Center visit scheduled")}>Schedule Visit</button>
          <button type="button" className="gov-btn-primary text-xs" onClick={resolveCase}>Resolve</button>
          <button type="button" className="gov-btn-outline text-xs border-amber-300" onClick={() => logAction(comment || "Escalated to district", "district_escalation")}>Escalate District</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 border-t pt-3">
          <button type="button" className="gov-btn-primary text-xs flex-1" onClick={() => { resolveCase(); toast.success("Resolution approved"); }}>
            Approve Resolution
          </button>
          <button type="button" className="gov-btn-outline text-xs flex-1 border-red-200 text-red-800" onClick={() => { logAction("Escalated to district administration", "district_escalation"); toast.warning("District notified"); }}>
            Escalate District
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="text-xs font-bold uppercase text-[#1e3a5f] mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}
