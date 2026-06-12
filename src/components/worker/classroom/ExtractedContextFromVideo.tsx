import { useMemo, useState } from "react";
import { parseClassroomTranscript, TranscriptUtterance } from "@/lib/classroom/parseTranscript";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

type Tab = "te" | "en";

function Bubble({ u }: { u: TranscriptUtterance }) {
  if (u.speaker === "heading") {
    return (
      <div className="py-3 text-center">
        <h4 className="text-lg sm:text-xl font-bold text-[#0F172A] leading-snug">{u.text}</h4>
      </div>
    );
  }
  if (u.speaker === "footer") {
    return (
      <p className="text-center text-base font-bold text-[#1e3a5f] py-4 border-t border-slate-200 mt-2">
        {u.text}
      </p>
    );
  }

  const isTeacher = u.speaker === "teacher";
  return (
    <div className={cn("flex flex-col gap-1 max-w-[92%]", isTeacher ? "mr-auto items-start" : "ml-auto items-end")}>
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 px-1">{u.label}</span>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-base sm:text-lg leading-relaxed whitespace-pre-line shadow-sm",
          isTeacher ? "bg-[#1e3a5f] text-white rounded-tl-sm" : "bg-emerald-100 text-[#0F172A] border border-emerald-200 rounded-tr-sm"
        )}
      >
        {u.text}
      </div>
    </div>
  );
}

function TranscriptBody({
  utterances,
  expanded,
  className,
}: {
  utterances: TranscriptUtterance[];
  expanded: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 overflow-y-auto pr-1 transcript-scroll",
        expanded ? "max-h-[min(75vh,720px)]" : "max-h-[420px]",
        className
      )}
    >
      {utterances.map((u, idx) => (
        <Bubble key={`${u.speaker}-${idx}-${u.text.slice(0, 24)}`} u={u} />
      ))}
    </div>
  );
}

export function ExtractedContextFromVideo({
  extractedContextTelugu,
  extractedContextEnglish,
  transcriptSaved,
  onSaveTranscript,
}: {
  extractedContextTelugu: string;
  extractedContextEnglish: string;
  transcriptSaved?: boolean;
  onSaveTranscript?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("te");
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const teluguUtterances = useMemo(
    () => parseClassroomTranscript(extractedContextTelugu, "te"),
    [extractedContextTelugu]
  );
  const englishUtterances = useMemo(
    () => parseClassroomTranscript(extractedContextEnglish, "en"),
    [extractedContextEnglish]
  );

  const activeText = tab === "te" ? extractedContextTelugu : extractedContextEnglish;
  const activeUtterances = tab === "te" ? teluguUtterances : englishUtterances;
  const sectionTitle = tab === "te" ? "వీడియో నుండి సేకరించిన కథ" : "Context Extracted From Video";

  const copyText = async (which: Tab) => {
    const text = which === "te" ? extractedContextTelugu : extractedContextEnglish;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(which === "te" ? "Telugu transcript copied" : "English transcript copied");
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob(
      [`=== తెలుగు ===\n\n${extractedContextTelugu}\n\n\n=== English ===\n\n${extractedContextEnglish}`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classroom-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded");
  };

  const panel = (
    <section className="worker-card border-2 border-[#1e3a5f]/40 bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-4 sm:px-5">
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Extracted Context From Video</h3>
        <p className="text-sm text-slate-600 mt-1">
          View the actual classroom conversation extracted from the uploaded session.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setTab("te")}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md border-2 transition-colors",
              tab === "te" ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-slate-700 border-slate-300"
            )}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => setTab("en")}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md border-2 transition-colors",
              tab === "en" ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-slate-700 border-slate-300"
            )}
          >
            English
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={() => copyText("te")} className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1">
            <Copy className="h-3.5 w-3.5" /> Copy Telugu
          </button>
          <button type="button" onClick={() => copyText("en")} className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1">
            <Copy className="h-3.5 w-3.5" /> Copy English
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {expanded ? "Collapse" : "Expand Full Transcript"}
          </button>
          <button type="button" onClick={downloadTranscript} className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Download Transcript
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full Screen
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="gov-btn-outline text-[10px] py-1.5 px-2 flex items-center gap-1"
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 sm:p-6 bg-[#fafbfc]">
          <h4 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 pb-2 border-b border-slate-200">
            {sectionTitle}
          </h4>
          <TranscriptBody utterances={activeUtterances} expanded={expanded} />
          <p className="mt-4 text-xs text-slate-500 italic border-t border-slate-200 pt-3 select-text">
            This transcript was extracted from classroom audio and translated automatically.
          </p>
          {onSaveTranscript && (
            <button
              type="button"
              onClick={onSaveTranscript}
              disabled={transcriptSaved}
              className="mt-4 gov-btn-primary text-sm w-full sm:w-auto"
            >
              {transcriptSaved ? "Transcript saved offline" : "Save transcript & session"}
            </button>
          )}
        </div>
      )}
    </section>
  );

  if (fullscreen) {
    return (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-[#0F172A] text-white">
            <div>
              <p className="font-bold">Extracted Context From Video</p>
              <p className="text-xs text-white/80">{tab === "te" ? "తెలుగు" : "English"} · reading mode</p>
            </div>
            <button type="button" onClick={() => setFullscreen(false)} className="p-2 rounded hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-4 sm:p-8 max-w-4xl mx-auto w-full">
            <h4 className="text-xl font-bold mb-4">{sectionTitle}</h4>
            <TranscriptBody utterances={activeUtterances} expanded className="max-h-none h-[calc(100vh-10rem)]" />
          </div>
          <p className="text-center text-xs text-slate-500 pb-4 px-4">
            This transcript was extracted from classroom audio and translated automatically.
          </p>
        </div>
    );
  }

  return panel;
}
