import { getCenterLocation } from "@/data/centerLocations";
import { haversineMeters } from "@/lib/geo/haversine";
import { USE_DEMO_CLASSROOM_ANALYSIS } from "@/lib/featureFlags";

/**
 * Hackathon demo: snap session GPS near assigned center so verification shows
 * "Location Matched" (~28 m) instead of the worker's physical device location.
 */
export function resolveSessionGps(
  centerId: string,
  centerName: string | undefined,
  deviceGps: { lat: number; lng: number } | null | undefined,
  options?: { forceDemo?: boolean }
): { lat: number; lng: number; demoSnapped: boolean } {
  const center = getCenterLocation(centerId, centerName);
  const useDemo = options?.forceDemo ?? USE_DEMO_CLASSROOM_ANALYSIS;

  if (!useDemo) {
    const coords = deviceGps ?? { lat: center.lat, lng: center.lng };
    return { ...coords, demoSnapped: false };
  }

  // Fixed offset ~25–35 m from center — stays within 0–100 m "Verified" band
  const snapped = {
    lat: center.lat + 0.00022,
    lng: center.lng + 0.00012,
  };

  const dist = haversineMeters(center.lat, center.lng, snapped.lat, snapped.lng);
  if (dist > 95) {
    return { lat: center.lat + 0.00018, lng: center.lng + 0.0001, demoSnapped: true };
  }

  return { ...snapped, demoSnapped: true };
}
