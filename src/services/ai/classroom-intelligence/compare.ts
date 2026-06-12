import { ClassroomSessionAnalytics, SessionComparisonResult } from "@/types/classroom-intelligence";

export function compareClassroomSessions(
  before: ClassroomSessionAnalytics,
  after: ClassroomSessionAnalytics,
  labelBefore = "Before coaching",
  labelAfter = "After coaching"
): SessionComparisonResult {
  const opiDelta = after.indices.opi - before.indices.opi;
  const ceiDelta = after.indices.cei - before.indices.cei;
  const improved = opiDelta > 0 || ceiDelta > 0;
  const narrative = improved
    ? `${labelAfter} shows improvement: OPI ${opiDelta >= 0 ? "+" : ""}${opiDelta}%, engagement ${ceiDelta >= 0 ? "+" : ""}${ceiDelta}%. Coaching pathway is supporting measurable development.`
    : `Comparison between ${labelBefore} and ${labelAfter}: continue supportive coaching — development takes multiple sessions.`;
  return { before, after, opiDelta, ceiDelta, narrative, improved };
}
