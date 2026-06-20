import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { generateCenterIntelligenceReport } from "@/services/ai/investigation-engine";
import { buildDistrictAnalyticsRecommendations } from "@/services/grievance/anganwadiAnalyticsRecommendations";
import {
  ExecutiveReportShell,
  ExecutiveSection,
  ExecutiveKpiGrid,
  ExecutiveGauge,
  ExecutiveBarChart,
} from "@/components/executive/ExecutiveReport";
import {
  AIRecommendationList,
  mapInvestigationRecommendation,
} from "@/components/executive/AIRecommendationCard";
import { mockCenters } from "@/data/mockData";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AnganwadiAnalytics() {
  const { complaints } = useApp();
  const district = "Tirupati";
  const centers = mockCenters.filter((c) => c.district === district);
  const districtGrievances = complaints.filter((c) => c.district === district);

  const districtRecommendations = useMemo(
    () => buildDistrictAnalyticsRecommendations(complaints, district),
    [complaints, district]
  );

  const handleDistrictApply = (rec: (typeof districtRecommendations)[number]) => {
    toast.success(`District recommendation applied: ${rec.recommendation} · Budget ${rec.estimatedBudget}`);
  };

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

      <ExecutiveSection title="AI Recommendations · All District Grievances" number={2}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-[#1e40af]" />
          <p className="text-xs text-slate-600">
            {districtRecommendations.length} AI actions based on all {districtGrievances.length} grievance(s) across{" "}
            {centers.length} Anganwadi centers in {district}. Click <strong>Show</strong> for full explanation.
          </p>
        </div>
        <div className="mt-4">
          <AIRecommendationList
            items={districtRecommendations}
            onApplyRecommendation={handleDistrictApply}
          />
        </div>
      </ExecutiveSection>

      <div className="space-y-6">
        {centers.map((center, centerIndex) => {
          const report = generateCenterIntelligenceReport(center.id, complaints);
          const centerRecs = report.recommendations.map((r) =>
            mapInvestigationRecommendation({ ...r, id: `${center.id}-${r.id}` })
          );

          return (
            <ExecutiveSection key={center.id} title={center.name} number={centerIndex + 3}>
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

              <div className="mt-6 rounded-sm border border-[#c9a227]/30 bg-amber-50/40 p-4">
                <p className="text-[10px] font-bold uppercase text-[#0c1f3d] mb-1">
                  AI Recommendations · {report.totalComplaints} Grievance(s) at This Center
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  {centerRecs.length} actions derived from all grievances at {center.name} — category mix, pending backlog, and risk score {report.riskScore}.
                </p>
                <AIRecommendationList items={centerRecs} />
              </div>

              <Link
                to={`/supervisor/center/${center.id}`}
                className="mt-4 inline-block gov-btn-primary text-xs"
              >
                Open AI Intelligence Center →
              </Link>
            </ExecutiveSection>
          );
        })}
      </div>
    </ExecutiveReportShell>
  );
}
