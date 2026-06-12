import { WorkerAttendanceRecord } from "@/types/worker-flow";
import { createAudit, touchAudit } from "./audit";

export function createCheckIn(
  workerId: string,
  centerId: string,
  lat: number,
  lng: number,
  offline: boolean
): WorkerAttendanceRecord {
  const now = new Date().toISOString();
  return {
    id: `att-${Date.now()}`,
    date: now.slice(0, 10),
    workerId,
    centerId,
    checkIn: now,
    lat,
    lng,
    audit: createAudit(offline),
  };
}

export function applyCheckOut(
  record: WorkerAttendanceRecord,
  lat: number,
  lng: number,
  offline: boolean
): WorkerAttendanceRecord {
  const now = new Date().toISOString();
  return {
    ...record,
    checkOut: now,
    lat,
    lng,
    audit: touchAudit(record.audit, { offline, synced: !offline }),
  };
}

/** Legacy localStorage migration */
const LEGACY_KEY = "awai.attendance";

export function loadLegacyAttendance(): { date: string; checkIn?: string; checkOut?: string; lat: number; lng: number; synced: boolean }[] {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLegacyAttendance(records: ReturnType<typeof loadLegacyAttendance>): void {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(records));
}

export function legacyToWorkerRecord(
  r: ReturnType<typeof loadLegacyAttendance>[0],
  workerId: string,
  centerId: string
): WorkerAttendanceRecord {
  return {
    id: `att-legacy-${r.date}`,
    date: r.date,
    workerId,
    centerId,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    lat: r.lat,
    lng: r.lng,
    audit: createAudit(!r.synced, { synced: r.synced }),
  };
}
