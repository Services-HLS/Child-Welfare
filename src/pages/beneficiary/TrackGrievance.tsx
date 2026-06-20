import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { CitizenTimeline } from "@/components/executive/ExecutiveReport";
import { getCitizenTimelineStep } from "@/services/ai/investigation-engine";
import { PUBLIC_FEEDBACK_SUBMITTER_LABELS } from "@/types/public-context";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { ComplaintRecord } from "@/types/platform";

function findGrievance(complaints: ComplaintRecord[], query: string): ComplaintRecord | null {
  const q = query.trim();
  if (!q) return null;
  const byId = complaints.find((c) => c.id.toLowerCase() === q.toLowerCase());
  if (byId) return byId;
  return complaints.find((c) => c.registeredMobile === q || c.beneficiaryId === q) ?? null;
}

export default function TrackGrievance() {
  const { complaints, t } = useApp();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<ComplaintRecord | null>(null);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setFound(findGrievance(complaints, query));
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-2xl">
      <PublicPageHeader
        badge={t("track_grievance_badge")}
        title={t("track_grievance")}
        subtitle={t("track_grievance_card_desc")}
      />

      <form onSubmit={search} className="rounded-sm border-2 border-[#1e3a5f] bg-white p-5 space-y-4">
        <label className="text-[10px] font-bold uppercase text-slate-600">{t("track_search_label")}</label>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("track_search_placeholder")}
            className="flex-1 rounded-sm border px-3 py-2.5 text-sm font-mono"
          />
          <button type="submit" className="gov-btn-primary flex items-center gap-2 px-5">
            <Search className="h-4 w-4" /> {t("track_search_btn")}
          </button>
        </div>
      </form>

      {searched && !found && (
        <p className="text-sm text-slate-600 text-center py-8 rounded-sm border bg-slate-50">{t("track_not_found")}</p>
      )}

      {found && (
        <div className="rounded-sm border-2 border-slate-300 bg-white p-5 space-y-5">
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("grievance_id_label")}</dt><dd className="font-mono font-bold">{found.id}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("submitted_as_label")}</dt><dd className="font-bold">{found.submittedAs ? PUBLIC_FEEDBACK_SUBMITTER_LABELS[found.submittedAs] : t("citizen_label")}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("complaint_category_label")}</dt><dd className="font-bold capitalize">{found.category.replace(/_/g, " ")}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("center")}</dt><dd className="font-bold">{found.centerName}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("status")}</dt><dd className="font-bold capitalize text-[#1e40af]">{found.status.replace(/_/g, " ")}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase text-slate-500">{t("assigned_supervisor_label")}</dt><dd className="font-bold">{found.supervisorName ?? "Supervisor · Tirupati"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[9px] font-bold uppercase text-slate-500">{t("expected_resolution_label")}</dt><dd className="font-bold">{format(new Date(found.slaDueAt), "PPP")}</dd></div>
          </dl>

          <div>
            <h3 className="text-xs font-bold uppercase text-[#1e3a5f] mb-3">{t("resolution_timeline")}</h3>
            <CitizenTimeline currentStep={getCitizenTimelineStep(found.status)} />
          </div>

          {(found.status === "resolution" || found.status === "beneficiary_confirmation") && (
            <Link to={`/beneficiary/request/${found.id}`} className="gov-btn-primary text-sm inline-block">
              {t("confirm_resolution")} →
            </Link>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-500 text-center">{t("citizen_privacy_note")}</p>
    </div>
  );
}
