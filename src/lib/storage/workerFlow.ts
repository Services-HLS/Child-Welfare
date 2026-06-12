import { WorkerDayBundle } from "@/types/worker-flow";
import { idbGet, idbPut, STORES } from "./index";

const KEY_PREFIX = "day_";

export async function loadWorkerDayBundle(workerId: string, date: string): Promise<WorkerDayBundle | null> {
  return idbGet<WorkerDayBundle>(STORES.worker_progress, `${KEY_PREFIX}${workerId}_${date}`);
}

export async function saveWorkerDayBundle(bundle: WorkerDayBundle): Promise<void> {
  await idbPut(STORES.worker_progress, `${KEY_PREFIX}${bundle.workerId}_${bundle.date}`, bundle);
}

export async function loadWorkerAttendanceHistory(workerId: string): Promise<WorkerDayBundle["attendance"][]> {
  const all = await idbGet<WorkerDayBundle[]>(STORES.worker_progress, `history_${workerId}`);
  if (!all) return [];
  return all.map((b) => b.attendance).filter(Boolean) as NonNullable<WorkerDayBundle["attendance"]>[];
}

export async function appendAttendanceHistory(workerId: string, record: NonNullable<WorkerDayBundle["attendance"]>): Promise<void> {
  const key = `history_${workerId}`;
  const existing = (await idbGet<NonNullable<WorkerDayBundle["attendance"]>[]>(STORES.worker_progress, key)) ?? [];
  const next = [record, ...existing.filter((r) => r.date !== record.date)].slice(0, 90);
  await idbPut(STORES.worker_progress, key, next);
}
