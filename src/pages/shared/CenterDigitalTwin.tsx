import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { Activity, MessageSquare, ShieldCheck, Users, Baby, BarChart3, Clock } from "lucide-react";

export default function CenterDigitalTwin() {
  const { id } = useParams();
  const { activities, feedback, complaints, sessions, serviceQualityScores, getCenterOutcome, childProgress, surveys } = useApp();
  const center = mockCenters.find((c) => c.id === id);
  if (!center) return <div className="p-10">Center not found</div>;
  const sqi = serviceQualityScores.find((s) => s.centerId === id);
  const outcome = getCenterOutcome(id!);
  const centerActs = activities.filter((a) => a.centerId === id).slice(0, 5);
  const centerFb = feedback.filter((f) => f.centerId === id);
  const avgRating = centerFb.length ? (centerFb.reduce((a, f) => a + f.rating, 0) / centerFb.length).toFixed(1) : "—";
  const openCmp = complaints.filter((c) => c.centerId === id && c.status !== "closed").length;
  const sessionCount = sessions.filter((s) => s.metadata.centerId === id).length;
  const outcomes = childProgress.filter((r) => r.centerId === id).length;
  const surveyCount = surveys.filter((s) => s.centerId === id).length;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase">Center Digital Twin</h1>
          <p className="text-sm text-slate-500">{center.name} — real-time operational command view</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/center-timeline/${id}`} className="flex items-center gap-1 rounded-xl border px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50">
            <Clock className="h-4 w-4" /> Timeline replay
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { icon: BarChart3, label: "SQI", value: sqi ? `${sqi.overallIndex}%` : "—" },
          { icon: Users, label: "Sessions", value: sessionCount },
          { icon: MessageSquare, label: "Avg rating", value: avgRating },
          { icon: ShieldCheck, label: "Open grievances", value: openCmp },
          { icon: Baby, label: "Outcomes", value: outcomes },
          { icon: Activity, label: "Surveys", value: surveyCount },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-4 shadow-sm text-center">
            <k.icon className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <div className="text-lg font-black">{k.value}</div>
            <div className="text-[9px] uppercase text-slate-400">{k.label}</div>
          </div>
        ))}
      </div>
      {outcome && (
        <div className="rounded-2xl border bg-teal-50 p-5">
          <h3 className="text-[10px] font-black uppercase text-teal-800 mb-2">Child outcomes</h3>
          <p className="text-sm">Trend: <strong>{outcome.outcomeTrend}</strong> · Attendance {outcome.attendanceRate}% · Dev score {outcome.developmentScore}</p>
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Recent service delivery</h3>
          {centerActs.map((a) => (
            <div key={a.id} className="text-xs border-b py-2 last:border-0">{a.type} — {a.description.slice(0, 60)}</div>
          ))}
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Feedback sentiment</h3>
          {centerFb.slice(0, 5).map((f) => (
            <div key={f.id} className="text-xs border-b py-2">{f.rating}/5 — {f.sentiment} — {f.text.slice(0, 50)}</div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 uppercase">Historical playback: use Timeline Replay to scrub events over days and weeks</p>
    </div>
  );
}
