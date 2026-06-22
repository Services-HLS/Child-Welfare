import { useRef, useState } from "react";
import { ComplaintCategory } from "@/types/platform";
import { PublicFeedbackSubmitterType } from "@/types/public-context";
import { PublicEvidenceItem } from "@/types/public-request";
import { PublicGrievancePriority } from "@/types/grievance";
import { PublicEvidenceUpload } from "@/components/public/PublicEvidenceUpload";
import { useApp } from "@/context/AppContext";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Lang } from "@/types/platform";
import { VOICE_LANG_NATIVE } from "@/lib/voiceLang";
import { cn } from "@/lib/utils";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";

const SUBMITTER_OPTIONS: { id: PublicFeedbackSubmitterType; label: string }[] = [
  { id: "parent_caregiver", label: "Parent / Guardian" },
  { id: "pregnant_woman", label: "Pregnant Woman" },
  { id: "lactating_mother", label: "Lactating Mother" },
  { id: "citizen_community", label: "Community Member" },
  { id: "guardian", label: "Citizen" },
  { id: "other_beneficiary", label: "Other Beneficiary" },
];

export const GRIEVANCE_CATEGORIES: { id: ComplaintCategory; label: string }[] = [
  { id: "nutrition_quality", label: "Nutrition / Meals" },
  { id: "hot_cooked_meals", label: "Hot Cooked Meals" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "worker_behavior", label: "Worker Behaviour" },
  { id: "education", label: "Preschool Education" },
  { id: "service_delivery", label: "Health Services" },
  { id: "drinking_water", label: "Unsafe Drinking Water" },
  { id: "cleanliness", label: "Sanitation" },
  { id: "child_safety", label: "Child Safety" },
  { id: "attendance", label: "Worker Absenteeism" },
  { id: "other_concerns", label: "THR Distribution / Other" },
];

const CENTERS = [
  { id: "AWC-TPT-01", name: "Alipiri Center", village: "Alipiri", mandal: "Tirupati Urban" },
  { id: "AWC-TPT-03", name: "Renigunta Sector", village: "Renigunta", mandal: "Renigunta" },
  { id: "AWC-TPT-06", name: "Pakala South", village: "Pakala", mandal: "Pakala" },
];

export type PublicGrievancePayload = {
  submittedAs: PublicFeedbackSubmitterType;
  category: ComplaintCategory;
  title: string;
  description: string;
  centerId: string;
  centerName: string;
  village: string;
  mandal: string;
  district: string;
  priority: PublicGrievancePriority;
  evidence: PublicEvidenceItem[];
  anonymous: boolean;
  beneficiaryName: string;
  registeredMobile: string;
  consent: boolean;
};

type Props = {
  defaultMobile?: string;
  defaultName?: string;
  onSubmit: (p: PublicGrievancePayload) => Promise<void>;
  loading: boolean;
};

