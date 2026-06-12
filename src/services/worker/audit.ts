import { AuditMeta } from "@/types/worker-flow";

export function createAudit(offline: boolean, partial?: Partial<AuditMeta>): AuditMeta {
  const now = new Date().toISOString();
  return {
    createdAt: partial?.createdAt ?? now,
    updatedAt: now,
    offline,
    synced: partial?.synced ?? !offline,
    verified: partial?.verified ?? false,
  };
}

export function touchAudit(audit: AuditMeta, updates: Partial<AuditMeta>): AuditMeta {
  return { ...audit, ...updates, updatedAt: new Date().toISOString() };
}
