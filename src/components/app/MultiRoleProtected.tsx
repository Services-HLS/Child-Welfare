import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Role } from "@/types/platform";
import { roleHomePath, normalizeRole } from "@/lib/rolePaths";
import { AppShell } from "./AppShell";

export function MultiRoleProtected({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  const r = normalizeRole(user.role);
  if (!roles.includes(r)) return <Navigate to={roleHomePath(r)} replace />;
  return <AppShell>{children}</AppShell>;
}

export function AuthRequired({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
}
