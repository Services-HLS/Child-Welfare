import type { PerformanceBand } from "@/types/session";

export type CourseSectionId =
  | "overview"
  | "learn"
  | "watch"
  | "practice"
  | "quiz"
  | "submit"
  | "result";

export const COURSE_SECTION_ORDER: CourseSectionId[] = [
  "overview",
  "learn",
  "watch",
  "practice",
  "quiz",
  "submit",
  "result",
];

export type TrainingLifecycleStatus =
  | "assigned"
  | "in_progress"
  | "awaiting_practice"
  | "submitted"
  | "completed"
  | "improved";

export interface TrainingCourseContext {
  issueIdentified: string;
  observationSummary: string;
  expectedImprovement: string;
  learningObjectives: string[];
  relatedSessionId?: string;
  relatedSessionLabel?: string;
  engagementBefore?: number;
  engagementAfter?: number;
}

export interface TrainingLearnBlock {
  id: string;
  title: string;
  body: string;
  examples?: string[];
}

export interface TrainingVideoLesson {
  id: string;
  title: string;
  description: string;
  /** Demo embed — YouTube ID or placeholder */
  embedUrl?: string;
  durationMinutes: number;
  keyTakeaways: string[];
  summary: string;
}

export interface TrainingPracticeTask {
  id: string;
  title: string;
  instructions: string;
  tips: string[];
  evidenceOptional?: boolean;
}

export interface TrainingQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: "multiple_choice" | "scenario" | "classroom_decision";
}

export interface TrainingCourseContent {
  moduleId: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  expectedImpact: string;
  category: string;
  context: TrainingCourseContext;
  learnBlocks: TrainingLearnBlock[];
  videos: TrainingVideoLesson[];
  practiceTasks: TrainingPracticeTask[];
  quiz: TrainingQuizQuestion[];
  submitPrompts: {
    learned: string;
    willChange: string;
    engagementPlan: string;
  };
  nextModuleIds: string[];
  certificateTitle: string;
}

export interface TrainingQuizAttempt {
  answers: Record<string, number>;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface TrainingPracticeState {
  completedTaskIds: string[];
  notes: string;
  evidenceFileName?: string;
  attempts: number;
  lastAttemptAt?: string;
}

export interface TrainingSubmitReflection {
  learned: string;
  willChange: string;
  engagementPlan: string;
  submittedAt: string;
}

export interface TrainingWatchState {
  completedVideoIds: string[];
  playbackSpeed: number;
  notes: string;
  bookmarks: number[];
}

export interface TrainingOutcome {
  engagementBefore: number;
  engagementAfter: number;
  improvementPercent: number;
  supervisorAcknowledged: boolean;
  certificateIssuedAt: string;
}

export interface TrainingCourseProgress {
  id: string;
  workerId: string;
  moduleId: string;
  recommendationId?: string;
  coachingAssignmentId?: string;
  assignedBy: "ai" | "supervisor";
  lifecycleStatus: TrainingLifecycleStatus;
  currentSection: CourseSectionId;
  completedSections: CourseSectionId[];
  watch: TrainingWatchState;
  practice: TrainingPracticeState;
  quiz?: TrainingQuizAttempt;
  submit?: TrainingSubmitReflection;
  outcome?: TrainingOutcome;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  dueAt?: string;
  band?: PerformanceBand;
}

export type TrainingProgressBundle = Record<string, TrainingCourseProgress>;
