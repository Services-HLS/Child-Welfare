import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePublicPortal } from "@/hooks/usePublicPortal";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { format } from "date-fns";
import { Plus, ChevronRight, FileText } from "lucide-react";

export default function MyGrievances() {
  const { user, t } = useApp();
  const { complaints } = usePublicPortal();

  const myGrievances = useMemo(() => {
    const uid = user?.id ?? "";
    const mobile = user?.phone;
    return complaints
      .filter((c) => c.beneficiaryId === uid || (mobile && c.registeredMobile === mobile))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaints, user?.id, user?.phone]);

  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPageHeader
        badge={t("nav_feedback")}
        title={t("my_grievances")}
        subtitle={t("my_grievances_subtitle")}
      />

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <p className="text-sm font-bold text-slate-600">
          {myGrievances.length} {t("my_grievances_count")}
        </p>
        <Link
          to="/beneficiary/submit-grievance"
          className="flex items-center gap-2 gov-btn-primary text-xs py-2.5 px-4"
        >
          <Plus className="h-4 w-4" /> {t("submit_grievance")}
        </Link>
      </div>

      {myGrievances.length === 0 ? (
        <div className="rounded-sm border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">{t("my_grievances_empty")}</p>
          <Link to="/beneficiary/submit-grievance" className="gov-btn-outline text-xs mt-4 inline-block">
            {t("submit_grievance")}
          </Link>
        </div>
      ) : (
        <div className="rounded-sm border-2 border-slate-200 bg-white divide-y divide-slate-200">
          {myGrievances.map((c) => (
            <Link
              key={c.id}
              to={`/beneficiary/my-grievances/${c.id}`}
              className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-[#0c1f3d] group-hover:text-[#1e40af]">{c.title}</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {c.id} · {format(new Date(c.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 group-hover:text-[#1e40af]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
