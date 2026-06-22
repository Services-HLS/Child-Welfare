import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import {
  buildWhatsAppContext,
  formatGrievanceDetailText,
  getGrievanceDetailReply,
  getWhatsAppReply,
  getWhatsAppWelcome,
  WhatsAppGrievanceSummary,
  WhatsAppReply,
} from "@/services/beneficiary/whatsappBot";
import { ComplaintRecord } from "@/types/platform";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCheck, ExternalLink, Mic, Paperclip, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  at: string;
  text?: string;
  grievances?: WhatsAppGrievanceSummary[];
  grievanceDetail?: ComplaintRecord;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function formatWhatsAppText(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function replyToMessage(reply: WhatsAppReply, id: string, at: string): ChatMessage {
  if (reply.type === "grievance_list") {
    return { id, role: "bot", at, text: reply.text, grievances: reply.grievances };
  }
  if (reply.type === "grievance_detail") {
    return { id, role: "bot", at, text: reply.text, grievanceDetail: reply.grievance };
  }
  return { id, role: "bot", at, text: reply.text };
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("closed") || s.includes("confirmation") || s.includes("resolved")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (s.includes("rejected")) return "bg-rose-100 text-rose-800 border-rose-200";
  if (s.includes("escalation") || s.includes("review") || s.includes("processing")) {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }
  return "bg-blue-100 text-blue-800 border-blue-200";
}

const CHAT_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cdc4' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export default function WhatsAppSimulation() {
  const { user, complaints, childProgress, lang } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);

  const ctx = useMemo(
    () => buildWhatsAppContext(user, complaints, lang, childProgress),
    [user, complaints, lang, childProgress]
  );

  const copy = ctx.copy;
  const grievanceCount = ctx.grievances?.length ?? 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: "welcome",
            role: "bot",
            text: getWhatsAppWelcome(ctx),
            at: new Date().toISOString(),
          },
        ];
      }
      if (prev.length === 1 && prev[0]?.id === "welcome") {
        const nextText = getWhatsAppWelcome(ctx);
        if (prev[0].text === nextText) return prev;
        return [{ ...prev[0], text: nextText }];
      }
      return prev;
    });
  }, [ctx]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const pushBotReply = useCallback(
    (userText: string) => {
      const reply = getWhatsAppReply(userText, ctx);
      setTyping(true);
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          replyToMessage(reply, `bot-${Date.now()}`, new Date().toISOString()),
        ]);
        setTyping(false);
      }, 400 + Math.min(userText.length * 12, 600));
    },
    [ctx]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", text: trimmed, at: new Date().toISOString() },
      ]);
      setDraft("");
      pushBotReply(trimmed);
    },
    [typing, pushBotReply]
  );

  const showGrievanceDetail = (id: string) => {
    if (typing) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: `Details ${id}`, at: new Date().toISOString() },
    ]);
    const reply = getGrievanceDetailReply(id, ctx);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        replyToMessage(reply, `bot-${Date.now()}`, new Date().toISOString()),
      ]);
      setTyping(false);
    }, 450);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.25rem-4rem)] lg:h-[calc(100vh-3.25rem)] max-h-[calc(100dvh-3.25rem-4rem)] lg:max-h-[calc(100vh-3.25rem)]">
      <div className="flex flex-col flex-1 min-h-0 bg-[#efeae2] shadow-inner">
        <div className="bg-[#075E54] text-white px-3 sm:px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-md z-10">
          <Link
            to="/beneficiary/my-grievances"
            className="lg:hidden p-1 -ml-1 text-white/90 hover:text-white"
            aria-label={copy.ui.back}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-[#128C7E] flex items-center justify-center shrink-0 border border-white/20">
            <WhatsAppIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] truncate leading-tight">{copy.ui.headerTitle}</p>
            <p className="text-[11px] text-emerald-100 truncate">
              {typing ? copy.ui.typing : copy.ui.online(grievanceCount)}
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-3 space-y-2"
          style={{ backgroundImage: CHAT_BG, backgroundColor: "#efeae2" }}
        >
          <p className="text-center text-[10px] bg-[#FFF9C4]/95 text-slate-700 rounded-lg px-3 py-1.5 mx-auto max-w-md shadow-sm sticky top-0 z-[1]">
            {copy.ui.demoBanner}
          </p>

          {messages.map((m) => (
            <div key={m.id} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "rounded-lg shadow-sm overflow-hidden",
                  m.role === "user"
                    ? "bg-[#DCF8C6] rounded-tr-none max-w-[85%] sm:max-w-[75%]"
                    : "bg-white rounded-tl-none w-full max-w-full sm:max-w-[92%]",
                  m.grievances?.length ? "sm:max-w-[95%]" : ""
                )}
              >
                {m.text && !m.grievances?.length && !m.grievanceDetail && (
                  <div className="text-[13.5px] leading-relaxed text-slate-900 whitespace-pre-wrap px-3 py-2">
                    {formatWhatsAppText(m.text)}
                  </div>
                )}

                {m.text && (m.grievances?.length || m.grievanceDetail) && (
                  <div className="text-[13.5px] leading-relaxed text-slate-900 whitespace-pre-wrap px-3 pt-3 pb-1">
                    {formatWhatsAppText(m.text)}
                  </div>
                )}

                {m.grievances && m.grievances.length > 0 && (
                  <div className="px-2 pb-2 grid gap-2 sm:grid-cols-2">
                    {m.grievances.map((g) => (
                      <div
                        key={g.id}
                        className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3 text-left"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <p className="font-mono text-xs font-bold text-[#075E54]">{g.id}</p>
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border capitalize",
                              statusTone(g.status)
                            )}
                          >
                            {g.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{g.title}</p>
                        <p className="text-[11px] text-slate-600 mt-1 capitalize">
                          {g.category} · {g.centerName}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {format(new Date(g.createdAt), "dd MMM yyyy")} · {g.priority}
                          {g.anonymous && ` · ${copy.ui.anonymousTag}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => showGrievanceDetail(g.id)}
                          disabled={typing}
                          className="mt-2 w-full rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold py-2 px-3 transition-colors disabled:opacity-50"
                        >
                          {copy.ui.viewDetails}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {m.grievanceDetail && (
                  <div className="px-3 pb-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-900 whitespace-pre-wrap mb-3">
                      {formatWhatsAppText(formatGrievanceDetailText(m.grievanceDetail, copy))}
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1">
                      <Link
                        to={`/beneficiary/my-grievances/${m.grievanceDetail.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-[#075E54] text-white text-[11px] font-bold py-2 px-3 hover:bg-[#064a42]"
                      >
                        {copy.ui.openFullPage} <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Link
                        to="/beneficiary/track-grievance"
                        className="inline-flex items-center gap-1 rounded-md border border-[#075E54] text-[#075E54] text-[11px] font-bold py-2 px-3 hover:bg-emerald-50"
                      >
                        {copy.ui.trackTimeline}
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-0.5 px-3 pb-1.5 pt-0.5">
                  <span className="text-[9px] text-slate-500">{format(new Date(m.at), "p")}</span>
                  {m.role === "user" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        <div className="px-2 py-2 flex gap-1.5 overflow-x-auto bg-[#f0f0f0] border-t border-slate-200/80 shrink-0 scrollbar-none">
          {copy.quickReplies.map((qr) => (
            <button
              key={qr.id}
              type="button"
              onClick={() => sendMessage(qr.label)}
              disabled={typing}
              className="shrink-0 rounded-full border border-[#25D366]/80 text-[#075E54] bg-white px-3 py-1.5 text-[11px] font-semibold hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
            >
              {qr.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(draft);
          }}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-2 bg-[#f0f0f0] shrink-0 border-t border-slate-200/60"
        >
          <button type="button" className="p-2 text-slate-500 shrink-0" aria-label="Attach">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={copy.ui.typeMessage}
            className="flex-1 min-w-0 rounded-full border-0 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
            disabled={typing}
          />
          {draft.trim() ? (
            <button
              type="submit"
              disabled={typing}
              className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 hover:bg-[#20bd5a]"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="p-2 text-slate-500 shrink-0" aria-label="Voice">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
