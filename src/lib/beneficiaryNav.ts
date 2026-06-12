import type { GovNavSection } from "@/lib/govNav";
import { BeneficiaryType } from "@/types/public-context";
import {
  LayoutDashboard,
  Heart,
  Sun,
  Activity,
  UtensilsCrossed,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  MapPin,
  FileText,
  Bell,
  Building2,
  Users,
  HelpCircle,
  Calendar,
} from "lucide-react";

const base = {
  control: { to: "/beneficiary", labelKey: "control_room", icon: LayoutDashboard },
  myServices: { to: "/beneficiary/my-child", labelKey: "my_services", icon: Heart },
  today: { to: "/beneficiary/daily-journey", labelKey: "todays_services", icon: Sun },
  supportTimeline: { to: "/beneficiary/daily-journey", labelKey: "support_timeline", icon: Calendar },
  centerServices: { to: "/beneficiary/activities", labelKey: "center_services", icon: Activity },
  nutrition: { to: "/beneficiary/nutrition", labelKey: "nutrition_services", icon: UtensilsCrossed },
  shareExperience: {
    to: "/beneficiary/feedback",
    labelKey: "share_experience",
    descriptionKey: "share_experience_desc",
    icon: MessageSquare,
  },
  reportIssue: {
    to: "/beneficiary/omnichannel-feedback",
    labelKey: "report_issue",
    descriptionKey: "report_issue_desc",
    icon: ClipboardList,
  },
  myExperiences: { to: "/public/my-experiences", labelKey: "my_experiences", icon: Heart },
  grievances: { to: "/beneficiary/complaints", labelKey: "public_grievance_center", icon: ShieldCheck },
  track: { to: "/beneficiary/status", labelKey: "track_resolution", icon: MapPin },
  surveys: { to: "/beneficiary/surveys", labelKey: "parent_surveys", icon: FileText },
  notifications: { to: "/beneficiary/notifications", labelKey: "communication_center", icon: Bell },
  centerHealth: { to: "/beneficiary/center-health", labelKey: "center_health", icon: Building2 },
  profile: { to: "/beneficiary/profile", labelKey: "beneficiary_profile", icon: Users },
  help: { to: "/beneficiary/help", labelKey: "help_support", icon: HelpCircle },
};

function section(sectionKey: string, items: (typeof base)[keyof typeof base][]) {
  return { sectionKey, items };
}

/** Dynamic sidebar by beneficiary segment — routes unchanged */
export function getBeneficiaryNavSections(type: BeneficiaryType): GovNavSection[] {
  switch (type) {
    case "pregnant_woman":
      return [
        section("nav_operations", [base.control, base.myServices, base.supportTimeline, base.nutrition]),
        section("nav_citizen_feedback", [
          base.shareExperience,
          base.reportIssue,
          base.myExperiences,
          { to: "/public/my-requests", labelKey: "my_requests", icon: ShieldCheck },
          base.grievances,
          base.track,
          base.surveys,
        ]),
        section("nav_communication", [base.notifications, base.centerHealth, base.profile, base.help]),
      ];
    case "lactating_mother":
      return [
        section("nav_operations", [
          base.control,
          base.myServices,
          base.nutrition,
          base.centerServices,
          base.today,
        ]),
        section("nav_citizen_feedback", [
          base.shareExperience,
          base.reportIssue,
          base.myExperiences,
          { to: "/public/my-requests", labelKey: "my_requests", icon: ShieldCheck },
          base.grievances,
          base.track,
        ]),
        section("nav_communication", [base.notifications, base.centerHealth, base.profile, base.help]),
      ];
    case "caregiver_guardian":
      return [
        section("nav_operations", [base.control, base.myServices, base.centerServices, base.nutrition]),
        section("nav_citizen_feedback", [
          base.shareExperience,
          base.reportIssue,
          base.myExperiences,
          { to: "/public/my-requests", labelKey: "my_requests", icon: ShieldCheck },
          base.grievances,
          base.track,
        ]),
        section("nav_communication", [base.notifications, base.profile, base.help]),
      ];
    case "parent_child":
    default:
      return [
        section("nav_operations", [
          base.control,
          base.myServices,
          base.today,
          base.centerServices,
          base.nutrition,
        ]),
        section("nav_citizen_feedback", [
          base.shareExperience,
          base.reportIssue,
          base.myExperiences,
          { to: "/public/my-requests", labelKey: "my_requests", icon: ShieldCheck },
          base.grievances,
          base.track,
          base.surveys,
        ]),
        section("nav_communication", [base.notifications, base.centerHealth, base.profile, base.help]),
      ];
  }
}

export function beneficiaryHomePath(hasContext: boolean): string {
  return hasContext ? "/beneficiary" : "/beneficiary/select-context";
}
