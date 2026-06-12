import { Link } from "react-router-dom";
import { ParentPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { Mic, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { speechToText } from "@/services/ai/speech";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const FAQ = [
  {
    q: "How do I report a problem with meals or the center?",
    a: "Use Share Experience for suggestions and appreciation (no grievance). Use Report Issue when something needs supervisor action — track outcomes under My Requests.",
  },
  {
    q: "How do I know my child attended today?",
    a: "Open My Child or Today's Learning Journey. Attendance appears when the Anganwadi logs the day's services.",
  },
  {
    q: "What happens after I submit a grievance?",
    a: "Your issue is assigned to the center team, action is taken, and you confirm closure. A short satisfaction survey may follow.",
  },
  {
    q: "Can I use Telugu or voice?",
    a: "Yes. Change language in Profile. Voice feedback is available on the Feedback page.",
  },
];

export default function HelpSupport() {
  const { lang } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const tryVoice = async () => {
    setVoiceLoading(true);
    const text = await speechToText(undefined, lang);
    setVoiceLoading(false);
    toast.info("Voice help (demo)", { description: text.slice(0, 120) });
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      <ParentPageHeader
        badge="Help & support"
        title="Help & Support"
        subtitle="FAQ, contacts, and grievance guidance — WDCW Andhra Pradesh"
      />

      <div className="worker-card p-4 space-y-3">
        <p className="text-sm font-bold">Contact</p>
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <Phone className="h-4 w-4" /> Anganwadi helpline (demo): 1800-425-0000
        </p>
        <p className="text-sm text-slate-600">District: Tirupati · Department: Women Development & Child Welfare</p>
        <button type="button" onClick={tryVoice} disabled={voiceLoading} className="gov-btn-outline text-xs flex items-center gap-2">
          <Mic className="h-4 w-4" /> Voice help (listen)
        </button>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">Frequently asked questions</h2>
        {FAQ.map((item, i) => (
          <div key={item.q} className="worker-card mb-2 overflow-hidden">
            <button
              type="button"
              className="w-full flex justify-between items-center p-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-bold text-sm pr-2">{item.q}</span>
              {open === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open === i && <p className="px-4 pb-4 text-sm text-slate-600">{item.a}</p>}
          </div>
        ))}
      </div>

      <Link to="/beneficiary/complaints" className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
        <MessageSquare className="h-6 w-6 text-red-700" />
        <div>
          <p className="font-bold text-sm text-red-900">Grievance guidance</p>
          <p className="text-xs text-red-800">When and how to raise an issue →</p>
        </div>
      </Link>
    </div>
  );
}
