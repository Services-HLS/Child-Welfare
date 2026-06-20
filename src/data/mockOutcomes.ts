import { ChildProgressRecord, BeneficiarySurvey } from "@/types/intelligence";

const d = (days: number) => new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);

const LEARNING_OBS = [
  "Recognizes letters A–D and traces with finger",
  "Counts objects 1–10 using classroom blocks",
  "Joined group rhyme — clapped on beat",
  "Identified colours red, blue, and yellow",
  "Practised Telugu–English greetings with teacher",
  "Completed puzzle activity with peer support",
  "Listened to Nakka–Tabelu story and answered 2 questions",
  "Drew family picture during art session",
  "Sorted shapes — circle, square, triangle",
  "Recited days of week with group",
];

const DEV_NOTES = [
  "Active in group play; shares toys willingly",
  "Participated in outdoor activity",
  "Focused during storytelling circle",
  "Helped younger child with mat placement",
  "Engaged well in mid-day meal routine",
  "Cooperative during hand-washing drill",
  "Showed curiosity in science picture cards",
  "Calm and attentive throughout session",
  "Played cooperatively in team game",
  "Responded to teacher instructions promptly",
];

const ABSENT_REASONS = [
  "Absent — parent informed child unwell (fever)",
  "Absent — family function; advance notice given",
  "Absent — no prior notice; follow-up call made",
];

function buildChildHistory(
  childId: string,
  childName: string,
  centerId: string,
  workerId: string,
  days: number,
  absentDays: number[]
): ChildProgressRecord[] {
  return Array.from({ length: days }, (_, i) => {
    const date = d(i);
    const attended = !absentDays.includes(i);
    return {
      id: `CP-${childId}-${i}`,
      childId,
      childName,
      centerId,
      workerId: workerId,
      date,
      attended,
      nutritionCompleted: attended && i !== 5 && i !== 12,
      preschoolParticipation: attended ? Number((0.72 + (i % 6) * 0.04).toFixed(2)) : 0,
      growthMilestone: i % 7 === 0 ? "Height & weight on track (WHO)" : undefined,
      growthIndicator: attended ? (i % 11 === 0 ? "monitor" : "on_track") : undefined,
      learningObservation: attended ? LEARNING_OBS[i % LEARNING_OBS.length] : undefined,
      developmentalNote: attended ? DEV_NOTES[i % DEV_NOTES.length] : ABSENT_REASONS[i % ABSENT_REASONS.length],
      activityId: i % 4 === 0 ? "A-101" : i % 4 === 2 ? "A-106" : undefined,
      attendanceConsistency: attended ? 0.85 : 0.6,
    };
  });
}

export const mockChildProgress: ChildProgressRecord[] = [
  ...buildChildHistory("CH-01", "Aarav Rao", "AWC-TPT-01", "W-1042", 21, [3, 10, 17]),
  ...buildChildHistory("CH-02", "Priya Rao", "AWC-TPT-01", "W-1042", 21, [6, 14]),
  { id: "CP-CH03-0", childId: "CH-03", childName: "Ravi K", centerId: "AWC-TPT-06", workerId: "W-1042", date: d(1), attended: false, nutritionCompleted: false, preschoolParticipation: 0.4, developmentalNote: "Absent — parent informed sick" },
  ...buildChildHistory("CH-03", "Ravi K", "AWC-TPT-06", "W-1042", 14, [1, 5, 9]).slice(1),
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
