import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { CheckCircle2, Utensils, BookOpen, Users } from "lucide-react";

/** Citizen-safe summaries from worker sessions & activities — no worker punishment scores */
export function PublicCenterTimeline({ centerId }: { centerId: string }) {
  const { activities, sessions } = useApp();
  const today = new Date().toDateString();
  const todayActs = activities.filter(
    (a) => a.centerId === centerId && new Date(a.timestamp).toDateString() === today
  );
  const todaySession = sessions.find(
    (s) => s.metadata.centerId === centerId && new Date(s.createdAt).toDateString() === today
  );

  const summaries: { icon: typeof BookOpen; label: string; detail: string; time: string }[] = [];

  if (todaySession?.scorecard) {
    summaries.push({
      icon: BookOpen,
      label: "Preschool session completed",
      detail: "Storytelling and group activities conducted — citizen-safe AI summary",
      time: format(new Date(todaySession.createdAt), "HH:mm"),
    });
    if (todaySession.scorecard.band === "green") {
      summaries.push({
        icon: Users,
        label: "Participation high",
        detail: "Children actively engaged during observed session",
        time: format(new Date(todaySession.createdAt), "HH:mm"),
      });
    }
  }

  todayActs.forEach((a) => {
    if (a.type?.toLowerCase().includes("meal") || a.type?.toLowerCase().includes("nutrition")) {
      summaries.push({
        icon: Utensils,
        label: "Meal service logged",
        detail: a.description ?? "Hot cooked meal service recorded at center",
        time: format(new Date(a.timestamp), "HH:mm"),
      });
    }
  });

  if (summaries.length === 0) {
    summaries.push({
      icon: CheckCircle2,
      label: "Center operations active",
      detail: "Service logs will appear as workers submit daily evidence",
      time: "—",
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-bold uppercase text-[#1e3a5f]">Public Center Timeline</h2>
      <p className="text-xs text-slate-600 mt-1 mb-3">
        Activities, meals, preschool sessions, and classroom updates — merged service transparency &amp; accountability.
      </p>
      <ol className="space-y-3">
        {summaries.map((s, i) => (
          <li key={i} className="flex gap-3">
            <s.icon className="h-5 w-5 text-[#1e40af] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">{s.label}</p>
              <p className="text-xs text-slate-600">{s.detail}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
