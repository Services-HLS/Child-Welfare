import { OmnichannelChannelPayload, ParentOmnichannelCategory, OmnichannelPriority } from "@/types/omnichannel-draft";
import { FeedbackChannel } from "@/types/feedback-channels";
import { cn } from "@/lib/utils";

export const CHANNELS: {
  id: FeedbackChannel;
  label: string;
  hint: string;
}[] = [
  { id: "ivr", label: "IVR Call", hint: "Voice → transcript" },
  { id: "whatsapp", label: "WhatsApp", hint: "Chat & media" },
  { id: "qr_code", label: "QR Scan", hint: "Center verified" },
  { id: "sms", label: "SMS", hint: "Short message" },
  { id: "handwritten_ocr", label: "Handwritten", hint: "OCR extract" },
  { id: "photo_issue", label: "Photo evidence", hint: "Upload proof" },
];

export const PARENT_CATEGORIES: { id: ParentOmnichannelCategory; label: string }[] = [
  { id: "meals", label: "Meals" },
  { id: "teaching", label: "Teaching" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "safety", label: "Safety" },
  { id: "hygiene", label: "Hygiene" },
  { id: "suggestions", label: "Suggestions" },
];

export const PRIORITIES: { id: OmnichannelPriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
];

export const SUBMIT_LABELS: Record<FeedbackChannel, string> = {
  ivr: "Submit IVR Feedback",
  whatsapp: "Send via WhatsApp",
  qr_code: "Submit Center Feedback",
  sms: "Send SMS Feedback",
  handwritten_ocr: "Submit OCR Feedback",
  photo_issue: "Submit Evidence",
  mobile_app: "Submit Feedback",
};

export const COMPLETION_MESSAGES: Record<FeedbackChannel, { title: string; body: string }> = {
  ivr: { title: "Voice feedback received", body: "Your call transcript is registered. Track under Grievances if escalated." },
  whatsapp: { title: "Message delivered", body: "Your WhatsApp message reached the unified intake desk." },
  qr_code: { title: "Center feedback registered", body: "QR-verified feedback is linked to your Anganwadi center." },
  sms: { title: "Feedback sent", body: "SMS recorded on the government grievance channel." },
  handwritten_ocr: { title: "Handwritten feedback processed", body: "OCR text saved and routed for review." },
  photo_issue: { title: "Evidence uploaded", body: "Photos classified and attached to your feedback record." },
  mobile_app: { title: "Feedback received", body: "Thank you for your submission." },
};

export function FeedbackDetailsSection({
  payload,
  onChange,
}: {
  payload: OmnichannelChannelPayload;
  onChange: (patch: Partial<OmnichannelChannelPayload>) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#0F172A]">Feedback details</h3>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {PARENT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange({ category: c.id })}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg border",
                payload.category === c.id ? "bg-[#1e3a5f] text-white" : "bg-white"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Priority</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ priority: p.id })}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg border",
                payload.priority === p.id ? "bg-amber-600 text-white" : "bg-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={payload.metadata.anonymous}
            onChange={(e) => onChange({ metadata: { ...payload.metadata, anonymous: e.target.checked } })}
          />
          Anonymous
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={payload.metadata.allowContact}
            onChange={(e) => onChange({ metadata: { ...payload.metadata, allowContact: e.target.checked } })}
          />
          Allow contact
        </label>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ rating: n })}
              className={cn("h-9 w-9 rounded-lg font-bold text-sm", payload.rating === n ? "bg-[#0F172A] text-white" : "bg-white border")}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreviewCard({
  channel,
  payload,
}: {
  channel: FeedbackChannel;
  payload: OmnichannelChannelPayload;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
      <h3 className="text-xs font-bold uppercase text-blue-800 mb-3">Preview before submit</h3>
      {channel === "whatsapp" && (
        <ul className="text-sm space-y-1 text-slate-700">
          <li>
            <strong>Messages:</strong> {(payload.metadata.whatsappMessages ?? []).length || (payload.text ? 1 : 0)}
          </li>
          <li>
            <strong>Attachments:</strong> {payload.attachments.length}
          </li>
          <li>
            <strong>Rating:</strong> {payload.rating}/5
          </li>
        </ul>
      )}
      {channel === "photo_issue" && (
        <ul className="text-sm space-y-1">
          <li>
            <strong>Images:</strong> {payload.attachments.length}
          </li>
          <li>
            <strong>Description:</strong> {payload.text || "—"}
          </li>
          <li>
            <strong>Category:</strong> {payload.category}
          </li>
        </ul>
      )}
      {channel === "ivr" && (
        <ul className="text-sm space-y-1">
          <li>
            <strong>Transcript:</strong> {(payload.transcript || payload.text || "").slice(0, 120) || "—"}
          </li>
          <li>
            <strong>Language:</strong> {payload.metadata.detectedLanguage ?? "en"}
          </li>
        </ul>
      )}
      {channel === "qr_code" && (
        <ul className="text-sm space-y-1">
          <li>
            <strong>Center:</strong> {payload.qrCenter?.centerName ?? "—"}{" "}
            {payload.qrCenter?.verified && <span className="text-emerald-700 font-bold">✓ Verified</span>}
          </li>
          <li>
            <strong>Issue:</strong> {payload.text.slice(0, 80) || "—"}
          </li>
        </ul>
      )}
      {channel === "sms" && (
        <ul className="text-sm space-y-1">
          <li>
            <strong>SMS:</strong> {payload.text}
          </li>
          <li>
            <strong>Length:</strong> {payload.text.length}/160
          </li>
        </ul>
      )}
      {channel === "handwritten_ocr" && (
        <ul className="text-sm space-y-1">
          <li>
            <strong>Extracted:</strong> {(payload.transcript || payload.text).slice(0, 100) || "—"}
          </li>
          <li>
            <strong>Image:</strong> {payload.attachments.length ? "Attached" : "None"}
          </li>
        </ul>
      )}
      <p className="text-[10px] text-slate-500 mt-2">
        Priority: {payload.priority} · {payload.metadata.anonymous ? "Anonymous" : "Named submission"}
      </p>
    </div>
  );
}
