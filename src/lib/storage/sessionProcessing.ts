import { SessionProcessingState } from "@/types/session-extraction";
import { idbDelete, idbGet, idbPut, STORES } from "./index";

const PREFIX = "proc_";

export async function loadSessionProcessing(sessionId: string): Promise<SessionProcessingState | null> {
  return idbGet<SessionProcessingState>(STORES.session_offline_queue, `${PREFIX}${sessionId}`);
}

export async function saveSessionProcessing(state: SessionProcessingState): Promise<void> {
  await idbPut(STORES.session_offline_queue, `${PREFIX}${state.sessionId}`, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearSessionProcessing(sessionId: string): Promise<void> {
  await idbDelete(STORES.session_offline_queue, `${PREFIX}${sessionId}`);
}
