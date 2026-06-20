import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { generateCenterIntelligenceReport } from "@/services/ai/investigation-engine";
import {
  ExecutiveReportShell,
  ExecutiveSection,
  ExecutiveKpiGrid,
  ExecutiveGauge,
  ExecutiveBarChart,
} from "@/components/executive/ExecutiveReport";
import { mockCenters } from "@/data/mockData";
import { ArrowLeft, Building2 } from "lucide-react";

export default function AnganwadiAnalytics() {
  const { complaints } = useApp();
  const district = "Tirupati";
  const centers = mockCenters.filter((c) => c.district === district);
  const [selectedCenterId, setSelectedCenterId] = useState(centers[0]?.id ?? "");

  const districtGrievances = complaints.filter((c) => c.district === district);
  const selectedCenter = centers.find((c) => c.id === selectedCenterId) ?? centers[0];

  const report = useMemo(
    () => (selectedCenter ? generateCenterIntelligenceReport(selectedCenter.id, complaints) : null),
    [selectedCenter, complaints]
  );

  return (
    <ExecutiveReportShell
      badge="Executive Analytics · Anganwadi Centers"
      title="Anganwadi Analytics Command"
      subtitle={`${district} District · Complaint intelligence across all centers`}
    >
      <Link to="/supervisor" className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af]">
        <ArrowLeft className="h-3.5 w-3.5" /> Investigation Command
      </Link>

      <ExecutiveSection title="District Overview" number={1}>
        <ExecutiveKpiGrid
          items={[
            { label: "Centers", value: centers.length, tone: "neutral" },
            { label: "Total Grievances", value: districtGrievances.length, tone: "warn" },
            { label: "Pending", value: districtGrievances.filter((c) => c.status !== "closed").length, tone: "danger" },
            { label: "Resolved", value: districtGrievances.filter((c) => c.status === "closed").length, tone: "good" },
          ]}
        />
      </ExecutiveSection>

      <ExecutiveSection title="Select Anganwadi Center" number={2}>
        <div className="max-w-xl">
          <label htmlFor="center-select" className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1.5 mb-2">
            <Building2 className="h-3.5 w-3.5" /> Anganwadi Center
          </label>
          <select
            id="center-select"
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[#0F172A] focus:border-[#1e40af] focus:outline-none"
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.mandal} ({c.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-2">
            Select a center to view analytics. Open the center page to see AI recommendations based on all grievances at that center.
          </p>
        </div>
      </ExecutiveSection>

      {selectedCenter && report && (
        <ExecutiveSection title={selectedCenter.name} number={3}>
          <ExecutiveKpiGrid
            items={[
              { label: "Total Complaints", value: report.totalComplaints, tone: "neutral" },
              { label: "Resolved", value: report.resolved, tone: "good" },
              { label: "Pending", value: report.pending, tone: "warn" },
              { label: "High Priority", value: report.highPriority, tone: "danger" },
              { label: "Duplicates", value: report.duplicateComplaints, tone: "warn" },
              { label: "Fraud Cases", value: report.fraudCases, tone: "danger" },
              { label: "Avg Resolution (h)", value: report.avgResolutionHours, tone: "neutral" },
              { label: "Risk Score", value: report.riskScore, tone: report.riskScore > 70 ? "danger" : "good" },
            ]}
          />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <ExecutiveGauge label="Positive Sentiment" value={report.positiveSentiment} tone="emerald" />
            <ExecutiveGauge label="Negative Sentiment" value={report.negativeSentiment} tone="rose" />
            <ExecutiveGauge label="Parent Satisfaction" value={report.parentSatisfaction} tone="blue" />
            <ExecutiveGauge label="Beneficiary Trust" value={report.beneficiaryTrust} tone="emerald" />
          </div>
          <p className="text-sm mt-4 text-slate-700">{report.executiveSummary}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <ExecutiveBarChart data={report.monthlyTrends} />
            <ExecutiveBarChart data={report.topCategories} color="#c9a227" />
          </div>

          <Link
            to={`/supervisor/center/${selectedCenter.id}`}
            className="mt-6 inline-block gov-btn-primary text-xs"
          >
            Open AI Intelligence Center → View Recommendations
          </Link>
        </ExecutiveSection>
      )}
    </ExecutiveReportShell>
  );
}
