import { PerformanceBand, SyllabusCategory } from "@/types/session";
import { TRAINING_MODULES } from "@/data/mockSessions";

export function generateTrainingRecommendations(ctx: {
  band: PerformanceBand;
  gaps: string[];
  syllabusCategory: SyllabusCategory;
}): string[] {
  const ids: string[] = [];
  if (ctx.gaps.some((g) => g.includes("engagement"))) ids.push("TM-ENG-01", "TM-PLAY-02", "TM-STORY-01");
  if (ctx.syllabusCategory === "language") ids.push("TM-STORY-01", "TM-LANG-02");
  if (ctx.gaps.some((g) => g.includes("clarity") || g.includes("verbal"))) ids.push("TM-SPEECH-01");
  if (ctx.syllabusCategory === "numeracy") ids.push("TM-NUM-01");
  if (ctx.syllabusCategory === "language") ids.push("TM-LANG-02");
  if (ctx.band === "orange") ids.push("TM-COACH-03");
  if (ctx.band === "red") ids.push("TM-MENTOR-01", "TM-CLASSROOM-04");
  if (ids.length === 0) ids.push("TM-BEST-01");
  return [...new Set(ids)].slice(0, 4);
}

export function getModulesByIds(ids: string[]) {
  return TRAINING_MODULES.filter((m) => ids.includes(m.id));
}
