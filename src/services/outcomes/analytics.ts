import { CenterOutcomeSummary, ChildProgressRecord } from "@/types/intelligence";
import { Center } from "@/data/mockData";

export function summarizeCenterOutcomes(center: Center, records: ChildProgressRecord[]): CenterOutcomeSummary {
  const centerRecs = records.filter((r) => r.centerId === center.id);
  const children = new Set(centerRecs.map((r) => r.childId));
  const attended = centerRecs.filter((r) => r.attended).length;
  const total = centerRecs.length || 1;
  const nutrition = centerRecs.filter((r) => r.nutritionCompleted).length;
  const avgPart = centerRecs.reduce((a, r) => a + r.preschoolParticipation, 0) / total;
  const recent = centerRecs.filter((r) => new Date(r.date) > new Date(Date.now() - 14 * 86400_000));
  const recentPart = recent.length ? recent.reduce((a, r) => a + r.preschoolParticipation, 0) / recent.length : avgPart;
  const trend = recentPart > avgPart + 0.05 ? "improving" : recentPart < avgPart - 0.05 ? "declining" : "stable";

  return {
    centerId: center.id,
    centerName: center.name,
    childrenTracked: children.size || center.children,
    attendanceRate: Math.round((attended / total) * 100),
    nutritionCompletionRate: Math.round((nutrition / total) * 100),
    avgParticipation: Math.round(avgPart * 100),
    outcomeTrend: trend,
    developmentScore: Math.round((avgPart * 0.5 + (attended / total) * 0.5) * 100),
  };
}
