import { GrievancePortalHero } from "@/components/beneficiary/GrievancePortalHero";
import { ParentChildDashboardSection } from "@/components/beneficiary/ParentChildDashboardSection";
import { PublicPortalBanners } from "@/components/public/PublicPortalBanners";

export default function BeneficiaryDashboard() {
  return (
    <div className="space-y-6 pb-24 w-full max-w-none">
      <PublicPortalBanners />
      <GrievancePortalHero />
      <ParentChildDashboardSection />
    </div>
  );
}
