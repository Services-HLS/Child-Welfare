import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Target, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { OutcomeIntelligenceStrip } from "@/components/unified/OutcomeIntelligenceStrip";
import { cn } from "@/lib/utils";

const SIX_QUESTIONS = [
  { id: "services", q: "Did services happen?", key: "services" as const },
  { id: "engage", q: "Did children engage?", key: "engage" as const },
  { id: "satisfied", q: "Were beneficiaries satisfied?", key: "satisfied" as const },
  { id: "grievance", q: "Were grievances resolved?", key: "grievance" as const },
  { id: "workers", q: "Did workers improve?", key: "workers" as const },
  { id: "govt", q: "Did government intervention create measurable outcomes?", key: "govt" as const },
];

export default function ImpactDashboard() {
  const { impactMetrics, childProgress, complaints, feedback, sessions, platformOutcomes, excellenceIndexes, voiceOfCitizen } = useApp();
  const districtAei = [...new Set(excellenceIndexes.map((a) => a.district))].map((district) => {
    const items = excellenceIndexes.filter((a) => a.district === district);
    return { district, aei: Math.round(items.reduce((s, a) => s + a.score, 0) / items.length), green: items.filter((a) => a.band === "green").length };
  }).sort((a, b) => b.aei - a.aei);
  const m = impactMetrics;
  const closed = complaints.filter((c) => c.status === "closed").length;
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const engaged = childProgress.filter((p) => p.preschoolParticipation >= 0.7).length;
  const satPct = platformOutcomes.beneficiarySatisfactionIndex;
  const closurePct = platformOutcomes.complaintClosureRate;
  const workerPct = platformOutcomes.workerImprovementRate;
  const govtPct = Math.round((platformOutcomes.interventionSuccessRate + platformOutcomes.aeiAvg) / 2);
  const greenCenters = excellenceIndexes.filter((a) => a.band === "green").length;

  const answers: Record<string, { yes: boolean; detail: string }> = {
    services: { yes: completedSessions > 0, detail: `${completedSessions} AI-verified sessions · ${feedback.length + childProgress.length} service signals` },
    engage: { yes: engaged > 0, detail: `${engaged} children with ≥70% participation · CWI avg ${platformOutcomes.cwiAvg}` },
    satisfied: { yes: satPct >= 70, detail: `Beneficiary satisfaction index ${satPct}%` },
    grievance: { yes: closurePct >= 50, detail: `${closed} closed · ${closurePct}% closure rate` },
    workers: { yes: workerPct >= 40, detail: `${m.workersImprovedPostCoaching}+ workers improved post-coaching (${workerPct}% rate)` },
    govt: { yes: govtPct >= 60, detail: `${greenCenters} centers green AEI · intervention success ${platformOutcomes.interventionSuccessRate}%` },
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <header className="border-b-2 border-[#1e3a5f] bg-[#0F172A] text-white px-6 py-6">
        <div className="w-full max-w-none">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 text-teal-300" />
            <div>
              <h1 className="text-2xl font-bold">Public Impact — Statewide Outcomes</h1>
              <p className="text-sm text-white/80">WDCW, Government of Andhra Pradesh · anonymized aggregates</p>
            </div>
          </div>
          <OutcomeIntelligenceStrip />
        </div>
      </header>
      <main className="w-full max-w-none p-6 space-y-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIX_QUESTIONS.map((item) => {
            const a = answers[item.key];
            return (
              <div key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  {a.yes ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <XCircle className="h-5 w-5 text-amber-600 shrink-0" />}
                  <p className="text-sm font-bold text-slate-800">{item.q}</p>
                </div>
                <p className="text-xs text-slate-600">{a.detail}</p>
                <p className={cn("text-[10px] font-black uppercase mt-2", a.yes ? "text-emerald-700" : "text-amber-700")}>{a.yes ? "Yes — evidenced" : "In progress — interventions active"}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Before / After ({m.periodLabel})</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="rounded-xl bg-slate-100 p-4">
              <div className="font-black text-slate-500 mb-2">Before</div>
              <ul className="space-y-1"><li>AEI/SQI: {m.before.sqi}%</li><li>Satisfaction: {m.before.satisfaction}%</li><li>Open complaints: {m.before.openComplaints}</li></ul>
            </div>
            <div className="rounded-xl bg-teal-50 p-4">
              <div className="font-black text-teal-800 mb-2">After</div>
              <ul className="space-y-1"><li>AEI/SQI: {m.after.sqi}%</li><li>Satisfaction: {m.after.satisfaction}%</li><li>Open complaints: {m.after.openComplaints}</li><li>Trust score: {platformOutcomes.trustScore}%</li></ul>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4">District AEI benchmarking</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtAei}>
                <XAxis dataKey="district" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="aei" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-3">Beneficiary trust trend: {voiceOfCitizen.sentimentTrend} · trust {voiceOfCitizen.trustIndicator}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border p-4"><div className="text-xl font-black">{platformOutcomes.workerImprovementRate}%</div><div className="text-[10px] uppercase text-slate-400">Worker growth rate</div></div>
          <div className="rounded-xl border p-4"><div className="text-xl font-black">{platformOutcomes.complaintClosureRate}%</div><div className="text-[10px] uppercase text-slate-400">Complaint closure improvement</div></div>
          <div className="rounded-xl border p-4"><div className="text-xl font-black">{greenCenters}</div><div className="text-[10px] uppercase text-slate-400">Centers at green AEI</div></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/experience/hackathon" className="rounded-xl bg-[#0F172A] text-white px-4 py-2 text-xs font-black uppercase">Hackathon demo</Link>
          <Link to="/public/transparency" className="text-xs font-black uppercase border rounded-lg px-4 py-2">Transparency portal</Link>
          <Link to="/center-journey/AWC-TPT-01" className="text-xs font-black uppercase border rounded-lg px-4 py-2">Sample center journey</Link>
        </div>
      </main>
    </div>
  );
}
