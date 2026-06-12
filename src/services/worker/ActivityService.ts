import { ActivityLog } from "@/data/mockData";
import { ServiceCategory } from "@/types/worker-flow";
import { createAudit } from "./audit";

export const SERVICE_CATEGORY_MAP: Record<string, ServiceCategory> = {
  "Preschool Activities": "Preschool",
  "Nutrition Distribution": "Nutrition",
  "Health Activities": "Health",
  "Home Visits": "Visits",
  "Community Outreach": "Outreach",
  "Infrastructure Updates": "Infrastructure",
};

export function mapActivityType(type: string): ServiceCategory {
  return SERVICE_CATEGORY_MAP[type] ?? "Preschool";
}

export function activityRequiresEvidence(type: string): boolean {
  return type !== "Infrastructure Updates";
}

export function isDuplicateActivity(activities: ActivityLog[], centerId: string, type: string, windowMs = 120_000): boolean {
  const cut = Date.now() - windowMs;
  return activities.some(
    (a) => a.centerId === centerId && a.type === type && new Date(a.timestamp).getTime() >= cut
  );
}

export function buildActivityLog(input: {
  centerId: string;
  centerName: string;
  worker: string;
  type: string;
  description: string;
  childrenPresent: number;
  lat: number;
  lng: number;
  offline: boolean;
  imageUrl?: string;
}): ActivityLog {
  const now = new Date().toISOString();
  return {
    id: `ACT-${Date.now()}`,
    centerId: input.centerId,
    centerName: input.centerName,
    worker: input.worker,
    type: input.type,
    description: input.description,
    childrenPresent: input.childrenPresent,
    timestamp: now,
    lat: input.lat,
    lng: input.lng,
    imageUrl: input.imageUrl,
    status: input.imageUrl ? "submitted" : "pending",
    aiConfidence: 0,
    synced: !input.offline,
    isLiveCapture: true,
    capturedLocation: { lat: input.lat, lng: input.lng },
  };
}

export function activityAuditFields(offline: boolean) {
  return createAudit(offline);
}
