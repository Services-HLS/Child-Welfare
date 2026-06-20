import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Languages } from "lucide-react";
import { toast } from "sonner";
import { Lang } from "@/types/platform";
import { VOICE_LANG_NATIVE } from "@/lib/voiceLang";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";

export default function BeneficiaryProfile() {
  const { user, logout, lang, setLang, t } = useApp();
  const { myFeedback } = usePublicPortal();
  const navigate = useNavigate();
  const recentFeedbackTypes = Array.from(
    new Set(
      myFeedback
        .map((f) => f.feedbackContext?.submittedAs)
        .filter((v): v is keyof typeof PUBLIC_FEEDBACK_SUBMITTER_LABELS => !!v)
    )
  ).slice(0, 5);

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader badge={t("public_profile")} title={t("public_profile")} subtitle={t("public_profile_subtitle")} />

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
        <div className="text-[10px] font-bold uppercase text-slate-500">{t("profile_name")}</div>
        <div className="text-sm font-bold">{user?.name}</div>
        <div className="text-[10px] font-bold uppercase text-slate-500 mt-2">{t("profile_mobile")}</div>
        <div className="text-sm">{user?.phone}</div>
        <div className="text-[10px] font-bold uppercase text-slate-500 mt-2">{t("recent_contexts")}</div>
        <div className="flex flex-wrap gap-2">
          {recentFeedbackTypes.length ? recentFeedbackTypes.map((type) => (
            <span key={type} className="px-2 py-1 text-xs rounded-full border bg-slate-50">
              {PUBLIC_FEEDBACK_SUBMITTER_LABELS[type]}
            </span>
          )) : <span className="text-xs text-slate-500">{t("no_feedback_history")}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3">
          <Languages className="h-4 w-4" /> {t("language")}
        </div>
        <p className="text-xs text-slate-600 mb-3">{t("voice_profile_hint")}</p>
        <div className="flex gap-2 flex-wrap">
          {(["en", "te", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lang === l ? "bg-blue-600 text-white" : "bg-slate-100"}`}
            >
              {VOICE_LANG_NATIVE[l]}
            </button>
          ))}
        </div>
      </div>


      <button
        type="button"
        onClick={() => {
          logout();
          toast.success(t("logged_out_toast"));
          navigate("/");
        }}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 py-3 text-xs font-bold uppercase"
      >
        <LogOut className="h-4 w-4" /> {t("logout")}
      </button>
    </div>
  );
}
