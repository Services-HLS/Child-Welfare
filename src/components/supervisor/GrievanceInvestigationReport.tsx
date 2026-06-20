import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ComplaintRecord } from "@/types/platform";
import { generateInvestigationReport } from "@/services/ai/investigation-engine";
import { buildInvestigationDashboardData } from "@/services/ai/investigation-dashboard-data";
import {
  ExecutiveReportShell,
  ExecutiveSection,
  ExecutiveKpiGrid,
} from "@/components/executive/ExecutiveReport";
import { PublicEvidenceGallery } from "@/components/public/PublicEvidenceGallery";
import { InvestigationAIDashboard } from "@/components/supervisor/InvestigationVisualWidgets";
import {
  AIRecommendationCardData,
  AIRecommendationList,
  mapInvestigationRecommendation,
} from "@/components/executive/AIRecommendationCard";
import { getComplaintEvidence } from "@/lib/complaint-evidence";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";

function severityLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function GrievanceInvestigationReport({ complaint: c }: { complaint: ComplaintRecord }) {
  const { addGrievanceAction, advanceComplaint, updateComplaint, escalatePublicGrievance } = useApp();
  const report = useMemo(() => generateInvestigationReport(c), [c.id, c.updatedAt, c.category, c.description, c.title]);
  const xai = report.xai;
  const ca = xai.complaintAnalysis;

  const grievanceRecommendations = useMemo(
    () => report.recommendations.slice(0, 5).map(mapInvestigationRecommendation),
    [report]
  );

  const [comment, setComment] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("/placeholder-evidence.jpg");
  const [inspectionNote, setInspectionNote] = useState("");
  const [findings, setFindings] = useState("");

  const allEvidence = getComplaintEvidence(c);
  const photos = allEvidence.filter((e) => e.type === "photo");
  const videos = allEvidence.filter((e) => e.type === "video");
  const documents = allEvidence.filter((e) => e.type === "document");
  const voiceItems = allEvidence.filter((e) => e.type === "voice");
  const ocrDocs = allEvidence.filter((e) => e.type === "ocr");
  const hasGps = allEvidence.some((e) => e.label?.toLowerCase().includes("gps") || e.text?.includes("GPS"));
  const hasPhoto = photos.length > 0;

  const dashboardData = buildInvestigationDashboardData(c, xai, {
    hasPhoto,
    hasGps,
    hasOcr: xai.ocrAnalysis.hasOcr,
    hasVoice: voiceItems.length > 0,
  });

  const severity = severityLabel(report.severityMeter);

  const handleApplyRecommendation = (rec: AIRecommendationCardData) => {
    addGrievanceAction(c.id, {
      ownerRole: "supervisor",
      officerName: c.supervisorName ?? "Ravi Kumar · Supervisor",
      notes: `AI recommendation applied: ${rec.recommendation} · Status: Applied · Assigned to ${rec.officer} · Budget ${rec.estimatedBudget} · Confidence ${rec.confidenceScore}% · Notified via WhatsApp, SMS & Email`,
      timestamp: new Date().toISOString(),
    });
    updateComplaint(c.id, { status: "supervisor_review" });
    toast.success("AI recommendation applied — officers notified");
  };

  const logAction = (notes: string, status?: typeof c.status) => {
    addGrievanceAction(c.id, {
      ownerRole: "supervisor",
      officerName: c.supervisorName ?? "Ravi Kumar · Supervisor",
      notes,
      evidenceUrl: evidenceUrl || undefined,
      timestamp: new Date().toISOString(),
    });
    if (status) updateComplaint(c.id, { status });
  };

  const resolveCase = () => {
    const reportId = `RES-${Date.now().toString().slice(-6)}`;
    updateComplaint(c.id, {
      resolutionNote: comment || "Resolved per WDCW SOP",
      resolutionEvidenceUrl: evidenceUrl,
      resolutionAfterUrl: evidenceUrl,
      grievance: c.grievance
        ? {
            ...c.grievance,
            resolution: {
              note: comment,
              actionTaken: actionTaken || "Corrective action completed",
              evidenceUrl,
              resolvedBy: "supervisor",
              resolvedByName: c.supervisorName ?? "Supervisor",
              resolvedAt: new Date().toISOString(),
              reportId,
            },
            ownerRole: "supervisor",
          }
        : c.grievance,
    });
    logAction(`Resolution report ${reportId}: ${actionTaken || "Corrective action completed"}`, "beneficiary_confirmation");
    advanceComplaint(c.id, "beneficiary_confirmation");
    toast.success("Resolution proposed — citizen notified for confirmation");
  };

  let section = 0;

  return (
    <ExecutiveReportShell
      badge="AI Investigation Dashboard · Confidential"
      title={`Grievance ${c.id}`}
      subtitle={`${c.title} · ${c.centerName}`}
      footer={`Generated ${format(new Date(report.generatedAt), "PPpp")} · AnganSakti 360 · Supervisor Investigation`}
    >
      <div className="flex flex-wrap gap-3 -mt-2">
        <Link to="/supervisor" className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Investigation Command
        </Link>
        <Link to={`/supervisor/center/${c.centerId}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]">
          View Anganwadi Analytics →
        </Link>
      </div>

      <ExecutiveSection title="Case Overview" number={++section} variant="highlight">
        <ExecutiveKpiGrid
          items={[
            { label: "Grievance ID", value: c.id, tone: "neutral" },
            { label: "Category", value: c.category.replace(/_/g, " "), tone: "neutral" },
            { label: "Priority", value: String(c.priority ?? "medium"), tone: c.priority === "critical" ? "danger" : "warn" },
            { label: "Status", value: c.status.replace(/_/g, " "), tone: "neutral" },
            { label: "AI Score", value: `${dashboardData.totalScore}/100`, tone: "good" },
            { label: "Classification", value: ca.finalClassification, tone: "neutral" },
            { label: "Confidence", value: `${ca.confidenceScore}%`, tone: "good" },
            { label: "Severity", value: severity, tone: severity === "Critical" || severity === "High" ? "danger" : "warn" },
          ]}
        />
      </ExecutiveSection>

      <ExecutiveSection title="Citizen Complaint & Evidence" number={++section}>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
          <Meta label="Submitted As" value={c.submittedAs ? PUBLIC_FEEDBACK_SUBMITTER_LABELS[c.submittedAs] : "Citizen"} />
          <Meta label="Submitted By" value={c.anonymous ? "Anonymous Citizen" : c.beneficiaryName} />
          <Meta label="Submitted" value={format(new Date(c.createdAt), "PPp")} />
          <Meta label="Mobile" value={c.anonymous ? "Hidden (anonymous submission)" : (c.registeredMobile ?? "—")} />
        </dl>
        <p className="text-sm font-bold text-[#0c1f3d] mb-1">{c.title}</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{c.description}</p>

        {photos.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Images</p>
            <PublicEvidenceGallery items={photos} />
          </div>
        )}
        {videos.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Videos</p>
            <PublicEvidenceGallery items={videos} />
          </div>
        )}
        {documents.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Documents</p>
            <PublicEvidenceGallery items={documents} />
          </div>
        )}
        {voiceItems.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Voice</p>
            <PublicEvidenceGallery items={voiceItems} />
          </div>
        )}

        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 mb-4">
          <p className="text-[10px] font-bold uppercase text-slate-600 mb-1">Location</p>
          <p className="text-sm">{c.centerName} · {c.village ?? "—"} · {c.mandal ?? "—"} · {c.district}</p>
          {hasGps && <p className="text-xs text-emerald-700 mt-1">GPS evidence attached — see GPS Analysis below</p>}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Timeline</p>
          <ul className="space-y-2">
            {(c.grievanceActions ?? [{ id: "sub", ownerRole: "beneficiary" as const, officerName: c.beneficiaryName, notes: "Grievance submitted", timestamp: c.createdAt }]).map((a) => (
              <li key={a.id} className="text-sm border-l-4 border-[#1e40af] pl-3 py-0.5">
                <span className="font-bold capitalize">{a.ownerRole}</span> · {format(new Date(a.timestamp), "PPp")}
                <p className="text-slate-700">{a.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </ExecutiveSection>

      <ExecutiveSection title="AI Investigation Dashboard" number={++section}>
        <InvestigationAIDashboard
          data={dashboardData}
          xai={xai}
          ocrDocs={ocrDocs}
        />
      </ExecutiveSection>

      <ExecutiveSection title="AI Recommendations for This Grievance" number={++section}>
        <p className="text-xs text-slate-600 mb-4">
          {grievanceRecommendations.length} AI actions for grievance <strong>{c.id}</strong> — based on{" "}
          {ca.finalClassification}, {c.category.replace(/_/g, " ")} evidence, and {c.centerName} history.
          Click <strong>Show</strong> on any card to read the full explanation.
        </p>
        <AIRecommendationList
          items={grievanceRecommendations}
          onApplyRecommendation={handleApplyRecommendation}
        />
      </ExecutiveSection>

      <ExecutiveSection title="Supervisor Actions" number={++section}>
        <p className="text-xs text-slate-600 mb-3">Record investigation steps and close this grievance.</p>
        <textarea value={inspectionNote} onChange={(e) => setInspectionNote(e.target.value)} placeholder="Inspection notes…" className="w-full rounded-sm border p-3 text-sm min-h-[72px] mb-2" />
        <textarea value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="Record findings…" className="w-full rounded-sm border p-3 text-sm min-h-[72px] mb-2" />
        <input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className="w-full rounded-sm border px-3 py-2 text-sm mb-3" placeholder="Inspection photo / report URL" />
        <div className="flex flex-wrap gap-2 mb-4">
          <button type="button" className="gov-btn-outline text-xs" onClick={() => { logAction(inspectionNote || "Inspection photos uploaded"); toast.success("Inspection evidence saved"); }}>Upload Inspection Photos</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction(findings || "Findings recorded", "supervisor_review")}>Upload Report / Record Findings</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => logAction("Corrective action assigned to center")}>Assign Action</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => { updateComplaint(c.id, { status: "supervisor_review" }); toast.info("Status updated"); }}>Update Status</button>
          <button type="button" className="gov-btn-outline text-xs border-amber-300" onClick={() => { escalatePublicGrievance(c.id); toast.warning("Escalated to District Admin"); }}>Escalate</button>
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Resolution notes for citizen…" className="w-full rounded-sm border p-3 text-sm min-h-[72px]" />
        <input value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} className="w-full rounded-sm border px-3 py-2 text-sm mt-2" placeholder="Corrective action taken" />
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className="gov-btn-primary text-xs" onClick={resolveCase}>Propose Resolution</button>
          <button type="button" className="gov-btn-outline text-xs" onClick={() => { advanceComplaint(c.id, "closed", { beneficiaryConfirmed: true }); toast.success("Grievance closed"); }}>Close Grievance</button>
        </div>
      </ExecutiveSection>
    </ExecutiveReportShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}
