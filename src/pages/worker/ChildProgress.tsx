import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ChildProgressRecord } from "@/types/intelligence";
import { Baby, Plus } from "lucide-react";
import { toast } from "sonner";

const OBS_TEMPLATES = ["Active participant", "Needs encouragement", "Nutrition concern", "Absent 3+ days"];

export default function ChildProgress() {
  const { user, childProgress, addChildProgress, t } = useApp();
  const centerId = user?.centerId ?? "AWC-TPT-01";
  const records = childProgress.filter((r) => r.centerId === centerId);
  const [form, setForm] = useState({
    childName: "",
    attended: true,
    nutrition: true,
    participation: 80,
    milestone: "",
    learning: "",
    note: "",
    growth: "on_track" as "on_track" | "monitor" | "concern",
    attendanceConsistency: 90,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childName.trim()) return toast.error("Child name required");
    const r: ChildProgressRecord = {
      id: `CP-${Date.now()}`,
      childId: `CH-${Date.now().toString().slice(-4)}`,
      childName: form.childName,
      centerId,
      workerId: user?.workerId ?? "W-1042",
      date: new Date().toISOString().slice(0, 10),
      attended: form.attended,
      nutritionCompleted: form.nutrition,
      preschoolParticipation: form.participation / 100,
      growthMilestone: form.milestone || undefined,
      learningObservation: form.learning || undefined,
      developmentalNote: form.note || undefined,
      growthIndicator: form.growth,
      attendanceConsistency: form.attendanceConsistency / 100,
    };
    addChildProgress(r);
    toast.success("Outcome logged — updates Child Wellness Index");
    setForm({ childName: "", attended: true, nutrition: true, participation: 80, milestone: "", learning: "", note: "", growth: "on_track", attendanceConsistency: 90 });
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2"><Baby className="h-6 w-6 text-teal-600" /> {t("child_outcomes_observations")}</h1>
        <p className="text-sm text-slate-600 mt-1">Attendance · nutrition · preschool · wellness indicators</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border bg-white p-5 space-y-4 shadow-sm">
        <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Plus className="h-3 w-3" /> Quick outcome entry</div>
        <input placeholder="Child name" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
        <div className="flex flex-wrap gap-2">
          {OBS_TEMPLATES.map((tpl) => (
            <button key={tpl} type="button" onClick={() => setForm((f) => ({ ...f, note: tpl }))} className="text-[10px] px-2 py-1 rounded-lg border bg-slate-50">
              {tpl}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.attended} onChange={(e) => setForm({ ...form, attended: e.target.checked })} /> Attended</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.nutrition} onChange={(e) => setForm({ ...form, nutrition: e.target.checked })} /> Nutrition completed</label>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Preschool participation %</label>
          <input type="range" min={0} max={100} value={form.participation} onChange={(e) => setForm({ ...form, participation: +e.target.value })} className="w-full" />
          <span className="text-xs font-bold">{form.participation}%</span>
        </div>
        <input placeholder="Growth milestone" value={form.milestone} onChange={(e) => setForm({ ...form, milestone: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
        <input placeholder="Learning observation" value={form.learning} onChange={(e) => setForm({ ...form, learning: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
        <textarea placeholder="Developmental notes" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm min-h-[60px]" />
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Growth indicator</label>
          <select value={form.growth} onChange={(e) => setForm({ ...form, growth: e.target.value as typeof form.growth })} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm">
            <option value="on_track">On track</option>
            <option value="monitor">Monitor</option>
            <option value="concern">Concern</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Attendance consistency %</label>
          <input type="range" min={0} max={100} value={form.attendanceConsistency} onChange={(e) => setForm({ ...form, attendanceConsistency: +e.target.value })} className="w-full" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-teal-600 text-white py-3 text-[10px] font-black uppercase">Save outcome</button>
      </form>
      {records.filter((r) => !r.attended || r.growthIndicator === "concern").length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>Wellness alerts:</strong> review children with absence or declining participation.
        </div>
      )}
      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <span className="font-bold text-sm">{r.childName}</span>
              <span className="text-[10px] text-slate-400">{r.date}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
              <span className={r.attended ? "text-emerald-600" : "text-red-600"}>{r.attended ? "Present" : "Absent"}</span>
              {r.nutritionCompleted && <span className="text-blue-600">Nutrition ✓</span>}
              <span className="text-slate-500">Participation {(r.preschoolParticipation * 100).toFixed(0)}%</span>
            </div>
            {r.learningObservation && <p className="text-xs text-slate-600 mt-2">{r.learningObservation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
