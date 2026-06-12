import { SessionRecording } from "@/types/session";
import { ClassroomSessionAnalytics, ExecutiveClassroomSnapshot, OperationalClassroomSnapshot } from "@/types/classroom-intelligence";
import { mockCenters } from "@/data/mockData";
import { ComplaintRecord, FeedbackEntry } from "@/types/platform";
import { CoachingAssignment } from "@/types/session";

function avg(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}

export function buildOperationalSnapshot(
  analytics: ClassroomSessionAnalytics[],
  districtFilter?: string
): OperationalClassroomSnapshot {
  const list = districtFilter ? analytics.filter((a) => a.district === districtFilter) : analytics;
  const bandDistribution = { green: 0, orange: 0, red: 0 };
  list.forEach((a) => bandDistribution[a.band]++);
  const centerMap = new Map<string, { name: string; opis: number[] }>();
  list.forEach((a) => {
    const cur = centerMap.get(a.centerId) ?? { name: a.centerName, opis: [] };
    cur.opis.push(a.indices.opi);
    centerMap.set(a.centerId, cur);
  });
  const centerRankings = [...centerMap.entries()]
    .map(([centerId, v]) => ({
      centerId,
      centerName: v.name,
      avgOpi: avg(v.opis),
      sessions: v.opis.length,
    }))
    .sort((a, b) => b.avgOpi - a.avgOpi);

  const workerMap = new Map<string, { name: string; opis: number[] }>();
  list.forEach((a) => {
    const cur = workerMap.get(a.workerId) ?? { name: a.workerName, opis: [] };
    cur.opis.push(a.indices.opi);
    workerMap.set(a.workerId, cur);
  });
  const workerTrends = [...workerMap.entries()].map(([workerId, v]) => {
    const latest = v.opis[0] ?? 0;
    const older = v.opis[v.opis.length - 1] ?? latest;
    const trend = latest > older + 5 ? "up" : latest < older - 5 ? "down" : "stable";
    return { workerId, workerName: v.name, trend, latestOpi: latest };
  });

  const issueSet = new Set<string>();
  list.forEach((a) => a.repeatedIssueTags.forEach((t) => issueSet.add(t)));

  return {
    totalSessions: list.length,
    bandDistribution,
    avgOpi: avg(list.map((a) => a.indices.opi)),
    avgEngagement: avg(list.map((a) => a.indices.cei)),
    syllabusAdherence: avg(list.map((a) => a.indices.sai)),
    flaggedCount: list.filter((a) => a.flagged).length,
    coachingQueue: list.filter((a) => a.coachingRecommended).length,
    repeatedIssues: [...issueSet],
    centerRankings,
    workerTrends,
  };
}

export function buildExecutiveSnapshot(
  analytics: ClassroomSessionAnalytics[],
  sessions: SessionRecording[],
  complaints: ComplaintRecord[],
  coaching: CoachingAssignment[],
  feedback: FeedbackEntry[]
): ExecutiveClassroomSnapshot {
  const districts = [...new Set(mockCenters.map((c) => c.district))];
  const districtComparison = districts.map((district) => {
    const dAnalytics = analytics.filter((a) => a.district === district);
    const avgOpi = avg(dAnalytics.map((a) => a.indices.opi));
    const band =
      avgOpi >= 75 ? "green" : avgOpi >= 55 ? "orange" : "red";
    return {
      district,
      avgOpi,
      sessions: dAnalytics.length,
      band: band as "green" | "orange" | "red",
    };
  });

  const closedAfterCoaching = coaching.filter((c) => c.status === "completed").length;
  const openGrievances = complaints.filter((c) => c.status !== "closed").length;
  const positiveFb = feedback.filter((f) => f.rating >= 4).length;

  return {
    totalSessionsRecorded: sessions.filter((s) => s.scorecard).length,
    stateAvgOpi: avg(analytics.map((a) => a.indices.opi)),
    districtComparison: districtComparison.sort((a, b) => b.avgOpi - a.avgOpi),
    engagementTrend: analytics.slice(0, 8).map((a) => a.indices.cei).reverse(),
    trainingImpactPct: Math.min(100, 40 + closedAfterCoaching * 12),
    grievanceCorrelation:
      openGrievances > 3
        ? "Elevated open grievances correlate with orange/red classroom bands in pilot centers"
        : "Grievance volume stable relative to classroom quality",
    interventionEffectivenessPct: Math.min(100, 55 + closedAfterCoaching * 10 + positiveFb * 2),
    districtsNeedingAttention: districtComparison.filter((d) => d.avgOpi < 60).map((d) => d.district),
    districtsImproving: districtComparison.filter((d) => d.avgOpi >= 72).map((d) => d.district),
  };
}
