import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useApp } from "@/context/AppContext";
import { useWorkerFlow } from "@/context/worker/WorkerFlowContext";
import { loadTrainingProgress, saveTrainingProgress, progressKey } from "@/lib/storage/trainingProgress";
import {
  emptyProgress,
  markSectionComplete,
  mergeProgress,
  recStatusFromLifecycle,
  sectionProgressPercent,
} from "@/services/worker/trainingCourseService";
import {
  CourseSectionId,
  TrainingCourseProgress,
  TrainingProgressBundle,
} from "@/types/training-course";
import { TrainingRecommendation } from "@/types/session";
import { toast } from "sonner";

interface TrainingProgressCtx {
  loaded: boolean;
  getProgress: (moduleId: string) => TrainingCourseProgress | null;
  ensureProgress: (moduleId: string, rec?: TrainingRecommendation) => TrainingCourseProgress;
  saveProgress: (progress: TrainingCourseProgress, syncRec?: boolean) => Promise<TrainingCourseProgress>;
  completeSection: (progress: TrainingCourseProgress, section: CourseSectionId) => Promise<TrainingCourseProgress>;
  sectionProgressPercent: typeof sectionProgressPercent;
  workerId: string;
}

const Ctx = createContext<TrainingProgressCtx | null>(null);

export function TrainingProgressProvider({ children }: { children: ReactNode }) {
  const { user, updateTrainingRecommendation, addNotification } = useApp();
  const { completeTrainingCourse } = useWorkerFlow();
  const workerId = user?.workerId ?? user?.id ?? "W-1042";
  const [bundle, setBundle] = useState<TrainingProgressBundle>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTrainingProgress()
      .then((b) => {
        if (b) setBundle(b);
      })
      .catch((e) => console.warn("Training progress load failed", e))
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback(async (next: TrainingProgressBundle) => {
    setBundle(next);
    await saveTrainingProgress(next);
  }, []);

  const getProgress = useCallback(
    (moduleId: string) => bundle[progressKey(workerId, moduleId)] ?? null,
    [bundle, workerId]
  );

  const ensureProgress = useCallback(
    (moduleId: string, rec?: TrainingRecommendation) => {
      const existing = bundle[progressKey(workerId, moduleId)];
      if (existing) return existing;
      const created = emptyProgress(workerId, moduleId, {
        recommendationId: rec?.id,
        assignedBy: rec?.assignedBy ?? "ai",
        dueAt: rec?.dueAt,
        band: rec?.band,
      });
      const next = mergeProgress(bundle, created);
      void persist(next);
      return created;
    },
    [bundle, persist, workerId]
  );

  const saveProgress = useCallback(
    async (progress: TrainingCourseProgress, syncRec = true) => {
      const next = mergeProgress(bundle, progress);
      setBundle(next);
      await saveTrainingProgress(next);
      if (syncRec && progress.recommendationId) {
        updateTrainingRecommendation(progress.recommendationId, {
          status: recStatusFromLifecycle(progress.lifecycleStatus),
          primaryModuleId: progress.moduleId,
        });
      }
      return progress;
    },
    [bundle, updateTrainingRecommendation]
  );

  const completeSection = useCallback(
    async (progress: TrainingCourseProgress, section: CourseSectionId) => {
      let next = markSectionComplete(progress, section);
      if (section === "result") {
        const before = next.outcome?.engagementBefore ?? 68;
        const after = next.outcome?.engagementAfter ?? 82;
        next = {
          ...next,
          lifecycleStatus: "completed",
          completedAt: new Date().toISOString(),
          outcome: {
            engagementBefore: before,
            engagementAfter: after,
            improvementPercent: after - before,
            supervisorAcknowledged: false,
            certificateIssuedAt: new Date().toISOString(),
          },
        };
        if (next.recommendationId) {
          completeTrainingCourse(next.recommendationId, next.moduleId, next);
          addNotification({
            userId: "S-204",
            role: "supervisor",
            channel: "in_app",
            title: "Worker completed coaching module",
            body: `Module ${next.moduleId} — ready for acknowledgement`,
            actionUrl: "/supervisor/coaching",
          });
        }
      }
      await saveProgress(next);
      return next;
    },
    [saveProgress, completeTrainingCourse, addNotification]
  );

  return (
    <Ctx.Provider
      value={{
        loaded,
        getProgress,
        ensureProgress,
        saveProgress,
        completeSection,
        sectionProgressPercent,
        workerId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTrainingProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTrainingProgress requires TrainingProgressProvider");
  return ctx;
}
