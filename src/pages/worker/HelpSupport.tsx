import { useState } from "react";
import { WorkerFieldLayout } from "@/components/worker/WorkerFieldLayout";
import { useApp } from "@/context/AppContext";
import { Phone, Volume2, HelpCircle, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const FAQ = [
  { q: "How do I check in?", a: "Open Attendance, tap Check In. GPS will be captured. Works offline — syncs when network returns." },
  { q: "Preschool session vs activity?", a: "Session Recording is for classroom video/audio AI coaching. Activities are other services like meals and health visits." },
  { q: "What do support levels mean?", a: "They are coaching guides only — not punishment. Green means strong, orange growing, extra support available." },
];

export default function HelpSupport() {
  const { t } = useApp();
  const [open, setOpen] = useState<number | null>(0);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      window.speechSynthesis.speak(u);
      toast.success("Voice help playing");
    } else toast.info(text);
  };

  return (
    <WorkerFieldLayout title={t("help_support")} subtitle={t("help_support_subtitle")}>
      <button
        type="button"
        onClick={() => speak("Welcome to AnganSakti field help. Tap any question to hear the answer.")}
        className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] text-white py-4 text-sm font-bold uppercase mb-4"
      >
        <Volume2 className="h-5 w-5" /> {t("voice_help")}
      </button>

      <section className="space-y-2 mb-6">
        {FAQ.map((item, i) => (
          <div key={i} className="worker-card border border-slate-200 bg-white">
            <button
              type="button"
              className="w-full text-left p-3 flex items-center gap-2 font-semibold text-sm"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <HelpCircle className="h-4 w-4 text-[#1e40af] shrink-0" />
              {item.q}
            </button>
            {open === i && (
              <div className="px-3 pb-3 text-sm text-slate-700 border-t border-slate-100">
                {item.a}
                <button type="button" className="block mt-2 text-xs font-bold text-[#1e40af]" onClick={() => speak(item.a)}>
                  Listen
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="worker-card border p-4 space-y-3 text-sm">
        <h3 className="text-xs font-bold uppercase">{t("troubleshooting")}</h3>
        <p className="flex items-start gap-2"><WifiOff className="h-4 w-4 shrink-0" /> {t("offline_help")}</p>
        <p className="flex items-start gap-2"><RefreshCw className="h-4 w-4 shrink-0" /> {t("sync_help")}</p>
      </section>

      <a href="tel:181" className="mt-4 flex items-center justify-center gap-2 border-2 border-[#1e3a5f] py-3 font-bold text-[#1e3a5f]">
        <Phone className="h-5 w-5" /> WDCW helpline (demo)
      </a>
    </WorkerFieldLayout>
  );
}
