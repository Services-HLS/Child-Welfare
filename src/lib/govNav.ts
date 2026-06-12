import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  Building2,
  Users,
  Bell,
  BarChart3,
  MapPin,
  ImageIcon,
  Settings,
  GraduationCap,
  Activity,
  FileText,
  Heart,
  Sun,
  UtensilsCrossed,
  HelpCircle,
  Radio,
  Target,
} from "lucide-react";
import type { Role } from "@/types/platform";

export type GovNavItem = {
  to: string;
  labelKey: string;
  descriptionKey?: string;
  icon: typeof LayoutDashboard;
};
export type GovNavSection = { sectionKey: string; items: GovNavItem[] };

export const GOV_NAV: Record<Role, GovNavSection[]> = {
  beneficiary: [
    { sectionKey: "nav_operations", items: [
      { to: "/beneficiary", labelKey: "control_room", icon: LayoutDashboard },
      { to: "/beneficiary/my-child", labelKey: "my_services", icon: Heart },
      { to: "/beneficiary/daily-journey", labelKey: "today_services", icon: Sun },
      { to: "/beneficiary/activities", labelKey: "center_services", icon: Activity },
      { to: "/beneficiary/nutrition", labelKey: "nutrition", icon: UtensilsCrossed },
      { to: "/beneficiary/center-timeline", labelKey: "center_timeline", icon: Radio },
    ]},
    { sectionKey: "nav_citizen_feedback", items: [
      {
        to: "/beneficiary/feedback",
        labelKey: "share_experience",
        descriptionKey: "share_experience_desc",
        icon: MessageSquare,
      },
      {
        to: "/beneficiary/omnichannel-feedback",
        labelKey: "report_issue",
        descriptionKey: "report_issue_desc",
        icon: ClipboardList,
      },
      { to: "/public/my-experiences", labelKey: "my_experiences", icon: Heart },
      { to: "/public/my-requests", labelKey: "my_requests", icon: ShieldCheck },
      { to: "/beneficiary/complaints", labelKey: "grievance_center", icon: ShieldCheck },
      { to: "/beneficiary/status", labelKey: "track_resolution", icon: MapPin },
      { to: "/beneficiary/surveys", labelKey: "surveys", icon: FileText },
    ]},
    { sectionKey: "nav_communication", items: [
      { to: "/beneficiary/notifications", labelKey: "communication_center", icon: Bell },
      { to: "/beneficiary/center-health", labelKey: "center_health", icon: Building2 },
      { to: "/beneficiary/profile", labelKey: "profile", icon: Users },
      { to: "/beneficiary/help", labelKey: "help_support", icon: HelpCircle },
    ]},
  ],
  worker: [
    { sectionKey: "nav_operations", items: [
      { to: "/worker/dashboard", labelKey: "daily_operations", icon: LayoutDashboard },
      { to: "/worker/my-day", labelKey: "my_day", icon: ClipboardList },
      { to: "/worker/attendance", labelKey: "attendance", icon: MapPin },
      { to: "/worker/session-monitor", labelKey: "session_recording", icon: Radio },
    ]},
    { sectionKey: "nav_service_delivery", items: [
      { to: "/worker/activities", labelKey: "service_delivery_tracker", icon: Activity },
      { to: "/worker/child-progress", labelKey: "child_outcomes", icon: GraduationCap },
      { to: "/worker/uploads", labelKey: "service_submission_queue", icon: ImageIcon },
      { to: "/worker/training", labelKey: "training_coaching_center", icon: ImageIcon },
      { to: "/worker/complaints", labelKey: "assigned_issues_responses", icon: ShieldCheck },
    ]},
    { sectionKey: "nav_monitoring", items: [
      { to: "/worker/growth", labelKey: "my_growth_journey", icon: BarChart3 },
    ]},
    { sectionKey: "nav_communication", items: [
      { to: "/worker/alerts", labelKey: "communication_center", icon: Bell },
    ]},
    { sectionKey: "nav_profile", items: [
      { to: "/worker/profile", labelKey: "worker_identity_settings", icon: Users },
      { to: "/worker/help-support", labelKey: "help_support", icon: Settings },
      { to: "/settings/sync", labelKey: "sync_settings", icon: Settings },
    ]},
  ],
  supervisor: [
    { sectionKey: "nav_monitoring", items: [
      { to: "/supervisor", labelKey: "monitoring_command", icon: LayoutDashboard },
      { to: "/supervisor/centers", labelKey: "centers", icon: Building2 },
      { to: "/supervisor/map", labelKey: "location", icon: MapPin },
      { to: "/supervisor/interventions", labelKey: "intervention_status", icon: Target },
    ]},
    { sectionKey: "nav_service_delivery", items: [
      { to: "/supervisor/classroom-intelligence", labelKey: "classroom_intelligence", icon: GraduationCap },
      { to: "/supervisor/session-review", labelKey: "session_observation", icon: ClipboardList },
      { to: "/supervisor/coaching", labelKey: "coaching", icon: Users },
      { to: "/supervisor/development", labelKey: "workforce_development", icon: BarChart3 },
      { to: "/supervisor/child-outcomes", labelKey: "child_outcomes", icon: GraduationCap },
    ]},
    { sectionKey: "nav_citizen_feedback", items: [
      { to: "/supervisor/public-grievance-center", labelKey: "public_grievance_center", icon: ShieldCheck },
      { to: "/supervisor/complaints", labelKey: "grievance_monitoring", icon: ShieldCheck },
      { to: "/voice-of-citizen", labelKey: "voice_of_beneficiary", icon: MessageSquare },
    ]},
    { sectionKey: "nav_intelligence", items: [
      { to: "/center-command/AWC-TPT-01", labelKey: "center_journey", icon: Radio },
      { to: "/analytics/aei", labelKey: "service_insight", icon: BarChart3 },
    ]},
    { sectionKey: "nav_reports", items: [
      { to: "/supervisor/reports", labelKey: "reports", icon: BarChart3 },
      { to: "/supervisor/alerts", labelKey: "communication_center", icon: Bell },
    ]},
  ],
  district_admin: [
    { sectionKey: "nav_operations", items: [
      { to: "/district-admin/mission-control", labelKey: "mission_control", icon: Radio },
      { to: "/district-admin/centers", labelKey: "centers_covered", icon: Building2 },
      { to: "/district-admin/workers", labelKey: "workers", icon: Users },
    ]},
    { sectionKey: "nav_monitoring", items: [
      { to: "/district-admin/classroom-intelligence", labelKey: "classroom_intelligence", icon: GraduationCap },
      { to: "/district-admin/compliance", labelKey: "compliance_module", icon: ShieldCheck },
      { to: "/district-admin/escalated-grievances", labelKey: "district_escalated_grievances", icon: ShieldCheck },
      { to: "/district-admin/complaints", labelKey: "grievance_monitoring", icon: ShieldCheck },
      { to: "/district-admin/interventions", labelKey: "intervention_status", icon: Target },
      { to: "/district-admin/outcomes", labelKey: "child_outcomes", icon: GraduationCap },
    ]},
    { sectionKey: "nav_intelligence", items: [
      { to: "/voice-of-citizen", labelKey: "voice_of_beneficiary", icon: MessageSquare },
      { to: "/center-command/AWC-TPT-01", labelKey: "center_journey", icon: Radio },
      { to: "/analytics/aei", labelKey: "service_insight", icon: BarChart3 },
      { to: "/impact", labelKey: "public_impact", icon: BarChart3 },
    ]},
    { sectionKey: "nav_administration", items: [
      { to: "/district-admin/integrations", labelKey: "integrations", icon: MapPin },
      { to: "/district-admin/reports", labelKey: "reports", icon: FileText },
    ]},
  ],
  state_admin: [
    { sectionKey: "nav_operations", items: [
      { to: "/state-admin/mission-control", labelKey: "mission_control", icon: Radio },
    ]},
    { sectionKey: "nav_monitoring", items: [
      { to: "/state-admin/classroom-intelligence", labelKey: "classroom_intelligence", icon: GraduationCap },
      { to: "/state-admin/complaints", labelKey: "grievance_monitoring", icon: ShieldCheck },
      { to: "/state-admin/compliance", labelKey: "compliance_module", icon: ShieldCheck },
      { to: "/state-admin/outcomes", labelKey: "child_outcomes", icon: GraduationCap },
    ]},
    { sectionKey: "nav_intelligence", items: [
      { to: "/voice-of-citizen", labelKey: "voice_of_beneficiary", icon: MessageSquare },
      { to: "/state-admin/impact", labelKey: "public_impact", icon: BarChart3 },
      { to: "/state-admin/story", labelKey: "gov_story", icon: FileText },
    ]},
    { sectionKey: "nav_administration", items: [
      { to: "/state-admin/integrations", labelKey: "integrations", icon: MapPin },
      { to: "/state-admin/reports", labelKey: "reports", icon: FileText },
      { to: "/state-admin/notifications", labelKey: "communication_center", icon: Bell },
    ]},
  ],
};

export const ROUTE_META: Record<string, { titleKey: string; descKey: string }> = {
  "/beneficiary": { titleKey: "citizen_portal", descKey: "citizen_portal_desc" },
  "/worker": { titleKey: "daily_operations", descKey: "daily_operations_desc" },
  "/worker/dashboard": { titleKey: "daily_operations_console", descKey: "daily_operations_desc" },
  "/supervisor": { titleKey: "monitoring_command", descKey: "monitoring_command_desc" },
  "/district-admin": { titleKey: "district_command", descKey: "district_command_desc" },
  "/state-admin": { titleKey: "state_command", descKey: "state_command_desc" },
  "/state-admin/mission-control": { titleKey: "state_command", descKey: "state_command_desc" },
};
