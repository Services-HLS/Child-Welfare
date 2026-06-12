import { useApp } from "@/context/AppContext";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function SupervisorDevelopment() {
  const { sessions, serviceQualityScores, feedback } = useApp();
  const trend = [
    { w: "W1", opi: 72 },
    { w: "W2", opi: 78 },
    { w: "W3", opi: 81 },
    { w: "W4", opi: 85 },
  ];
  const tirupatiScores = serviceQualityScores.filter((s) => s.district === "Tirupati").slice(0, 8);
  const negFeedback = feedback.filter((f) => f.sentiment === "negative" || f.sentiment === "critical").length;

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-black uppercase">Workforce Development</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 h-64">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Classroom quality trend (OPI)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trend}>
              <XAxis dataKey="w" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="opi" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Session heatmap summary</h3>
          <div className="grid grid-cols-4 gap-1">
            {sessions.slice(0, 16).map((s, i) => (
              <div
                key={s.id + i}
                className={`aspect-square rounded text-[8px] flex items-center justify-center font-black text-white ${
                  s.scorecard?.band === "green" ? "bg-emerald-500" : s.scorecard?.band === "orange" ? "bg-amber-500" : s.scorecard ? "bg-rose-500" : "bg-slate-200"
                }`}
                title={s.metadata.workerName}
              >
                {(s.scorecard?.overallPerformanceIndex ?? 0) > 0 ? Math.round((s.scorecard?.overallPerformanceIndex ?? 0) * 100) : "—"}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="text-xs font-black uppercase mb-4">Center performance ranking (SQI)</h3>
        <div className="space-y-2">
          {tirupatiScores.map((s) => (
            <div key={s.centerId} className="flex justify-between text-sm border-b py-2">
              <span className="font-bold">{s.centerName}</span>
              <span className="font-black text-blue-600">{s.overallIndex}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">At-risk feedback signals: {negFeedback}</p>
      </div>
    </div>
  );
}
