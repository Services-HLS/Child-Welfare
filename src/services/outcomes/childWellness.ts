import { ChildProgressRecord, ChildRiskSignal, ChildWellnessIndex } from "@/types/intelligence";
import { Center } from "@/data/mockData";

const SIGNAL_LABELS: Record<ChildRiskSignal["type"], string> = {
  attendance_drop: "Attendance drop detected",
  delayed_participation: "Delayed preschool participation",
  nutrition_inconsistency: "Nutrition completion inconsistent",
  developmental_concern: "Developmental concern indicator",
  center_outcome_decline: "Center-level outcome decline",
};

export function computeChildWellnessIndex(center: Center, records: ChildProgressRecord[]): ChildWellnessIndex {
  const centerRecs = records.filter((r) => r.centerId === center.id);
  const total = Math.max(1, centerRecs.length);
  const attended = centerRecs.filter((r) => r.attended).length;
  const nutrition = centerRecs.filter((r) => r.nutritionCompleted).length;
  const avgPart = centerRecs.reduce((a, r) => a + r.preschoolParticipation, 0) / total;
  const devNotes = centerRecs.filter((r) => r.developmentalNote || r.learningObservation).length;

  const attendanceComponent = Math.round((attended / total) * 100);
  const nutritionComponent = Math.round((nutrition / total) * 100);
  const participationComponent = Math.round(avgPart * 100);
  const developmentComponent = Math.round((devNotes / total) * 100);
  const expectedParticipation = 0.85;
  const cwiScore = Math.round(
    attendanceComponent * 0.3 + nutritionComponent * 0.25 + participationComponent * 0.3 + developmentComponent * 0.15
  );

  const recent = centerRecs.slice(0, Math.min(5, centerRecs.length));
  const older = centerRecs.slice(5, 10);
  const recentPart = recent.length ? recent.reduce((a, r) => a + r.preschoolParticipation, 0) / recent.length : avgPart;
  const olderPart = older.length ? older.reduce((a, r) => a + r.preschoolParticipation, 0) / older.length : avgPart;
  const trend = recentPart > olderPart + 0.05 ? "up" : recentPart < olderPart - 0.05 ? "down" : "stable";

  return {
    centerId: center.id,
    centerName: center.name,
    district: center.district,
    cwiScore: Math.min(100, cwiScore),
    attendanceComponent,
    nutritionComponent,
    participationComponent,
    developmentComponent,
    trend,
    expectedParticipation: Math.round(expectedParticipation * 100),
    actualParticipation: Math.round(avgPart * 100),
    updatedAt: new Date().toISOString(),
  };
}

export function detectChildRiskSignals(center: Center, records: ChildProgressRecord[]): ChildRiskSignal[] {
  const signals: ChildRiskSignal[] = [];
  const centerRecs = records.filter((r) => r.centerId === center.id);
  const byChild = new Map<string, ChildProgressRecord[]>();
  centerRecs.forEach((r) => {
    const list = byChild.get(r.childId) ?? [];
    list.push(r);
    byChild.set(r.childId, list);
  });

  byChild.forEach((logs, childId) => {
    const recent = logs[0];
    if (!recent) return;
    const absences = logs.filter((l) => !l.attended).length;
    if (absences >= 2) {
      signals.push({
        id: `RSK-ATT-${childId}`,
        childId,
        childName: recent.childName,
        centerId: center.id,
        centerName: center.name,
        type: "attendance_drop",
        severity: absences >= 3 ? "high" : "medium",
        confidence: 0.82,
        summary: `${recent.childName}: ${absences} absence(s) in recent logs`,
        recommendedAction: "Home visit or parent outreach within 48 hours",
        detectedAt: new Date().toISOString(),
      });
    }
    if (recent.preschoolParticipation < 0.5) {
      signals.push({
        id: `RSK-PART-${childId}`,
        childId,
        childName: recent.childName,
        centerId: center.id,
        centerName: center.name,
        type: "delayed_participation",
        severity: recent.preschoolParticipation < 0.35 ? "high" : "medium",
        confidence: 0.78,
        summary: `Participation at ${(recent.preschoolParticipation * 100).toFixed(0)}% vs expected 85%`,
        recommendedAction: "Adjust activity plan; supervisor observation session",
        detectedAt: new Date().toISOString(),
      });
    }
    const missedNutrition = logs.filter((l) => l.attended && !l.nutritionCompleted).length;
    if (missedNutrition >= 2) {
      signals.push({
        id: `RSK-NUT-${childId}`,
        childId,
        childName: recent.childName,
        centerId: center.id,
        centerName: center.name,
        type: "nutrition_inconsistency",
        severity: "medium",
        confidence: 0.75,
        summary: `Nutrition gaps on ${missedNutrition} attended days`,
        recommendedAction: "Verify ration delivery and meal distribution logs",
        detectedAt: new Date().toISOString(),
      });
    }
    if (recent.growthIndicator === "concern" || recent.developmentalNote?.toLowerCase().includes("concern")) {
      signals.push({
        id: `RSK-DEV-${childId}`,
        childId,
        childName: recent.childName,
        centerId: center.id,
        centerName: center.name,
        type: "developmental_concern",
        severity: "high",
        confidence: 0.8,
        summary: recent.developmentalNote ?? "Worker flagged developmental concern",
        recommendedAction: "Refer to health worker; document milestone follow-up",
        detectedAt: new Date().toISOString(),
      });
    }
  });

  const declining = centerRecs.filter((r) => !r.attended || r.preschoolParticipation < 0.45).length;
  if (declining >= 3 && centerRecs.length >= 3) {
    signals.push({
      id: `RSK-CEN-${center.id}`,
      centerId: center.id,
      centerName: center.name,
      type: "center_outcome_decline",
      severity: "high",
      confidence: 0.85,
      summary: `${declining} children showing outcome decline at ${center.name}`,
      recommendedAction: "Launch center intervention; review digital twin timeline",
      detectedAt: new Date().toISOString(),
    });
  }

  return signals;
}

export { SIGNAL_LABELS };
