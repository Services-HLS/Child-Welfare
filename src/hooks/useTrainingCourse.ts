import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useTrainingProgress } from "@/context/worker/TrainingProgressContext";
import { buildTrainingCourseContent } from "@/data/trainingCourseContent";
import { CourseSectionId, TrainingCourseProgress } from "@/types/training-course";

export function useTrainingCourse(moduleId: string, recommendationId?: string | null) {
  const { sessions, trainingRecommendations } = useApp();
  const { getProgress, ensureProgress, saveProgress, completeSection, loaded, sectionProgressPercent } =
    useTrainingProgress();

  const rec =
    trainingRecommendations.find((r) => r.id === recommendationId) ??
    trainingRecommendations.find(
      (r) => r.moduleIds.includes(moduleId) && r.status !== "completed" && r.status !== "improved"
    );

  const session = sessions.find((s) => s.id === rec?.sessionId);
  const content = buildTrainingCourseContent(moduleId, {
    session,
    reason: rec?.reason,
    assignedBy: rec?.assignedBy,
  });

  const [progress, setProgress] = useState<TrainingCourseProgress | null>(null);
  const [section, setSection] = useState<CourseSectionId>("overview");

  useEffect(() => {
    if (!loaded || !moduleId) return;
    let p = getProgress(moduleId) ?? ensureProgress(moduleId, rec);
    if (p.lifecycleStatus === "assigned") {
      p = {
        ...p,
        lifecycleStatus: "in_progress",
        recommendationId: p.recommendationId ?? rec?.id,
        updatedAt: new Date().toISOString(),
      };
      void saveProgress(p, true).then(setProgress);
    } else {
      setProgress(p);
    }
    setSection(p.currentSection);
  }, [loaded, moduleId, rec?.id]);

  const update = useCallback(
    async (patch: Partial<TrainingCourseProgress>) => {
      if (!progress) return;
      const next = { ...progress, ...patch, updatedAt: new Date().toISOString() };
      await saveProgress(next);
      setProgress(next);
    },
    [progress, saveProgress]
  );

  const goToSection = useCallback(
    async (nextSection: CourseSectionId, markCurrent?: CourseSectionId) => {
      if (!progress) return;
      let p = { ...progress, currentSection: nextSection };
      if (markCurrent && !p.completedSections.includes(markCurrent)) {
        p = await completeSection(p, markCurrent);
      } else {
        await saveProgress(p);
      }
      setProgress(p);
      setSection(nextSection);
    },
    [progress, completeSection, saveProgress]
  );

  const finishCourse = useCallback(async () => {
    if (!progress) return;
    const withOutcome = {
      ...progress,
      outcome: {
        engagementBefore: content.context.engagementBefore ?? 68,
        engagementAfter: content.context.engagementAfter ?? 82,
        improvementPercent:
          (content.context.engagementAfter ?? 82) - (content.context.engagementBefore ?? 68),
        supervisorAcknowledged: false,
        certificateIssuedAt: new Date().toISOString(),
      },
    };
    const next = await completeSection(withOutcome, "result");
    setProgress(next);
  }, [progress, completeSection, content]);

  const percent = progress ? sectionProgressPercent(progress.completedSections) : 0;

  return {
    content,
    progress,
    section,
    setSection,
    recommendation: rec,
    session,
    percent,
    update,
    goToSection,
    finishCourse,
    loaded,
  };
}
