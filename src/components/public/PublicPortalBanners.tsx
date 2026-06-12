import { Link } from "react-router-dom";
import { Shield, Globe, FileCheck } from "lucide-react";

export function PublicPortalBanners() {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 flex gap-2">
        <FileCheck className="h-4 w-4 shrink-0" />
        <span>
          <strong>DPDP consent</strong> — Evidence and grievances are processed per Andhra Pradesh data protection guidelines. Manage preferences in Public Profile.
        </span>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 flex flex-wrap gap-3">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" /> EN / TE / HI in Profile
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" /> Offline drafts saved for omnichannel
        </span>
        <Link to="/public/transparency" className="font-bold text-[#1e40af]">
          State transparency dashboard →
        </Link>
      </div>
    </div>
  );
}
