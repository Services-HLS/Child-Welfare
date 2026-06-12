import { useApp } from "@/context/AppContext";
import { SurveyResponses } from "@/types/intelligence";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ParentPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { format } from "date-fns";

const dims: { key: keyof SurveyResponses; label: string }[] = [
  { key: "learningQuality", label: "Learning quality" },
  { key: "foodQuality", label: "Food quality" },
  { key: "overallSatisfaction", label: "Child happiness (overall)" },
  { key: "communication", label: "Communication" },
  { key: "teacherSupport", label: "Teacher support" },
  { key: "cleanliness", label: "Center cleanliness" },
];

function Rating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={cn("h-5 w-5", n <= value ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
        </button>
      ))}
    </div>
  );
}

export default function BeneficiarySurveys() {
  const { user, surveys, submitSurvey } = useApp();
  const bid = user?.id ?? "B-1001";
  const pending = surveys.filter((s) => s.beneficiaryId === bid && !s.completedAt);
  const completed = surveys.filter((s) => s.beneficiaryId === bid && s.completedAt);
  const [active, setActive] = useState<string | null>(pending[0]?.id ?? null);
  const [scores, setScores] = useState<SurveyResponses>({
    foodQuality: 4,
    cleanliness: 4,
    teacherSupport: 4,
    learningQuality: 4,
    communication: 4,
    overallSatisfaction: 4,
  });

  const submit = () => {
    if (!active) return;
    submitSurvey(active, scores);
    toast.success("Thank you", { description: "Your ratings help improve center services for all children." });
    setActive(null);
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <ParentPageHeader
        badge="Parent experience survey"
        title="Parent experience surveys"
        subtitle="Scheduled after visits, complaint closure, and service events"
      />

      {active && (
        <div className="rounded-2xl border-2 border-[#1e3a5f] bg-white p-5 space-y-4 shadow-sm">
          <p className="text-sm font-bold text-[#0F172A]">Please rate your recent experience</p>
          {dims.map((d) => (
            <div key={d.key}>
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">{d.label}</div>
              <Rating value={scores[d.key]} onChange={(v) => setScores({ ...scores, [d.key]: v })} />
            </div>
          ))}
          <button type="button" onClick={submit} className="w-full rounded-xl bg-[#0F172A] text-white py-3 text-xs font-bold uppercase">
            Submit survey
          </button>
        </div>
      )}

      {pending.length === 0 && !active && (
        <p className="text-sm text-slate-500 worker-card p-4">
          No pending surveys. You will receive one after your next center visit or when a grievance is closed.
        </p>
      )}

      <section>
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Previous surveys</h3>
        {completed.map((s) => (
          <div key={s.id} className="text-sm border rounded-xl p-4 mb-2 bg-slate-50">
            <p className="font-bold">{s.trigger.replace(/_/g, " ")}</p>
            <p className="text-xs text-slate-500">{format(new Date(s.completedAt!), "PP")}</p>
            <p className="text-xs mt-2 text-emerald-800">
              Overall {s.responses?.overallSatisfaction}/5 · Learning {s.responses?.learningQuality}/5 · Meals{" "}
              {s.responses?.foodQuality}/5
            </p>
          </div>
        ))}
        {completed.length === 0 && <p className="text-sm text-slate-500">No completed surveys yet.</p>}
      </section>

      <p className="text-xs text-slate-500">Your responses contribute to center service quality reporting — aggregated for government transparency.</p>
    </div>
  );
}
