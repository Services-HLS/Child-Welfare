import { useApp } from "@/context/AppContext";
import { PublicPageHeader } from "@/components/beneficiary/ParentPageHeader";
import { PublicCenterTimeline } from "@/components/public/PublicCenterTimeline";

export default function CenterTimelinePage() {
  const { user } = useApp();
  if (!user?.centerId) return null;
  return (
    <div className="space-y-6 pb-24">
      <PublicPageHeader
        badge="Public Center Timeline"
        title={user.centerName ?? "Your Anganwadi"}
        subtitle="Citizen-safe service updates from preschool sessions and daily logs"
      />
      <PublicCenterTimeline centerId={user.centerId} />
    </div>
  );
}
