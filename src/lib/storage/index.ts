import { ActivityLog } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry, PlatformNotification } from "@/types/platform";
import { idbGet, idbPut, migrateLegacyActivities, STORES } from "./db";

export { idbGet, idbPut, idbDelete, STORES } from "./db";

const LS_PREFIX = "angansakti.";

export const storageKeys = {
  user: `${LS_PREFIX}user`,
  lang: `${LS_PREFIX}lang`,
  attendance: `${LS_PREFIX}attendance`,
  integrations: `${LS_PREFIX}integrations`,
  surveys: `${LS_PREFIX}surveys`,
  dashboards: `${LS_PREFIX}dashboards`,
} as const;

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage quota", key, e);
  }
}

export async function loadActivities(): Promise<ActivityLog[] | null> {
  const fromNew = await idbGet<ActivityLog[]>(STORES.activities, "ledger");
  if (fromNew) return fromNew;
  return migrateLegacyActivities();
}

export async function saveActivities(activities: ActivityLog[]): Promise<void> {
  await idbPut(STORES.activities, "ledger", activities);
}

export async function loadFeedback(): Promise<FeedbackEntry[] | null> {
  return idbGet(STORES.feedback, "all");
}

export async function saveFeedback(feedback: FeedbackEntry[]): Promise<void> {
  await idbPut(STORES.feedback, "all", feedback);
}

export async function loadCitizenExperiences(): Promise<import("@/types/citizen-experience").CitizenExperienceRecord[] | null> {
  return idbGet(STORES.citizen_experiences, "all");
}

export async function saveCitizenExperiences(
  experiences: import("@/types/citizen-experience").CitizenExperienceRecord[]
): Promise<void> {
  await idbPut(STORES.citizen_experiences, "all", experiences);
}

export async function loadComplaints(): Promise<ComplaintRecord[] | null> {
  return idbGet(STORES.complaints, "all");
}

export async function saveComplaints(complaints: ComplaintRecord[]): Promise<void> {
  await idbPut(STORES.complaints, "all", complaints);
}

export async function loadNotifications(): Promise<PlatformNotification[] | null> {
  return idbGet(STORES.notifications, "all");
}

export async function saveNotifications(notifications: PlatformNotification[]): Promise<void> {
  await idbPut(STORES.notifications, "all", notifications);
}

export async function loadSessions(): Promise<import("@/types/session").SessionRecording[] | null> {
  return idbGet(STORES.session_recordings, "all");
}
export async function saveSessions(sessions: import("@/types/session").SessionRecording[]): Promise<void> {
  const sanitized = sessions.map((s) => {
    const { videoBlobUrl, ...rest } = s;
    return {
      ...rest,
      hasLocalVideo: s.hasLocalVideo ?? Boolean(videoBlobUrl),
    };
  });
  await idbPut(STORES.session_recordings, "all", sanitized);
}

export async function loadClassroomIntel(): Promise<import("@/types/classroom-intelligence").ClassroomIntelBundle | null> {
  return idbGet(STORES.session_scores, "classroom_intel");
}

export async function saveClassroomIntel(bundle: import("@/types/classroom-intelligence").ClassroomIntelBundle): Promise<void> {
  await idbPut(STORES.session_scores, "classroom_intel", bundle);
}
export async function loadCoaching(): Promise<import("@/types/session").CoachingAssignment[] | null> {
  return idbGet(STORES.coaching_assignments, "all");
}
export async function saveCoaching(items: import("@/types/session").CoachingAssignment[]): Promise<void> {
  await idbPut(STORES.coaching_assignments, "all", items);
}
export async function loadTrainingRecs(): Promise<import("@/types/session").TrainingRecommendation[] | null> {
  return idbGet(STORES.training_recommendations, "all");
}
export async function saveTrainingRecs(items: import("@/types/session").TrainingRecommendation[]): Promise<void> {
  await idbPut(STORES.training_recommendations, "all", items);
}
export async function loadOmnichannel(): Promise<import("@/types/feedback-channels").OmnichannelInput[] | null> {
  return idbGet(STORES.omnichannel_inputs, "all");
}
export async function saveOmnichannel(items: import("@/types/feedback-channels").OmnichannelInput[]): Promise<void> {
  await idbPut(STORES.omnichannel_inputs, "all", items);
}
export async function loadServiceQuality(): Promise<import("@/types/platform").ServiceQualityScore[] | null> {
  return idbGet(STORES.service_quality_scores, "all");
}
export async function saveServiceQuality(items: import("@/types/platform").ServiceQualityScore[]): Promise<void> {
  await idbPut(STORES.service_quality_scores, "all", items);
}
