import { PublicEvidenceItem } from "@/types/public-request";
import { OcrEvidencePanel } from "@/components/public/OcrEvidencePanel";
import { ExecutiveBarChart, ExecutiveGauge, ExecutiveKpiGrid } from "@/components/executive/ExecutiveReport";
import { InvestigationDashboardData } from "@/services/ai/investigation-dashboard-data";
import { XAIInvestigationBundle } from "@/types/investigation-xai";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export type DashboardRecommendation = InvestigationDashboardData["recommendations"][number];

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-sm border border-slate-200 bg-white overflow-hidden", className)}>
      <div className="bg-[#1e3a5f] text-white px-3 py-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

function ProgressRow({ label, value, max = 100, tone = "blue" }: { label: string; value: number; max?: number; tone?: "blue" | "emerald" | "amber" | "rose" }) {
  return <ExecutiveGauge label={label} value={value} max={max} tone={tone} />;
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {headers.map((h) => (
              <th key={h} className="text-left p-2 font-bold uppercase text-[9px] text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="p-2 text-slate-800 capitalize">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
  const colors = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-600" };
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full mr-2", colors[status])} />;
}

export function InvestigationAIDashboard({
  data,
  xai,
  ocrDocs,
}: {
  data: InvestigationDashboardData;
  xai: XAIInvestigationBundle;
  ocrDocs: PublicEvidenceItem[];
}) {
  return (
    <div className="space-y-4">
      <SectionCard title="AI Decision Scorecard">
        <DataTable
          headers={["AI Feature", "Extracted Value", "Weight", "Score"]}
          rows={data.scorecard.map((r) => [r.feature, r.extractedValue, `${r.weight}%`, r.score])}
        />
        <div className="mt-4 space-y-2">
          {data.scorecard.map((r) => (
            <div key={r.feature} className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>{r.feature}</span>
                <span>{r.score} pts</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-sm overflow-hidden">
                <div className="h-full bg-[#1e40af]" style={{ width: `${Math.min(100, (r.score / r.weight) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <div className="rounded-sm border-2 border-[#1e40af] bg-blue-50 p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-500">Total AI Score</p>
            <p className="text-2xl font-black text-[#1e40af]">{data.totalScore} / 100</p>
          </div>
          <div className="rounded-sm border-2 border-[#c9a227] bg-amber-50 p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-500">Final Classification</p>
            <p className="text-sm font-black text-[#0c1f3d]">{data.finalClassification}</p>
          </div>
          <div className="rounded-sm border-2 border-emerald-400 bg-emerald-50 p-3 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-500">Confidence</p>
            <p className="text-2xl font-black text-emerald-800">{data.confidence}%</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Complaint Text Analysis">
          <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Complaint Text</p>
          <p className="text-xs text-slate-800 bg-slate-50 border rounded-sm p-2 mb-3 max-h-20 overflow-y-auto">{data.complaintText}</p>
          <ExecutiveKpiGrid
            items={[
              { label: "Semantic Similarity", value: `${data.semanticSimilarity}%`, tone: "good" },
              { label: "Keyword Match", value: `${xai.complaintAnalysis.keywordMatchScore}%`, tone: "neutral" },
            ]}
          />
          <p className="text-[9px] font-bold uppercase text-slate-500 mt-4 mb-2">Keyword Contribution</p>
          <DataTable
            headers={["Keyword", "Frequency", "Importance", "Contribution"]}
            rows={data.keywords.map((k) => [k.keyword, k.frequency, k.importance, `${k.contribution}%`])}
          />
          <div className="mt-3">
            <ExecutiveBarChart data={data.keywordChart} color="#1e40af" />
          </div>
        </SectionCard>

        <SectionCard title="Image Analysis">
          {xai.imageAnalysis.hasImage ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-xs mb-3">
                <Meta label="Capture Time" value={data.imageMeta.captureTime} />
                <Meta label="GPS Available" value={data.imageMeta.gpsAvailable} />
                <Meta label="Camera Device" value={data.imageMeta.device} />
                <Meta label="Resolution" value={data.imageMeta.resolution} />
                <Meta label="Duplicate Match" value={data.imageMeta.duplicateMatch} />
                <Meta label="Authenticity" value={data.imageMeta.authenticity} />
              </dl>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[9px] font-bold uppercase text-emerald-700 mb-1">Detected Objects</p>
                  <ul className="text-xs space-y-0.5">{data.imageMeta.detectedObjects.map((o) => <li key={o}>• {o}</li>)}</ul>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-rose-700 mb-1">Missing Objects</p>
                  <ul className="text-xs space-y-0.5">{data.imageMeta.missingObjects.map((o) => <li key={o}>• {o}</li>)}</ul>
                </div>
              </div>
              <ProgressRow label={`Image Integrity ${data.imageMeta.integrity}%`} value={data.imageMeta.integrity} tone="emerald" />
              <div className="mt-3 space-y-2">
                {data.imageMeta.objectConfidences.map((o) => (
                  <ProgressRow key={o.label} label={o.label} value={o.value} tone="blue" />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No image submitted — analysis skipped.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="GPS Analysis">
          <DataTable
            headers={["Location", "Latitude", "Longitude"]}
            rows={[
              ["Registered Center", data.gps.centerLat, data.gps.centerLng],
              ["Citizen GPS", data.gps.citizenLat, data.gps.citizenLng],
            ]}
          />
          <ExecutiveKpiGrid
            items={[
              { label: "Distance", value: `${data.gps.distanceMeters} meters`, tone: "good" },
              { label: "GPS Match", value: `${data.gps.matchPercent}%`, tone: "good" },
              { label: "Accuracy", value: data.gps.accuracy, tone: "neutral" },
            ]}
          />
          <div className="mt-3 rounded-sm border bg-slate-100 h-32 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <MapPin className="h-8 w-8" />
            </div>
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#1e40af] border-2 border-white shadow" />
            <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
            <p className="absolute bottom-1 left-2 text-[9px] font-bold text-slate-600">● Center · ● Citizen</p>
          </div>
        </SectionCard>

        <SectionCard title="Historical Match Engine">
          <DataTable
            headers={["Metric", "Value"]}
            rows={[
              [data.historical.categoryLabel, "—"],
              ["Current Center Complaints", data.historical.center],
              ["District Complaints", data.historical.district],
              ["Resolved Similar Cases", data.historical.resolved],
              ["Recurring Pattern", data.historical.recurring ? "YES" : "NO"],
            ]}
          />
          <div className="mt-3 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.historical.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Operational Data Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2 text-left font-bold uppercase text-[9px] text-slate-500">Metric</th>
                <th className="p-2 text-left font-bold uppercase text-[9px] text-slate-500">Actual</th>
                <th className="p-2 text-left font-bold uppercase text-[9px] text-slate-500">Required</th>
                <th className="p-2 text-left font-bold uppercase text-[9px] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.operational.map((m) => (
                <tr key={m.label} className="border-b border-slate-100">
                  <td className="p-2 font-semibold">{m.label}</td>
                  <td className="p-2">{m.value}</td>
                  <td className="p-2">{m.required}</td>
                  <td className="p-2">
                    <StatusDot status={m.status} />
                    <span className="capitalize">{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Fraud Detection">
          <DataTable headers={["Check", "Value"]} rows={data.fraudMetrics.map((f) => [f.label, f.value])} />
          <p className="text-[9px] font-bold uppercase text-slate-500 mt-4 mb-2">Fraud Score Calculation</p>
          <ExecutiveBarChart data={data.fraudCalculation.map((f) => ({ label: f.label, value: Math.abs(f.value) }))} color="#dc2626" />
          <p className="text-center mt-2 text-lg font-black text-rose-700">Fraud Score: {data.fraudScore} / 100</p>
        </SectionCard>

        <SectionCard title="Sentiment Analysis">
          <ExecutiveKpiGrid
            items={[
              { label: "Emotion", value: data.sentiment.emotion, tone: "warn" },
              { label: "Confidence", value: `${data.sentiment.emotionConfidence}%`, tone: "good" },
              { label: "Urgency", value: data.sentiment.urgency, tone: "danger" },
              { label: "Voice Stress", value: `${data.sentiment.voiceStress}%`, tone: "warn" },
              { label: "Trust Score", value: `${data.sentiment.trustScore}%`, tone: "good" },
            ]}
          />
          <p className="text-[9px] font-bold uppercase text-slate-500 mt-3 mb-1">Detected Keywords</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {data.sentiment.keywords.map((k) => (
              <span key={k} className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900">{k}</span>
            ))}
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.sentiment.radar}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9 }} />
                <Radar dataKey="value" stroke="#1e40af" fill="#1e40af" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {xai.ocrAnalysis.hasOcr && (
        <SectionCard title="Document OCR Analysis">
          <p className="text-xs text-slate-500 mb-3">
            Full extracted text is shown in the <code className="text-[10px]">body</code> field below.
          </p>
          <div className="space-y-4">
            {ocrDocs.map((doc) => (
              <OcrEvidencePanel key={doc.id} item={doc} fullText />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Root Cause Analysis">
        <div className="space-y-3">
          {data.rootCauses.map((rc) => (
            <div key={rc.cause} className="rounded-sm border border-slate-200 p-3">
              <div className="flex justify-between gap-2 mb-2">
                <p className="font-bold text-sm text-[#0c1f3d]">{rc.cause}</p>
                <span className="text-xs font-black text-[#1e40af]">{rc.confidence}%</span>
              </div>
              <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Evidence Used</p>
              <ul className="text-xs text-slate-700 mb-2">{rc.evidence.map((e) => <li key={e}>• {e}</li>)}</ul>
              <ProgressRow label="Confidence" value={rc.confidence} tone={rc.confidence >= 50 ? "rose" : "amber"} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Center Risk Calculation">
        <ExecutiveBarChart data={data.centerRiskFactors.map((f) => ({ label: f.label, value: f.value }))} color="#7c3aed" />
        <div className="mt-3 flex flex-wrap gap-1">
          {data.centerRiskFactors.map((f) => (
            <span key={f.label} className="text-[9px] font-bold px-2 py-1 rounded-sm bg-violet-100 text-violet-900">
              {f.label}: {f.value}/100
            </span>
          ))}
        </div>
        <p className="text-center mt-3 text-xl font-black text-violet-800">Total Risk Score: {data.centerRiskTotal}</p>
      </SectionCard>

      {data.predictions.map((pred) => (
        <SectionCard key={pred.label} title={`Prediction Engine · ${pred.label}`}>
          <ExecutiveKpiGrid
            items={[
              { label: "Prediction", value: `${pred.probability}%`, tone: "danger" },
              { label: "ML Confidence", value: `${pred.mlConfidence}%`, tone: "good" },
            ]}
          />
          <p className="text-[9px] font-bold uppercase text-slate-500 mt-3 mb-2">Based On</p>
          <DataTable headers={["Input", "Value"]} rows={pred.basis.map((b) => [b.label, b.value])} />
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pred.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      ))}

    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