function titleFromDescription(text: string): string {
  const line = text.split(/[.!?\n]/)[0]?.trim() ?? text.trim();
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

export function SubmitGrievanceForm({ defaultMobile = "", defaultName = "", onSubmit, loading }: Props) {
  const { lang, setLang, t } = useApp();
  const { listening, error, startListening, stopListening, supported } = useVoiceInput(lang);
  const descriptionBeforeRecording = useRef("");

  const [submittedAs, setSubmittedAs] = useState<PublicFeedbackSubmitterType>("parent_caregiver");
  const [category, setCategory] = useState<ComplaintCategory>("nutrition_quality");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [centerId, setCenterId] = useState(CENTERS[0].id);
  const [priority, setPriority] = useState<PublicGrievancePriority>("medium");
  const [evidence, setEvidence] = useState<PublicEvidenceItem[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState(defaultName);
  const [mobile, setMobile] = useState(defaultMobile);
  const [consent, setConsent] = useState(false);

  const handleAnonymousChange = (checked: boolean) => {
    setAnonymous(checked);
    if (checked) {
      setName("");
      setMobile("");
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) setAnonymous(false);
  };

  const handleMobileChange = (value: string) => {
    setMobile(value);
    if (value.trim()) setAnonymous(false);
  };

  const center = CENTERS.find((c) => c.id === centerId) ?? CENTERS[0];

  const finishVoiceRecording = (transcript: string, usedFallback: boolean) => {
    const trimmed = transcript.trim();
    if (!trimmed) {
      setDescription(descriptionBeforeRecording.current);
      return;
    }

    const base = descriptionBeforeRecording.current;
    setDescription(base ? `${base} ${trimmed}` : trimmed);
    toast.success(t("voiceCapturedToast"));
    if (usedFallback) {
      toast.info(t("voiceMicUnavailable"), { description: t("voiceCapturedToast") });
    }
  };

  const handleStartVoice = async () => {
    if (listening || loading) return;
    descriptionBeforeRecording.current = description.trim();
    await startListening((interim) => {
      const base = descriptionBeforeRecording.current;
      setDescription(base ? `${base} ${interim}` : interim);
    });
  };

  const handleStopVoice = async () => {
    if (!listening) return;
    const result = await stopListening();
    if (result) finishVoiceRecording(result.text, result.usedFallback);
    else setDescription(descriptionBeforeRecording.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const desc = description.trim();
    const complaintTitle = title.trim() || titleFromDescription(desc);
    if (!consent || !desc) return;
    if (!anonymous && (!name.trim() || !mobile.trim())) return;

    await onSubmit({
      submittedAs,
      category,
      title: complaintTitle,
      description: desc,
      centerId: center.id,
      centerName: center.name,
      village: center.village,
      mandal: center.mandal,
      district: "Tirupati",
      priority,
      evidence,
      anonymous,
      beneficiaryName: anonymous ? "" : name.trim(),
      registeredMobile: anonymous ? "" : mobile.trim(),
      consent,
    });
  };

  const canSubmit =
    consent &&
    description.trim().length > 0 &&
    (anonymous || (name.trim().length > 0 && mobile.trim().length > 0));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-sm border-2 border-[#1e3a5f] bg-white p-4">
        <p className="text-[10px] font-bold uppercase text-[#1e40af] mb-3">{t("who_submitting")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUBMITTER_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSubmittedAs(o.id)}
              className={cn(
                "rounded-sm border p-2.5 text-left text-[11px] font-bold transition-colors",
                submittedAs === o.id ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-slate-200 bg-white hover:border-[#1e40af]"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-500 mt-2">{t("who_submitting_hint")}</p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600">{t("complaint_category_label")}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ComplaintCategory)} className="mt-1 w-full rounded-sm border px-3 py-2 text-sm">
            {GRIEVANCE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600">{t("priority_label")}</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as PublicGrievancePriority)} className="mt-1 w-full rounded-sm border px-3 py-2 text-sm">
            <option value="low">{t("priority_low")}</option>
            <option value="medium">{t("priority_medium")}</option>
            <option value="high">{t("priority_high")}</option>
            <option value="critical">{t("priority_critical")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-slate-600">{t("complaint_title_label")}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-sm border px-3 py-2 text-sm"
          placeholder={t("complaint_title_placeholder")}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="text-[10px] font-bold uppercase text-slate-600">{t("detailed_description")} *</label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold uppercase text-slate-500 hidden sm:inline">{t("voiceLangActive")}:</span>
            {(["en", "te", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-sm border transition-colors",
                  lang === l ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#1e40af]"
                )}
              >
                {VOICE_LANG_NATIVE[l]}
              </button>
            ))}
            {!listening ? (
              <button
                type="button"
                onClick={handleStartVoice}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-bold rounded-sm px-3 py-1.5 border border-[#1e40af] text-[#1e40af] hover:bg-blue-50 transition-colors"
              >
                <Mic className="h-3.5 w-3.5" />
                {t("speakComplaint")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopVoice}
                className="flex items-center gap-1.5 text-xs font-bold rounded-sm px-3 py-1.5 border border-red-600 bg-red-600 text-white hover:bg-red-700 animate-pulse transition-colors"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                {t("stopRecording")}
              </button>
            )}
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          readOnly={listening}
          className={cn(
            "w-full rounded-sm border px-3 py-2 text-sm",
            listening && "border-[#1e40af] bg-blue-50/40 ring-2 ring-[#1e40af]/20"
          )}
          placeholder={t("voiceDescriptionPlaceholder")}
          dir={lang === "hi" ? "auto" : undefined}
        />
        <p className="text-[9px] text-slate-500 mt-1">
          {supported ? t("voiceMicReady") : t("voiceMicUnavailable")}
        </p>
        <p className="text-[9px] text-[#1e40af] mt-0.5 font-semibold">
          {t("voiceLangHint")} · {VOICE_LANG_NATIVE[lang]}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {listening && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {t("voiceRecordingHint")} · {t("stopRecording")}
          </p>
        )}
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-slate-600">{t("anganwadi_center")}</label>
        <select value={centerId} onChange={(e) => setCenterId(e.target.value)} className="mt-1 w-full rounded-sm border px-3 py-2 text-sm">
          {CENTERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => handleAnonymousChange(e.target.checked)}
        />
        {t("anonymous_submission")}
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600">
            {t("profile_name")}{!anonymous && " *"}
          </label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={anonymous}
            required={!anonymous}
            type="text"
            className="mt-1 w-full rounded-sm border px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder={anonymous ? t("anonymous_submission") : t("profile_name")}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-600">
            {t("registered_mobile")}{!anonymous && " *"}
          </label>
          <input
            value={mobile}
            onChange={(e) => handleMobileChange(e.target.value)}
            disabled={anonymous}
            required={!anonymous}
            type="tel"
            className="mt-1 w-full rounded-sm border px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            placeholder={anonymous ? t("anonymous_submission") : t("mobile_placeholder")}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div><span className="text-[10px] font-bold uppercase text-slate-500">{t("village_label")}</span><p className="font-medium">{center.village}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">{t("mandal_label")}</span><p className="font-medium">{center.mandal}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">{t("district_label_short")}</span><p className="font-medium">Tirupati</p></div>
      </div>

      <div>
        <PublicEvidenceUpload
          evidence={evidence}
          onChange={setEvidence}
          lang={lang}
          label={t("photo_video_evidence")}
          showVoice={false}
          showOcr
          ocrUploadLabel={t("ocr_upload_label")}
          ocrProcessingLabel={t("ocr_processing")}
          ocrSuccessLabel={t("ocrCapturedToast")}
          ocrErrorLabel={t("ocr_error")}
        />
        <p className="text-[9px] text-slate-500 mt-1">{t("ocr_evidence_note")}</p>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1" />
        <span>{t("consent_label")}</span>
      </label>

      <button type="submit" disabled={loading || !canSubmit} className="w-full gov-btn-primary py-3 text-sm font-bold uppercase disabled:opacity-50">
        {loading ? t("submitting") : t("submit_public_grievance")}
      </button>
    </form>
  );
}
