import { Link, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { generateCenterIntelligenceReport } from "@/services/ai/investigation-engine";
import {
  ExecutiveReportShell,
  ExecutiveSection,
  ExecutiveKpiGrid,
  ExecutiveGauge,
  ExecutiveExplainPanel,
  ExecutiveBarChart,
  ExecutivePieLegend,
} from "@/components/executive/ExecutiveReport";
import { AIRecommendationList, mapInvestigationRecommendation } from "@/components/executive/AIRecommendationCard";
import { mockCenters } from "@/data/mockData";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export default function CenterIntelligenceReportPage() {
  const { id, centerId } = useParams<{ id?: string; centerId?: string }>();
  const { complaints } = useApp();
  const resolvedCenterId = centerId ?? id ?? "";
  const report = generateCenterIntelligenceReport(resolvedCenterId, complaints);
  const center = mockCenters.find((c) => c.id === resolvedCenterId);
  const centerGrievances = complaints.filter((c) => c.centerId === resolvedCenterId);

  let section = 0;

  return (
    <ExecutiveReportShell
      badge="Anganwadi AI Intelligence Center · Confidential"
      title={center?.name ?? report.centerName}
      subtitle={`${center?.village ?? "—"} · ${center?.mandal ?? "—"} · All grievance history analysis`}
      footer={`Generated ${format(new Date(report.generatedAt), "PPpp")} · AnganSakti 360 · Center Analytics`}
    >
      <Link to="/supervisor/anganwadi-analytics" className="inline-flex items-center gap-1 text-xs font-bold text-[#1e40af] -mt-2">
        <ArrowLeft className="h-3.5 w-3.5" /> All Centers
      </Link>

      <ExecutiveSection title="Executive Summary" number={++section} variant="highlight">
        <ExecutiveKpiGrid
          items={[
            { label: "Total Grievances", value: report.totalComplaints, tone: "neutral" },
            { label: "Resolved", value: report.resolved, tone: "good" },
            { label: "Pending", value: report.pending, tone: "warn" },
            { label: "Avg Resolution", value: `${report.avgResolutionDays} days`, tone: "neutral" },
            { label: "Center Health", value: `${report.centerHealthScore}/100`, tone: report.centerHealthScore > 60 ? "good" : "warn" },
            { label: "Center Risk Score", value: `${report.riskScore}/100`, tone: report.riskScore > 70 ? "danger" : "warn" },
          ]}
        />
        <p className="text-sm mt-4 text-slate-700">{report.executiveSummary}</p>
      </ExecutiveSection>

      <ExecutiveSection title="Complaint Trends" number={++section}>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Monthly Complaints</p>
            <ExecutiveBarChart data={report.monthlyTrends} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Yearly Trend</p>
            <ExecutiveBarChart data={report.yearlyTrends} color="#138808" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Category Distribution</p>
            <ExecutiveBarChart data={report.complaintDistribution} color="#c9a227" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Seasonal Comparison</p>
            <ExecutiveBarChart data={report.seasonalComparison} color="#7c3aed" />
          </div>
        </div>
      </ExecutiveSection>

      <ExecutiveSection title="Fraud Detection" number={++section} variant="warning">
        <p className="text-sm text-slate-600 mb-3">Analysis of all grievances submitted for this center.</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {report.fraudSignals.map((signal) => (
            <div key={signal.label} className={`rounded-sm border p-3 ${signal.count > 0 ? "border-amber-300 bg-amber-50/50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-[#0c1f3d]">{signal.label}</p>
                <span className="text-sm font-black">{signal.count}</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">{signal.detail}</p>
            </div>
          ))}
        </div>
        <div className="rounded-sm border-2 border-amber-400 bg-amber-50 p-4 mb-3">
          <p className="text-sm font-bold text-amber-900">Overall Fraud Risk: {report.overallFraudRisk}</p>
          <p className="text-xs text-amber-800 mt-1">{report.fraudRecommendation}</p>
        </div>
        <ExecutiveExplainPanel block={report.fraudAnalysis} />
      </ExecutiveSection>

      <ExecutiveSection title="Sentiment Analysis" number={++section}>
        <ExecutiveKpiGrid
          items={[
            { label: "Positive", value: `${report.positiveSentiment}%`, tone: "good" },
            { label: "Neutral", value: `${report.neutralSentiment}%`, tone: "neutral" },
            { label: "Negative", value: `${report.negativeSentiment}%`, tone: "danger" },
          ]}
        />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <ExecutivePieLegend data={[
            { label: "Positive", value: report.positiveSentiment },
            { label: "Neutral", value: report.neutralSentiment },
            { label: "Negative", value: report.negativeSentiment },
          ]} />
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Top Emotions</p>
            <div className="flex flex-wrap gap-2">
              {report.topEmotions.map((e) => (
                <span key={e} className="text-xs px-2 py-1 rounded-sm bg-blue-100 text-blue-900 font-semibold">{e}</span>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase text-slate-600 mt-3 mb-2">Common Citizen Concerns</p>
            <ul className="text-xs space-y-1">{report.commonConcerns.map((c) => <li key={c}>• {c}</li>)}</ul>
            <p className="text-[10px] font-bold uppercase text-slate-600 mt-3 mb-2">Trust Trend</p>
            <p className="text-xs text-slate-700">{report.trustTrend}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Most Frequent Words</p>
          <ExecutiveBarChart data={report.frequentWords} color="#1e40af" />
        </div>
        <div className="mt-4"><ExecutiveExplainPanel block={report.sentimentAnalysis} /></div>
      </ExecutiveSection>

      <ExecutiveSection title="Root Cause Analysis" number={++section}>
        <p className="text-sm text-slate-700 mb-4">{report.rootCauseExplanation}</p>
        <div className="space-y-2 mb-4">
          {report.rootCauseBreakdown.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="text-xs font-bold w-32 shrink-0 capitalize">{r.label}</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-sm overflow-hidden border">
                <div className="h-full bg-[#1e40af]" style={{ width: `${r.value}%` }} />
              </div>
              <span className="text-xs font-bold w-10 text-right">{r.value}%</span>
            </div>
          ))}
        </div>
        <ExecutiveExplainPanel block={report.rootCauseAnalysis} />
      </ExecutiveSection>

      <ExecutiveSection title="Predictive Analytics" number={++section}>
        <p className="text-xs text-slate-600 mb-4">{report.predictionExplanation}</p>
        <div className="space-y-4">
          {report.predictions.map((p) => (
            <div key={p.id} className="rounded-sm border border-violet-200 bg-violet-50/30 p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-violet-900">{p.label}</h4>
                <span className="text-xl font-black text-violet-700">{p.probability}%</span>
              </div>
              <p className="text-xs text-slate-700">{p.trendAnalysis}</p>
              <p className="text-[10px] text-slate-500 mt-1">Seasonality: {p.seasonality} · Horizon: {p.horizonDays} days</p>
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-rose-800 mt-4">{report.futureRiskPrediction}</p>
      </ExecutiveSection>

      <ExecutiveSection title="AI Recommendations" number={++section}>
        <AIRecommendationList items={report.recommendations.map(mapInvestigationRecommendation)} />
      </ExecutiveSection>

      <ExecutiveSection title="Center Performance Dashboard" number={++section}>
        <ExecutiveKpiGrid
          items={[
            { label: "Resolution Rate", value: `${report.performance.resolutionRate}%`, tone: "good" },
            { label: "Citizen Satisfaction", value: `${report.performance.citizenSatisfaction}%`, tone: "good" },
            { label: "Avg Resolution Time", value: `${report.performance.avgResolutionDays} days`, tone: "neutral" },
            { label: "Worker Performance", value: `${report.performance.workerPerformance}%`, tone: "warn" },
            { label: "Center Health Score", value: `${report.performance.centerHealthScore}/100`, tone: "good" },
            { label: "Service Quality", value: `${report.performance.serviceQualityScore}/100`, tone: "good" },
          ]}
        />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <ExecutiveGauge label="Parent Satisfaction" value={report.parentSatisfaction} tone="blue" />
          <ExecutiveGauge label="Beneficiary Trust" value={report.beneficiaryTrust} tone="emerald" />
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">12-Month Trend</p>
          <ExecutiveBarChart data={report.performance.monthlyTrend} color="#138808" />
        </div>
        <p className="text-xs text-slate-600 mt-3">{report.workerPerformanceImpact}</p>
      </ExecutiveSection>

      <ExecutiveSection title="Final AI Summary" number={++section} variant="highlight">
        <p className="text-sm leading-relaxed text-slate-800">{report.finalAISummary}</p>
      </ExecutiveSection>

      {centerGrievances.length > 0 && (
        <ExecutiveSection title="Grievance Register" number={++section}>
          <p className="text-xs text-slate-600 mb-3">All grievances for this center — click to open investigation report.</p>
          <ul className="space-y-2">
            {centerGrievances.map((g) => (
              <li key={g.id}>
                <Link to={`/supervisor/grievance/${g.id}`} className="block rounded-sm border p-3 hover:border-[#1e40af] hover:bg-blue-50/30 transition-colors">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-bold text-[#0c1f3d]">{g.id} · {g.title}</span>
                    <span className="text-[10px] font-bold uppercase capitalize">{g.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 capitalize">{g.category.replace(/_/g, " ")} · {format(new Date(g.createdAt), "PP")}</p>
                </Link>
              </li>
            ))}
          </ul>
        </ExecutiveSection>
      )}
    </ExecutiveReportShell>
  );
}
