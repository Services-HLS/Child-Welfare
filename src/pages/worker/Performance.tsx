import { useApp } from "@/context/AppContext";
import { useTraining } from "@/context/worker/hooks";
import { Link } from "react-router-dom";
import { Lightbulb, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function WorkerPerformance() {
  const { t, user } = useApp();
  const { sessions, getClassroomAnalytics, recommendations } = useTraining();
  const mine = sessions.filter((s) => s.metadata.workerId === user?.id && s.scorecard);
  const latest = mine[0];
  const intel = latest ? getClassroomAnalytics(latest.id) : null;
  const wv = intel?.workerView;

  const tips = [
    ...(wv?.improvementAreas ?? []).map((g) => `Try improving: ${g}`),
    ...(wv?.strengths ?? []).map((s) => `Keep doing: ${s}`),
  ];
  if (tips.length === 0 && latest?.scorecard) {
    tips.push(latest.scorecard.supportiveRecommendations[0] ?? "Record more sessions for personalized tips.");
  }

  const suggested = latest?.scorecard?.supportiveRecommendations ?? ["Rhymes with actions", "Group counting play"];

  return (
    <div className="space-y-6 pb-24 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">{t("teaching_guidance_center")}</h1>
        <p className="text-sm text-slate-600">From your actual session AI summaries — not fixed templates</p>
      </div>

      <div className="worker-card p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Weekly summary</p>
        <p className="text-sm text-slate-800">
          {mine.length >= 1
            ? `You have ${mine.length} analyzed session(s). Latest on ${format(new Date(mine[0].createdAt), "MMM d")}. ${wv?.supportiveBandMessage ?? ""}`
            : "Record a preschool session to unlock teaching guidance."}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase text-slate-500">Suggested activities</h2>
        {suggested.map((a) => (
          <div key={a} className="worker-card p-3 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#1e3a5f]" />
            <span className="text-sm font-medium">{a}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase text-slate-500">Coaching techniques</h2>
        {tips.map((tip, i) => (
          <div key={i} className="worker-card p-3 flex gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-slate-700">{tip}</p>
          </div>
        ))}
      </div>

      {recommendations[0] && (
        <p className="text-xs bg-blue-50 border border-blue-100 p-3 rounded-lg">{recommendations[0].reason}</p>
      )}

      {latest && (
        <Link to={`/worker/session-feedback/${latest.id}`} className="gov-btn-primary w-full text-center text-sm block">
          View latest session support summary
        </Link>
      )}
    </div>
  );
}
