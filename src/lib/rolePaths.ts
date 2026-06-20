import { Role } from "@/types/platform";

/** URL home path per role (kebab-case paths) */
export const ROLE_HOME: Record<Role, string> = {
  beneficiary: "/beneficiary/my-grievances",
  worker: "/worker/dashboard",
  supervisor: "/supervisor",
  district_admin: "/district-admin/grievance-command",
  state_admin: "/state-admin/grievance-command",
};

export function roleHomePath(role: Role | string): string {
  if (role === "admin") return ROLE_HOME.district_admin;
  return ROLE_HOME[role as Role] ?? "/";
}

export function normalizeRole(role: string): Role {
  if (role === "admin") return "district_admin";
  return role as Role;
}

/** Notifications / alerts route per role for header bell icon */
export function getNotificationPath(role: Role | string): string {
  const r = normalizeRole(String(role));
  const paths: Record<Role, string> = {
    beneficiary: "/beneficiary/notifications",
    worker: "/worker/alerts",
    supervisor: "/supervisor/alerts",
    district_admin: "/district-admin/complaints",
    state_admin: "/state-admin/notifications",
  };
  return paths[r] ?? ROLE_HOME[r];
}
