import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Role } from "@/types/platform";
import { roleHomePath, normalizeRole } from "@/lib/rolePaths";
import { AppShell } from "./AppShell";

export function Protected({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  const userRole = normalizeRole(user.role);
  if (userRole !== role) return <Navigate to={roleHomePath(userRole)} replace />;
  return <AppShell>{children}</AppShell>;
}

/** Redirect legacy /admin URLs to district admin */
export function AdminLegacyRedirect() {
  return <Navigate to="/district-admin" replace />;
}
