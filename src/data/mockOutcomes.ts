import { ChildProgressRecord, BeneficiarySurvey } from "@/types/intelligence";

const d = (days: number) => new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);

export const mockChildProgress: ChildProgressRecord[] = [
  { id: "CP-1", childId: "CH-01", childName: "Aarav Rao", centerId: "AWC-TPT-01", workerId: "W-1042", date: d(0), attended: true, nutritionCompleted: true, preschoolParticipation: 0.9, growthMilestone: "Height on track", learningObservation: "Recognizes letters A-D", developmentalNote: "Active in group play", activityId: "A-101" },
  { id: "CP-2", childId: "CH-02", childName: "Priya Rao", centerId: "AWC-TPT-01", workerId: "W-1042", date: d(0), attended: true, nutritionCompleted: true, preschoolParticipation: 0.85, learningObservation: "Counting 1-10", developmentalNote: "Shy but participating" },
  { id: "CP-3", childId: "CH-03", childName: "Ravi K", centerId: "AWC-TPT-06", workerId: "W-1042", date: d(1), attended: false, nutritionCompleted: false, preschoolParticipation: 0.4, developmentalNote: "Absent — parent informed sick" },
];

export const mockSurveys: BeneficiarySurvey[] = [
  {
    id: "SVY-1",
    beneficiaryId: "B-1001",
    centerId: "AWC-TPT-01",
    trigger: "after_activity",
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    responses: { foodQuality: 4, cleanliness: 4, teacherSupport: 5, learningQuality: 4, communication: 4, overallSatisfaction: 4 },
  },
  {
    id: "SVY-2",
    beneficiaryId: "B-1001",
    centerId: "AWC-TPT-01",
    trigger: "scheduled",
    createdAt: new Date().toISOString(),
  },
];
