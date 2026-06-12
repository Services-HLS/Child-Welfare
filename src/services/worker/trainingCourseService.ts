import {
  COURSE_SECTION_ORDER,
  CourseSectionId,
  TrainingCourseProgress,
  TrainingLifecycleStatus,
  TrainingProgressBundle,
} from "@/types/training-course";
import { TrainingRecommendation } from "@/types/session";
import { progressKey } from "@/lib/storage/trainingProgress";

export const MIN_QUIZ_SCORE = 70;

export function emptyProgress(
  workerId: string,
  moduleId: string,
  opts?: {
    recommendationId?: string;
    coachingAssignmentId?: string;
    assignedBy?: "ai" | "supervisor";
    dueAt?: string;
    band?: TrainingRecommendation["band"];
  }
): TrainingCourseProgress {
  const now = new Date().toISOString();
  return {
    id: progressKey(workerId, moduleId),
    workerId,
    moduleId,
    recommendationId: opts?.recommendationId,
    coachingAssignmentId: opts?.coachingAssignmentId,
    assignedBy: opts?.assignedBy ?? "ai",
    lifecycleStatus: "assigned",
    currentSection: "overview",
    completedSections: [],
    watch: { completedVideoIds: [], playbackSpeed: 1, notes: "", bookmarks: [] },
    practice: { completedTaskIds: [], notes: "", attempts: 0 },
    startedAt: now,
    updatedAt: now,
    dueAt: opts?.dueAt,
    band: opts?.band,
  };
}

export function sectionProgressPercent(completed: CourseSectionId[]): number {
  const total = COURSE_SECTION_ORDER.length;
  const done = COURSE_SECTION_ORDER.filter((s) => completed.includes(s)).length;
  return Math.round((done / total) * 100);
}

export function canAccessSection(
  section: CourseSectionId,
  completed: CourseSectionId[]
): boolean {
  const idx = COURSE_SECTION_ORDER.indexOf(section);
  if (idx <= 0) return true;
  const prev = COURSE_SECTION_ORDER[idx - 1];
  return completed.includes(prev);
}

export function nextSectionAfter(section: CourseSectionId): CourseSectionId | null {
  const idx = COURSE_SECTION_ORDER.indexOf(section);
  if (idx < 0 || idx >= COURSE_SECTION_ORDER.length - 1) return null;
  return COURSE_SECTION_ORDER[idx + 1];
}

export function markSectionComplete(
  progress: TrainingCourseProgress,
  section: CourseSectionId
): TrainingCourseProgress {
  const completed = progress.completedSections.includes(section)
    ? progress.completedSections
    : [...progress.completedSections, section];
  const next = nextSectionAfter(section) ?? section;
  let lifecycle: TrainingLifecycleStatus = progress.lifecycleStatus;
  if (lifecycle === "assigned") lifecycle = "in_progress";
  if (section === "practice" && !completed.includes("submit")) lifecycle = "awaiting_practice";
  if (section === "submit") lifecycle = "submitted";
  if (section === "result") lifecycle = "completed";

  return {
    ...progress,
    completedSections: completed,
    currentSection: progress.currentSection === section ? next : progress.currentSection,
    lifecycleStatus: lifecycle,
    updatedAt: new Date().toISOString(),
  };
}

export function recStatusFromLifecycle(
  lifecycle: TrainingLifecycleStatus
): TrainingRecommendation["status"] {
  switch (lifecycle) {
    case "assigned":
      return "pending";
    case "in_progress":
    case "awaiting_practice":
      return "in_progress";
    case "submitted":
      return "submitted";
    case "completed":
      return "completed";
    case "improved":
      return "improved";
    default:
      return "pending";
  }
}

export function getProgressFromBundle(
  bundle: TrainingProgressBundle,
  workerId: string,
  moduleId: string
): TrainingCourseProgress | null {
  return bundle[progressKey(workerId, moduleId)] ?? null;
}

export function mergeProgress(
  bundle: TrainingProgressBundle,
  progress: TrainingCourseProgress
): TrainingProgressBundle {
  return { ...bundle, [progress.id]: progress };
}

export function timelineSteps(progress: TrainingCourseProgress | null) {
  const status = progress?.lifecycleStatus ?? "assigned";
  const step = (label: string, key: TrainingLifecycleStatus | TrainingLifecycleStatus[]) => ({
    label,
    done: Array.isArray(key) ? key.includes(status) : status === key || isPastStatus(status, key),
  });
  return [
    step("Training Assigned", "assigned"),
    step("Started", ["in_progress", "awaiting_practice", "submitted", "completed", "improved"]),
    step("Practice Submitted", ["awaiting_practice", "submitted", "completed", "improved"]),
    step("Completed", ["completed", "improved"]),
    step("Improvement Verified", "improved"),
  ];
}

function isPastStatus(current: TrainingLifecycleStatus, target: TrainingLifecycleStatus): boolean {
  const order: TrainingLifecycleStatus[] = [
    "assigned",
    "in_progress",
    "awaiting_practice",
    "submitted",
    "completed",
    "improved",
  ];
  return order.indexOf(current) >= order.indexOf(target);
}
