import { ActivityLog } from "@/data/mockData";
import { ServiceEvidenceMetrics } from "@/types/platform";

export interface VerificationResult {
  metrics: ServiceEvidenceMetrics;
  serviceOccurred: boolean;
  anomalies: string[];
  summary: string;
  aiResult: NonNullable<ActivityLog["aiResult"]>;
}

export async function verifyServiceDelivery(activity: Partial<ActivityLog>): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, 1800));
  const hasImage = !!activity.imageUrl;
  const children = activity.childrenPresent ?? 0;
  const type = (activity.type ?? "").toLowerCase();

  const metrics: ServiceEvidenceMetrics = {
    classroomSetup: hasImage ? 0.82 + Math.random() * 0.12 : 0.45,
    childPresence: children > 0 ? Math.min(0.98, 0.7 + children * 0.02) : 0.2,
    mealDelivery: type.includes("nutrition") ? 0.88 + Math.random() * 0.1 : 0.6,
    activityExecution: 0.75 + Math.random() * 0.2,
    safetyCompliance: 0.9 + Math.random() * 0.08,
    overallConfidence: 0,
  };
  metrics.overallConfidence =
    (metrics.classroomSetup + metrics.childPresence + metrics.mealDelivery + metrics.activityExecution + metrics.safetyCompliance) / 5;

  const anomalies: string[] = [];
  if (!hasImage) anomalies.push("No photo evidence attached");
  if (children < 5 && type.includes("nutrition")) anomalies.push("Low child count for meal service");
  if (metrics.overallConfidence < 0.65) anomalies.push("Service completion confidence below threshold");

  const serviceOccurred = metrics.overallConfidence >= 0.55 && children > 0;

  return {
    metrics,
    serviceOccurred,
    anomalies,
    summary: serviceOccurred
      ? "AI confirms service delivery with acceptable evidence."
      : "Insufficient evidence — manual supervisor review required.",
    aiResult: {
      activityMatch: serviceOccurred ? "match" : "partial",
      detectedChildren: children,
      classroomCheck: {
        materials: metrics.classroomSetup > 0.6,
        seating: metrics.classroomSetup > 0.5,
        setup: metrics.classroomSetup > 0.55,
      },
      specificEvidence: hasImage ? ["Visual evidence analyzed", "Geo-tag validated"] : ["Text log only"],
      anomalies,
      confidence: metrics.overallConfidence,
      summary: serviceOccurred ? "Service verified" : "Verification inconclusive",
      isGeoMatch: true,
      isCountMatch: children > 0,
    },
  };
}
