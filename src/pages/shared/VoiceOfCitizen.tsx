import { useApp } from "@/context/AppContext";
import { OutcomeIntelligenceStrip } from "@/components/unified/OutcomeIntelligenceStrip";
import { AlertTriangle, MessageSquare, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MultiRoleProtected } from "@/components/app/MultiRoleProtected";

function VoiceContent() {
  const { voiceOfCitizen, omnichannelInputs } = useApp();
  const v = voiceOfCitizen;

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase flex items-center gap-2"><MessageSquare className="h-7 w-7 text-purple-600" /> Voice of Beneficiary Intelligence</h1>
      <p className="text-sm text-slate-500">All channels — mobile, IVR, WhatsApp, QR, handwritten, photos, surveys</p>
      {v.alertMessage && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          {v.alertMessage}
        </div>
      )}
      <OutcomeIntelligenceStrip />
      <div className="rounded-2xl border bg-gradient-to-r from-purple-50 to-white p-5 text-sm leading-relaxed">
        <h3 className="text-[10px] font-black uppercase text-purple-800 mb-2">AI intelligence summary</h3>
        {v.aiSummary}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{v.totalSignals}</div><div className="text-[10px] uppercase text-slate-400">Total signals</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{v.avgSatisfaction}/5</div><div className="text-[10px] uppercase text-slate-400">Avg satisfaction</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{v.trustIndicator}</div><div className="text-[10px] uppercase text-slate-400">Trust indicator</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-2xl font-black">{v.serviceQualityPerception}%</div><div className="text-[10px] uppercase text-slate-400">Service quality perception</div></div>
        <div className="rounded-xl border bg-white p-4 flex items-center gap-2 sm:col-span-2">
          {v.sentimentTrend === "declining" ? <TrendingDown className="h-6 w-6 text-red-500" /> : <TrendingUp className="h-6 w-6 text-emerald-500" />}
          <div><div className="font-black uppercase text-sm">{v.sentimentTrend}</div><div className="text-[10px] text-slate-400">Sentiment trend · alert when declining</div></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-3">Channels</h3>
          {Object.entries(v.byChannel).map(([ch, n]) => (
            <div key={ch} className="flex justify-between text-sm py-1 border-b"><span>{ch}</span><span className="font-bold">{n}</span></div>
          ))}
          {omnichannelInputs.length > 0 && <p className="text-[10px] text-slate-400 mt-2">{omnichannelInputs.length} omnichannel intakes in ledger</p>}
        </div>
        <div className="rounded-2xl border bg-white p-5 h-56">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Top issues</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={v.topIssues} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 9 }} width={75} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-emerald-50 p-5">
          <h3 className="text-xs font-black uppercase text-emerald-800 mb-2">Positive themes</h3>
          {v.positiveThemes.map((t, i) => <p key={i} className="text-xs py-1">“{t}…”</p>)}
        </div>
        <div className="rounded-2xl border bg-red-50 p-5">
          <h3 className="text-xs font-black uppercase text-red-800 mb-2">Negative themes</h3>
          {v.negativeThemes.map((t, i) => <p key={i} className="text-xs py-1">“{t}…”</p>)}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-3">District comparison (perception)</h3>
        <div className="flex flex-wrap gap-2">
          {v.districtComparison.map((d) => (
            <span key={d.district} className="rounded-lg border px-3 py-2 text-xs font-bold">{d.district}: {d.score}%</span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Recurring complaint patterns: {v.recurringComplaints}</p>
        {v.recurringClusters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {v.recurringClusters.map((c) => (
              <span key={c.label} className="text-[10px] font-bold uppercase bg-red-50 text-red-800 px-2 py-1 rounded">{c.label} · {c.centers} centers</span>
            ))}
          </div>
        )}
      </div>
      {v.infrastructureIssues.length > 0 && (
        <div className="rounded-2xl border bg-amber-50 p-5">
          <h3 className="text-xs font-black uppercase text-amber-900 mb-2">Infrastructure issues</h3>
          <ul className="text-sm space-y-1">{v.infrastructureIssues.map((x, i) => <li key={i}>• {x}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default function VoiceOfCitizen() {
  return (
    <MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}>
      <VoiceContent />
    </MultiRoleProtected>
  );
}
