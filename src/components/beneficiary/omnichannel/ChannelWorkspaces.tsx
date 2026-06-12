import { useRef, useState } from "react";
import { OmnichannelChannelPayload } from "@/types/omnichannel-draft";
import { Lang } from "@/types/platform";
import { speechToText } from "@/services/ai/speech";
import { cn } from "@/lib/utils";
import { Mic, Upload, QrCode, Send, Image as ImageIcon, Loader2, Phone } from "lucide-react";
import { PARENT_CATEGORIES } from "./OmnichannelShared";
import { classifyGrievance } from "@/services/ai/grievance-engine";

type Patch = Partial<OmnichannelChannelPayload>;

const SMS_TEMPLATES = [
  "Meal quality was poor today at AWC",
  "Child not marked present — please verify",
  "Thank you for today's storytelling session",
];

const IVR_STEPS = ["Call Started", "Listening", "Processing", "Transcript Ready"] as const;

export function IvrWorkspace({
  payload,
  onChange,
  lang,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
  lang: Lang;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const state = payload.metadata.ivrState ?? "idle";
  const stepIdx =
    state === "started" ? 0 : state === "listening" ? 1 : state === "processing" ? 2 : state === "ready" ? 3 : -1;

  const runSimulatedCall = async () => {
    onChange({ metadata: { ...payload.metadata, ivrState: "started" } });
    await delay(600);
    onChange({ metadata: { ...payload.metadata, ivrState: "listening" } });
    setRecording(true);
    await delay(1200);
    setRecording(false);
    onChange({ metadata: { ...payload.metadata, ivrState: "processing" } });
    const transcript = await speechToText(undefined, lang);
    const detected: Lang = /[\u0C00-\u0C7F]/.test(transcript) ? "te" : /[\u0900-\u097F]/.test(transcript) ? "hi" : "en";
    onChange({
      transcript,
      text: transcript,
      metadata: { ...payload.metadata, ivrState: "ready", detectedLanguage: detected },
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-[#0F172A]">IVR voice feedback</p>
      <div className="flex gap-2">
        {(["en", "te", "hi"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange({ metadata: { ...payload.metadata, detectedLanguage: l } })}
            className={cn(
              "text-xs font-bold uppercase px-2 py-1 rounded border",
              (payload.metadata.detectedLanguage ?? lang) === l ? "bg-[#1e3a5f] text-white" : "bg-slate-50"
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {IVR_STEPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "text-[10px] font-bold uppercase px-2 py-1 rounded",
              stepIdx >= i ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="rounded-xl bg-slate-900 text-white p-4 text-center">
        <Phone className="h-8 w-8 mx-auto mb-2 opacity-80" />
        <p className="text-xs">Simulated toll-free IVR · 1800-425-ANGAN</p>
        <button
          type="button"
          onClick={runSimulatedCall}
          disabled={recording || state === "processing"}
          className="mt-3 gov-btn-primary text-xs inline-flex items-center gap-2"
        >
          {recording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {recording ? "Listening…" : "Start voice call"}
        </button>
        <label className="mt-2 block text-[10px] underline cursor-pointer">
          Upload voice file
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              onChange({ metadata: { ...payload.metadata, ivrState: "processing" } });
              const t = await speechToText(f, payload.metadata.detectedLanguage ?? lang);
              onChange({ transcript: t, text: t, metadata: { ...payload.metadata, ivrState: "ready" } });
            }}
          />
        </label>
      </div>
      {(payload.transcript || payload.text) && (
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Transcript (editable)</p>
          <textarea
            className="w-full mt-1 min-h-[100px] border rounded-lg p-3 text-sm"
            value={payload.transcript ?? payload.text}
            onChange={(e) => onChange({ transcript: e.target.value, text: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

const WA_EMOJI = ["🙏", "👍", "😊", "❤️", "⚠️", "📷"];

export function WhatsAppWorkspace({
  payload,
  onChange,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
}) {
  const [draft, setDraft] = useState("");
  const messages = payload.metadata.whatsappMessages ?? [];

  const sendBubble = () => {
    if (!draft.trim()) return;
    const next = [
      ...messages,
      { role: "parent" as const, text: draft.trim(), at: new Date().toISOString() },
    ];
    onChange({
      metadata: { ...payload.metadata, whatsappMessages: next },
      text: next.map((m) => m.text).join("\n"),
    });
    setDraft("");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-200 bg-[#e7f9ef] p-4">
      <p className="text-sm font-bold text-emerald-900">WhatsApp · Anganwadi desk</p>
      <div className="h-56 overflow-y-auto bg-[#efeae2] rounded-lg p-3 space-y-2 border">
        {messages.length === 0 && (
          <p className="text-xs text-center text-slate-500 py-8">Start your conversation below</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.role === "parent" ? "bg-white ml-auto" : "bg-white"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <label className="gov-btn-outline text-xs cursor-pointer flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange({ attachments: [...payload.attachments, URL.createObjectURL(f)] });
            }}
          />
        </label>
        <label className="gov-btn-outline text-xs cursor-pointer">Voice note (demo)</label>
      </div>
      <div className="flex gap-1 flex-wrap">
        {WA_EMOJI.map((e) => (
          <button key={e} type="button" className="text-lg" onClick={() => setDraft((d) => d + e)}>
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-full border px-4 py-2 text-sm"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendBubble()}
        />
        <button type="button" onClick={sendBubble} className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function QrWorkspace({
  payload,
  onChange,
  centerId,
  centerName,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
  centerId: string;
  centerName: string;
}) {
  const scan = () => {
    onChange({
      qrCenter: { centerId, centerName, verified: true },
      text: payload.text || `Feedback for ${centerName} via QR`,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold">QR scan · Center verification</p>
      <div className="border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center gap-2">
        <QrCode className="h-12 w-12 text-slate-400" />
        <button type="button" onClick={scan} className="gov-btn-primary text-xs">
          Simulate QR scan
        </button>
      </div>
      {payload.qrCenter?.verified && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
          <p className="font-bold text-emerald-800">Center verified</p>
          <p>{payload.qrCenter.centerName}</p>
          <p className="text-xs text-slate-600">ID {payload.qrCenter.centerId}</p>
        </div>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Issue category</p>
        <select
          className="w-full border rounded-lg p-2 text-sm"
          value={payload.category}
          onChange={(e) => onChange({ category: e.target.value as OmnichannelChannelPayload["category"] })}
        >
          {PARENT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full min-h-[80px] border rounded-lg p-3 text-sm"
        placeholder="Describe issue at this center…"
        value={payload.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    </div>
  );
}

export function SmsWorkspace({
  payload,
  onChange,
  phone,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
  phone?: string;
}) {
  const len = payload.text.length;
  const over = len > 160;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 max-w-md mx-auto">
      <p className="text-xs text-slate-500">From: {phone ?? "9876501234"} → AWC-SMS</p>
      <textarea
        className="w-full min-h-[100px] border rounded-lg p-3 text-sm font-mono"
        maxLength={160}
        value={payload.text}
        onChange={(e) => onChange({ text: e.target.value, metadata: { ...payload.metadata, smsCharCount: e.target.value.length } })}
        placeholder="Type SMS (160 chars)…"
      />
      <p className={cn("text-xs font-bold text-right", over ? "text-red-600" : "text-slate-500")}>
        {len}/160
      </p>
      <div className="flex flex-wrap gap-1">
        {SMS_TEMPLATES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ text: t.slice(0, 160) })}
            className="text-[10px] bg-slate-100 px-2 py-1 rounded"
          >
            {t.slice(0, 24)}…
          </button>
        ))}
      </div>
      <div className="bg-slate-50 rounded p-2 text-xs">Preview: {payload.text || "(empty)"}</div>
    </div>
  );
}

export function OcrWorkspace({
  payload,
  onChange,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const image = payload.attachments[0];

  const runOcr = async (file: File) => {
    setProcessing(true);
    const url = URL.createObjectURL(file);
    onChange({ attachments: [url] });
    await delay(900);
    const extracted = `[OCR] Handwritten note: ${file.name.replace(/\.[^.]+$/, "")} — concern about center hygiene and meal timing. Parent requests supervisor visit.`;
    onChange({ transcript: extracted, text: extracted });
    setProcessing(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold">Handwritten note · OCR</p>
      <label className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50">
        <Upload className="h-8 w-8 mx-auto text-slate-400" />
        <p className="text-xs mt-2 font-bold">Upload or drag handwritten note</p>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && runOcr(e.target.files[0])} />
      </label>
      {processing && (
        <p className="text-xs flex items-center gap-2 text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Extracting text…
        </p>
      )}
      {image && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase mb-1">Original image</p>
            <img src={image} alt="" className="rounded-lg border w-full max-h-48 object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase mb-1">Extracted text</p>
            <textarea
              className="w-full min-h-[120px] border rounded-lg p-2 text-sm"
              value={payload.transcript ?? payload.text}
              onChange={(e) => onChange({ transcript: e.target.value, text: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function PhotoWorkspace({
  payload,
  onChange,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (p: Patch) => void;
}) {
  const classification =
    payload.attachments.length > 0 && payload.text
      ? classifyGrievance(payload.text, payload.rating, "photo_issue")
      : null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold">Photo evidence</p>
      <label className="gov-btn-outline text-xs inline-flex gap-2 cursor-pointer">
        <ImageIcon className="h-4 w-4" /> Add photos
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            const urls = files.map((f) => URL.createObjectURL(f));
            onChange({
              attachments: [...payload.attachments, ...urls],
              text: payload.text || "Photo evidence: service quality concern at Anganwadi center",
            });
          }}
        />
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {payload.attachments.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} alt="" className="rounded-lg h-24 w-full object-cover border" />
            <input
              type="text"
              placeholder="Caption"
              className="mt-1 w-full text-[10px] border rounded px-1"
              value={payload.metadata.photoDescriptions?.[i] ?? ""}
              onChange={(e) => {
                const descs = [...(payload.metadata.photoDescriptions ?? [])];
                descs[i] = e.target.value;
                onChange({ metadata: { ...payload.metadata, photoDescriptions: descs } });
              }}
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Evidence category</p>
        <select
          className="w-full border rounded-lg p-2 text-sm"
          value={payload.category}
          onChange={(e) => onChange({ category: e.target.value as OmnichannelChannelPayload["category"] })}
        >
          {PARENT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500">Evidence notes</p>
        <textarea
          className="w-full min-h-[80px] border rounded-lg p-3 text-sm mt-1"
          placeholder="What does the photo show? (food, hygiene, building…)"
          value={payload.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>
      {classification && (
        <p className="text-xs rounded-lg bg-blue-50 border border-blue-100 p-2">
          AI classification: <strong>{classification.category.replace(/_/g, " ")}</strong> · urgency{" "}
          {(classification.urgencyScore * 100).toFixed(0)}%
        </p>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
