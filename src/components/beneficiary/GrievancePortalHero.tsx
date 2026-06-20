import { Link } from "react-router-dom";
import { Shield, Search, FileText, Clock, Scale, BookOpen, ChevronRight } from "lucide-react";
import { mockAnnouncements } from "@/data/mockGrievances";
import { useApp } from "@/context/AppContext";

const CHARTER_KEYS = [
  { icon: Clock, titleKey: "charter_timeline_title" as const, bodyKey: "charter_timeline_body" as const },
  { icon: Scale, titleKey: "charter_rights_title" as const, bodyKey: "charter_rights_body" as const },
  { icon: FileText, titleKey: "charter_standards_title" as const, bodyKey: "charter_standards_body" as const },
  { icon: BookOpen, titleKey: "charter_guide_title" as const, bodyKey: "charter_guide_body" as const },
];

export function GrievancePortalHero() {
  const { t } = useApp();

  return (
    <section className="space-y-5">
      <div className="rounded-sm border-2 border-[#0c1f3d] bg-gradient-to-br from-[#0c1f3d] to-[#1e3a5f] text-white p-5 sm:p-6 shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a227]">{t("gov_ap_wdcw")}</p>
        <h2 className="text-xl sm:text-2xl font-bold mt-1">{t("grievance_portal_title")}</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">{t("grievance_portal_desc")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-sm border-2 border-[#1e40af] bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-sm bg-[#1e40af] text-white flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0c1f3d]">{t("submit_grievance_card_title")}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t("submit_grievance_card_desc")}</p>
            </div>
          </div>
          <Link to="/beneficiary/submit-grievance" className="mt-4 gov-btn-primary text-center py-3 text-sm font-bold uppercase tracking-wide">
            {t("submit_grievance")}
          </Link>
        </div>

        <div className="rounded-sm border-2 border-emerald-700 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-sm bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0c1f3d]">{t("track_grievance_card_title")}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t("track_grievance_card_desc")}</p>
            </div>
          </div>
          <Link to="/beneficiary/track-grievance" className="mt-4 inline-flex items-center justify-center gap-2 rounded-sm bg-emerald-700 text-white border border-emerald-800 px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-emerald-800 transition-colors">
            {t("track_grievance")}
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-sm border border-slate-200 bg-white p-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">{t("recent_announcements")}</h4>
          {mockAnnouncements.slice(0, 2).map((a) => (
            <div key={a.id} className="py-2 border-b border-slate-50 last:border-0">
              <p className="text-sm font-bold text-slate-900">{a.title}</p>
              <p className="text-xs text-slate-500">{a.body}</p>
            </div>
          ))}
        </div>
        <div className="rounded-sm border border-slate-200 bg-white p-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">{t("citizen_charter")}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{t("citizen_charter_desc")}</p>
          <Link to="/beneficiary/help" className="text-xs font-bold text-[#1e40af] mt-2 inline-flex items-center gap-1">
            {t("full_charter")} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHARTER_KEYS.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div key={titleKey} className="rounded-sm border border-slate-200 bg-white p-4">
            <Icon className="h-5 w-5 text-[#1e40af] mb-2" />
            <p className="text-xs font-bold text-[#0c1f3d]">{t(titleKey)}</p>
            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
