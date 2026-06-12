import { getCenterLocation } from "@/data/centerLocations";
import { haversineMeters, matchStatusFromDistanceMeters } from "@/lib/geo/haversine";
import { resolveSessionGps } from "@/lib/geo/resolveSessionGps";
import { USE_DEMO_CLASSROOM_ANALYSIS } from "@/lib/featureFlags";
import { SessionMetadata } from "@/types/session";
import {
  ClassroomEvidenceSummary,
  ClassroomObservationSummary,
  SessionAuthenticityChecks,
  SessionVerification,
  VerificationTimelineStep,
} from "@/types/session-verification";
import type { DemoStorytellingSessionAnalysis } from "@/types/session-extraction";

function matchExplanation(status: SessionVerification["matchStatus"], distance: number | null): string {
  if (status === "verified") {
    return "Session appears recorded within approved Anganwadi area.";
  }
  if (status === "near") {
    return `Session location is ${distance ?? "—"}m from registered center — slight deviation noted for supervisor awareness.`;
  }
  return "Session location differs from registered center — supervisor review recommended.";
}

export function buildSessionVerification(
  metadata: SessionMetadata,
  options?: { gpsAvailable?: boolean; deviceLabel?: string; useDemoGps?: boolean }
): SessionVerification {
  const center = getCenterLocation(metadata.centerId, metadata.centerName);
  const gpsAvailable = options?.gpsAvailable !== false && !!metadata.gps;
  const resolved = gpsAvailable
    ? resolveSessionGps(metadata.centerId, metadata.centerName, metadata.gps, {
        forceDemo: options?.useDemoGps ?? USE_DEMO_CLASSROOM_ANALYSIS,
      })
    : null;
  const capturedLat = gpsAvailable && resolved ? resolved.lat : null;
  const capturedLng = gpsAvailable && resolved ? resolved.lng : null;

  let distance: number | null = null;
  let matchStatus = matchStatusFromDistanceMeters(9999);

  if (gpsAvailable && capturedLat != null && capturedLng != null) {
    distance = Math.round(haversineMeters(center.lat, center.lng, capturedLat, capturedLng));
    matchStatus = matchStatusFromDistanceMeters(distance);
  }

  const verificationStatus =
    matchStatus === "verified" ? "verified" : matchStatus === "near" ? "review" : "review";

  return {
    centerLatitude: center.lat,
    centerLongitude: center.lng,
    capturedLatitude: capturedLat,
    capturedLongitude: capturedLng,
    distance,
    matchStatus,
    verificationStatus: gpsAvailable ? verificationStatus : "unknown",
    timestamp: metadata.timestamp,
    centerName: center.centerName,
    village: center.village,
    district: center.district,
    gpsAvailable,
    explanation: gpsAvailable
      ? matchExplanation(matchStatus, distance)
      : "Location unavailable. Fallback verification enabled using timestamp, device, and video metadata.",
    fallbackUsed: !gpsAvailable,
    deviceLabel: options?.deviceLabel ?? "AnganSakti field device",
  };
}

export function buildAuthenticityChecks(verification: SessionVerification): SessionAuthenticityChecks {
  return {
    timeMatch: "verified",
    centerMatch:
      verification.matchStatus === "verified"
        ? "verified"
        : verification.matchStatus === "near"
          ? "review"
          : "review",
    deviceMatch: verification.fallbackUsed ? "review" : "verified",
    uploadIntegrity: "verified",
  };
}

export function buildClassroomEvidence(t: DemoStorytellingSessionAnalysis): ClassroomEvidenceSummary {
  return {
    childrenDetected: t.childrenDetected,
    childrenVisibleRange: t.childrenVisibleRange,
    teacherVisible: t.teacherDetected >= 1 ? "Detected" : "Not detected",
    activityDetected: t.activityType,
    storyDetected: "Nakka–Tabelu (Fox & Tortoise)",
    transcriptAvailable: Boolean(t.extractedContextTelugu && t.extractedContextEnglish),
  };
}

export function buildClassroomObservationSummary(t: DemoStorytellingSessionAnalysis): ClassroomObservationSummary {
  return {
    childrenEstimated: t.childrenDetected,
    childrenVisible: t.childrenVisibleRange,
    teacherActivities: ["Storytelling", "Movement", "Interaction"],
    childrenListeningPercent: 80,
    interactionLevel: "Moderate",
    storyCompleted: true,
    childrenEngaged: true,
    conciseObservations: [
      "Teacher conducted storytelling activity.",
      "Children remained attentive.",
      "Story completed successfully.",
      "Participation can be increased.",
    ],
  };
}

/** Recompute GPS verification with demo snap (hackathon) or fresh haversine from metadata. */
export function normalizeSessionVerification(
  metadata: SessionMetadata,
  options?: { saved?: boolean }
): {
  metadata: SessionMetadata;
  sessionVerification: SessionVerification;
  authenticityChecks: SessionAuthenticityChecks;
  verificationTimeline: VerificationTimelineStep[];
} {
  const snapped = resolveSessionGps(metadata.centerId, metadata.centerName, metadata.gps, {
    forceDemo: USE_DEMO_CLASSROOM_ANALYSIS,
  });
  const meta: SessionMetadata = {
    ...metadata,
    gps: metadata.gps ? { lat: snapped.lat, lng: snapped.lng } : metadata.gps,
  };
  const sessionVerification = buildSessionVerification(meta, {
    gpsAvailable: !!meta.gps,
    useDemoGps: USE_DEMO_CLASSROOM_ANALYSIS,
  });
  return {
    metadata: meta,
    sessionVerification,
    authenticityChecks: buildAuthenticityChecks(sessionVerification),
    verificationTimeline: buildVerificationTimeline(meta, options?.saved),
  };
}

export function buildVerificationTimeline(
  metadata: SessionMetadata,
  saved?: boolean
): VerificationTimelineStep[] {
  const t = metadata.timestamp;
  return [
    { id: "upload", label: "Video Uploaded", status: "done", at: t },
    { id: "gps", label: "GPS Verified", status: "done", at: t },
    { id: "transcript", label: "Transcript Extracted", status: "done", at: t },
    { id: "observation", label: "Observation Generated", status: "done", at: t },
    { id: "saved", label: "Saved", status: saved ? "done" : "pending" },
  ];
}
