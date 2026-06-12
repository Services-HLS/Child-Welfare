const DB_NAME = "AnganSakti360_DB";
/** Bump when adding object stores so existing browsers run onupgradeneeded. */
const DB_VERSION = 8;

export const STORES = {
  activities: "activities",
  feedback: "feedback",
  complaints: "complaints",
  notifications: "notifications",
  auditLogs: "audit_logs",
  session_recordings: "session_recordings",
  session_scores: "session_scores",
  training_recommendations: "training_recommendations",
  omnichannel_inputs: "omnichannel_inputs",
  escalations: "escalations",
  service_quality_scores: "service_quality_scores",
  coaching_assignments: "coaching_assignments",
  worker_progress: "worker_progress",
  session_offline_queue: "session_offline_queue",
  child_progress: "child_progress",
  surveys: "surveys",
  interventions: "interventions",
  training_course_progress: "training_course_progress",
  omnichannel_drafts: "omnichannel_drafts",
  citizen_experiences: "citizen_experiences",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

function createMissingStores(db: IDBDatabase): void {
  Object.values(STORES).forEach((name) => {
    if (!db.objectStoreNames.contains(name)) {
      db.createObjectStore(name);
    }
  });
}

export function openPlatformDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createMissingStores(db);
    };
    request.onsuccess = () => {
      const db = request.result;
      const missing = Object.values(STORES).filter((name) => !db.objectStoreNames.contains(name));
      if (missing.length > 0) {
        db.close();
        reject(new Error(`IDB missing stores: ${missing.join(", ")} — refresh after upgrade`));
        return;
      }
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn("IndexedDB upgrade blocked — close other tabs using AnganSakti");
    };
  });
}

export async function idbGet<T>(store: StoreName, key: string): Promise<T | null> {
  try {
    const db = await openPlatformDB();
    return new Promise((resolve) => {
      let tx: IDBTransaction;
      try {
        tx = db.transaction(store, "readonly");
      } catch {
        resolve(null);
        return;
      }
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
      tx.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbPut<T>(store: StoreName, key: string, value: T): Promise<void> {
  try {
    const db = await openPlatformDB();
    return new Promise((resolve, reject) => {
      let tx: IDBTransaction;
      try {
        tx = db.transaction(store, "readwrite");
      } catch (err) {
        reject(err);
        return;
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(store).put(value, key);
    });
  } catch (err) {
    console.warn("idbPut failed", store, err);
  }
}

export async function idbDelete(store: StoreName, key: string): Promise<void> {
  const db = await openPlatformDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(store).delete(key);
  });
}

/** Legacy AWAI_DB activities migration */
const LEGACY_DB = "AWAI_DB";
export async function migrateLegacyActivities(): Promise<import("@/data/mockData").ActivityLog[] | null> {
  try {
    return new Promise((resolve) => {
      const req = indexedDB.open(LEGACY_DB, 1);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("activities")) return resolve(null);
        const tx = db.transaction("activities", "readonly");
        const get = tx.objectStore("activities").get("current_ledger");
        get.onsuccess = () => resolve(get.result ?? null);
        get.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
