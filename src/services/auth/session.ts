import { AppUser, Role } from "@/types/platform";
import { demoUsers } from "@/data/mockData";
import { normalizeRole } from "@/lib/rolePaths";

const STORAGE_USER = "angansakti.user";
const LEGACY_STORAGE_USER = "awai.user";

/** Build user profile from role — extensible for API login later */
export function buildUserFromRole(role: Role, credentials?: { phone?: string; password?: string }): AppUser {
  const d = demoUsers[role];
  const base: AppUser = {
    role,
    name: d.name,
    id: d.id,
    phone: credentials?.phone ?? d.phone,
    languagePreference: "en",
    notificationSettings: { push: true, sms: true, whatsapp: true, inApp: true },
  };

  if (role === "worker") {
    return {
      ...base,
      centerId: (d as { centerId: string }).centerId,
      centerName: (d as { center: string }).center,
      district: "Tirupati",
    };
  }
  if (role === "beneficiary") {
    return {
      ...base,
      centerId: (d as { centerId: string }).centerId,
      centerName: (d as { center: string }).center,
      district: "Tirupati",
      children: (d as { children: AppUser["children"] }).children,
      complaintCount: 1,
      languagePreference: "en",
    };
  }
  if (role === "supervisor") {
    return { ...base, assignedDistrict: "Tirupati", district: "Tirupati" };
  }
  if (role === "district_admin") {
    return { ...base, assignedDistrict: "Tirupati", district: "Tirupati" };
  }
  return { ...base, assignedDistrict: "Andhra Pradesh" };
}

export function loadStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER) ?? localStorage.getItem(LEGACY_STORAGE_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppUser & { role: string };
    parsed.role = normalizeRole(parsed.role);
    return parsed;
  } catch {
    return null;
  }
}

export function persistUser(user: AppUser | null): void {
  if (user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    localStorage.removeItem(LEGACY_STORAGE_USER);
  } else {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(LEGACY_STORAGE_USER);
  }
}

export async function authenticate(
  role: Role,
  credentials?: { phone?: string; password?: string }
): Promise<AppUser> {
  await new Promise((r) => setTimeout(r, 800));
  return buildUserFromRole(role, credentials);
}
