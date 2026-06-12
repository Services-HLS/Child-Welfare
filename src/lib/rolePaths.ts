import { Role } from "@/types/platform";

/** URL home path per role (kebab-case paths) */
export const ROLE_HOME: Record<Role, string> = {
  beneficiary: "/beneficiary",
  worker: "/worker/dashboard",
  supervisor: "/supervisor",
  district_admin: "/district-admin/mission-control",
  state_admin: "/state-admin/mission-control",
};

export function roleHomePath(role: Role | string): string {
  if (role === "admin") return ROLE_HOME.district_admin;
  return ROLE_HOME[role as Role] ?? "/";
}

export function normalizeRole(role: string): Role {
  if (role === "admin") return "district_admin";
  return role as Role;
}
