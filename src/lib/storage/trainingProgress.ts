import { TrainingProgressBundle } from "@/types/training-course";
import { idbGet, idbPut, STORES } from "./db";

const KEY = "all";

export async function loadTrainingProgress(): Promise<TrainingProgressBundle | null> {
  try {
    return await idbGet<TrainingProgressBundle>(STORES.training_course_progress, KEY);
  } catch {
    return null;
  }
}

export async function saveTrainingProgress(bundle: TrainingProgressBundle): Promise<void> {
  try {
    await idbPut(STORES.training_course_progress, KEY, bundle);
  } catch (e) {
    console.warn("Could not save training progress to IndexedDB", e);
  }
}

export function progressKey(workerId: string, moduleId: string): string {
  return `${workerId}::${moduleId}`;
}
