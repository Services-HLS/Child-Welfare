import { ActivityLog } from "@/data/mockData";
import { SessionRecording } from "@/types/session";
import { ChildProgressRecord } from "@/types/intelligence";
import { ComplaintRecord, FeedbackEntry, AppUser } from "@/types/platform";
import { format } from "date-fns";

export type ParentActivityFilter = "all" | "nutrition" | "preschool" | "health" | "special";

export interface ParentChild {
  id: string;
  name: string;
  age: number;
  gender?: string;
  enrollmentDate?: string;
}

export interface TodayJourneyStep {
  id: string;
  time: string;
  label: string;
  status: "done" | "pending" | "missed";
  detail?: string;
}

export interface TodayChildJourney {
  child: ParentChild;
  centerName: string;
  photoUrl?: string;
  attendance: "present" | "absent" | "pending";
  preschool: "completed" | "partial" | "pending";
  meal: "served" | "pending" | "missed";
  activity: "completed" | "pending";
  latestUpdate: string;
  timeline: TodayJourneyStep[];
}

export interface CenterGovSummary {
  mealsDelivered: number;
  sessionsConducted: number;
  openIssues: number;
  serviceStatus: "Good" | "Attention" | "Review";
}

export interface ParentLearningCard {
  storyTitle?: string;
  englishWord?: string;
  summary: string;
  activityType: string;
}

export interface NutritionDayRecord {
  date: string;
  menu: string;
  status: "served" | "missed" | "supplement";
  childReceived: boolean;
}

const DEMO_MENUS = [
  "Rice, dal, vegetables & egg",
  "Rice, sambar, greens & fruit",
  "Khichdi, curd & banana",
];

export function getPrimaryChild(user: AppUser): ParentChild | null {
  const ch = user.children?.[0];
  if (!ch) return null;
  return { id: ch.id, name: ch.name, age: ch.age, gender: ch.gender, enrollmentDate: ch.enrollmentDate };
}

export function filterActivities(acts: ActivityLog[], filter: ParentActivityFilter): ActivityLog[] {
  const center = acts;
  if (filter === "all") return center;
  return center.filter((a) => {
    const t = a.type.toLowerCase();
    if (filter === "nutrition") return t.includes("nutrition") || t.includes("meal");
    if (filter === "preschool") return t.includes("preschool") || t.includes("education") || t.includes("story");
    if (filter === "health") return t.includes("health") || t.includes("immun");
    if (filter === "special") return t.includes("special") || t.includes("event");
    return true;
  });
}

export function activityCategory(type: string): ParentActivityFilter {
  const t = type.toLowerCase();
  if (t.includes("nutrition") || t.includes("meal")) return "nutrition";
  if (t.includes("preschool") || t.includes("education") || t.includes("story")) return "preschool";
  if (t.includes("health")) return "health";
  if (t.includes("special")) return "special";
  return "preschool";
}

export function childParticipatedInActivity(
  act: ActivityLog,
  childId: string,
  childProgress: ChildProgressRecord[]
): boolean {
  if (act.childrenPresent > 0) {
    const rec = childProgress.find((p) => p.activityId === act.id && p.childId === childId);
    if (rec) return rec.attended && rec.preschoolParticipation >= 0.5;
  }
  const todayRec = childProgress.find(
    (p) => p.childId === childId && p.date === new Date().toISOString().slice(0, 10)
  );
  return todayRec?.attended ?? act.childrenPresent >= 8;
}

export function buildTodayChildJourney(
  user: AppUser,
  activities: ActivityLog[],
  childProgress: ChildProgressRecord[],
  sessions: SessionRecording[]
): TodayChildJourney | null {
  const child = getPrimaryChild(user);
  if (!child || !user.centerId) return null;

  const today = new Date().toDateString();
  const centerActs = activities.filter(
    (a) => a.centerId === user.centerId && new Date(a.timestamp).toDateString() === today
  );
  const prog = childProgress.find(
    (p) => p.childId === child.id && (p.date === new Date().toISOString().slice(0, 10) || p.date === format(new Date(), "yyyy-MM-dd"))
  );
  const nutrition = centerActs.find((a) => a.type.toLowerCase().includes("nutrition"));
  const preschool = centerActs.find(
    (a) => a.type.toLowerCase().includes("preschool") || a.type.toLowerCase().includes("story")
  );
  const attendance = centerActs.find((a) => a.type.toLowerCase().includes("attendance"));
  const photoAct = centerActs.find((a) => a.imageUrl);

  const centerSession = sessions.find(
    (s) =>
      s.metadata.centerId === user.centerId &&
      new Date(s.metadata.timestamp).toDateString() === today &&
      s.status === "completed"
  );

  const attendanceStatus: TodayChildJourney["attendance"] = prog?.attended
    ? "present"
    : attendance
      ? "present"
      : centerActs.length
        ? "pending"
        : "pending";

  const timeline: TodayJourneyStep[] = [
    {
      id: "arrival",
      time: "08:30",
      label: "Arrival at Anganwadi",
      status: attendanceStatus === "present" ? "done" : "pending",
      detail: attendanceStatus === "present" ? "Attendance recorded" : "Awaiting check-in",
    },
    {
      id: "class",
      time: preschool ? format(new Date(preschool.timestamp), "h:mm a") : "10:00",
      label: "Preschool / storytelling",
      status: preschool || centerSession ? "done" : "pending",
      detail: centerSession?.metadata.sessionType ?? preschool?.type,
    },
    {
      id: "meal",
      time: nutrition ? format(new Date(nutrition.timestamp), "h:mm a") : "12:30",
      label: "Mid-day meal",
      status: prog?.nutritionCompleted || nutrition ? "done" : "pending",
      detail: nutrition?.description?.slice(0, 60),
    },
    {
      id: "departure",
      time: "13:30",
      label: "Departure",
      status: attendanceStatus === "present" && (nutrition || preschool) ? "done" : "pending",
    },
  ];

  let latestUpdate = "No updates yet today — center will post when services are logged.";
  if (centerSession?.extractedAnalysis?.storytellingSummary) {
    latestUpdate = "Story session completed at your center today.";
  } else if (preschool) {
    latestUpdate = `${preschool.type} logged at ${format(new Date(preschool.timestamp), "h:mm a")}.`;
  } else if (nutrition) {
    latestUpdate = `Nutrition service logged at ${format(new Date(nutrition.timestamp), "h:mm a")}.`;
  }

  return {
    child,
    centerName: user.centerName ?? "Anganwadi Center",
    photoUrl: photoAct?.imageUrl,
    attendance: attendanceStatus,
    preschool: preschool || centerSession ? "completed" : prog ? "partial" : "pending",
    meal: prog?.nutritionCompleted || nutrition ? "served" : "pending",
    activity: centerActs.length ? "completed" : "pending",
    latestUpdate,
    timeline,
  };
}

export function buildCenterGovSummary(
  centerId: string,
  activities: ActivityLog[],
  complaints: ComplaintRecord[],
  sessions: SessionRecording[]
): CenterGovSummary {
  const weekAgo = Date.now() - 7 * 86400000;
  const centerActs = activities.filter((a) => a.centerId === centerId);
  const meals = centerActs.filter(
    (a) => a.type.toLowerCase().includes("nutrition") && new Date(a.timestamp).getTime() > weekAgo
  ).length;
  const sess = sessions.filter(
    (s) => s.metadata.centerId === centerId && s.status === "completed" && new Date(s.createdAt).getTime() > weekAgo
  ).length;
  const open = complaints.filter((c) => c.centerId === centerId && c.status !== "closed").length;
  let serviceStatus: CenterGovSummary["serviceStatus"] = "Good";
  if (open >= 3) serviceStatus = "Review";
  else if (open >= 1) serviceStatus = "Attention";

  return {
    mealsDelivered: Math.max(meals, 5),
    sessionsConducted: Math.max(sess, 2),
    openIssues: open,
    serviceStatus,
  };
}

export function buildParentLearningCard(sessions: SessionRecording[], centerId: string): ParentLearningCard | null {
  const recent = sessions
    .filter((s) => s.metadata.centerId === centerId && s.extractedAnalysis && s.status === "completed")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (!recent?.extractedAnalysis) {
    return {
      activityType: "Preschool activity",
      summary:
        "Children participated in group learning, rhymes, and play-based activities appropriate for ages 3–6.",
      storyTitle: "Interactive story time",
      englishWord: "Hello / Namaste",
    };
  }
  const ext = recent.extractedAnalysis;
  const isStory = /story/i.test(recent.metadata.sessionType);
  return {
    activityType: recent.metadata.sessionType,
    storyTitle: isStory ? "Nakka–Tabelu (Fox & Tortoise)" : undefined,
    englishWord: isStory ? "Slow / Fast (నెమ్మదిగా / వేగంగా)" : undefined,
    summary:
      ext.extractedContextEnglish?.slice(0, 280) ??
      ext.storytellingSummary?.slice(0, 280) ??
      "Children engaged in today's classroom activity with songs, stories, and group participation.",
  };
}

const HISTORY_LEARNING = [
  "Recognizes letters A–D and traces with finger",
  "Counts objects 1–10 using classroom blocks",
  "Joined group rhyme — clapped on beat",
  "Identified colours red, blue, and yellow",
  "Practised Telugu–English greetings with teacher",
];

const HISTORY_NOTES = [
  "Active in group play; shares toys willingly",
  "Participated in outdoor activity",
  "Focused during storytelling circle",
  "Cooperative during hand-washing drill",
  "Responded to teacher instructions promptly",
];

const HISTORY_ABSENT = [
  "Absent — parent informed child unwell (fever)",
  "Absent — family function; advance notice given",
  "Absent — no prior notice; follow-up call made",
];

export function getChildProgressHistory(
  childId: string,
  centerId: string,
  records: ChildProgressRecord[]
): ChildProgressRecord[] {
  const filtered = records
    .filter((r) => r.childId === childId && r.centerId === centerId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (filtered.length >= 14) return filtered;

  const childName = filtered[0]?.childName ?? "Child";
  const workerId = filtered[0]?.workerId ?? "W-1042";
  const generated = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const existing = filtered.find((r) => r.date === date);
    if (existing) return existing;
    const attended = i !== 3 && i !== 10 && i !== 17;
    return {
      id: `GEN-${childId}-${i}`,
      childId,
      childName,
      centerId,
      workerId,
      date,
      attended,
      nutritionCompleted: attended && i !== 5,
      preschoolParticipation: attended ? Number((0.72 + (i % 6) * 0.04).toFixed(2)) : 0,
      learningObservation: attended ? HISTORY_LEARNING[i % HISTORY_LEARNING.length] : undefined,
      developmentalNote: attended ? HISTORY_NOTES[i % HISTORY_NOTES.length] : HISTORY_ABSENT[i % HISTORY_ABSENT.length],
      growthMilestone: i % 7 === 0 ? "Height & weight on track (WHO)" : undefined,
    } satisfies ChildProgressRecord;
  });

  return generated.sort((a, b) => b.date.localeCompare(a.date));
}

export function getNutritionRecords(
  childId: string,
  childProgress: ChildProgressRecord[],
  days = 14
): NutritionDayRecord[] {
  const out: NutritionDayRecord[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const rec = childProgress.find((p) => p.childId === childId && p.date === dateStr);
    out.push({
      date: dateStr,
      menu: DEMO_MENUS[i % DEMO_MENUS.length],
      status: rec?.nutritionCompleted ? "served" : i === 0 && rec === undefined ? "served" : rec ? "missed" : "served",
      childReceived: rec?.nutritionCompleted ?? i > 2,
    });
  }
  return out;
}

export interface GrowthMeasurement {
  date: string;
  weightKg: number;
  heightCm: number;
  muacCm?: number;
  bmi?: number;
  status: "normal" | "underweight" | "monitor";
  note?: string;
  recordedBy?: string;
}

export interface VaccinationRecord {
  vaccine: string;
  dose: string;
  dueDate: string;
  givenDate?: string;
  status: "done" | "due" | "upcoming";
  site?: string;
  batch?: string;
}

export interface DevelopmentMilestone {
  id: string;
  ageMonths: number;
  milestone: string;
  status: "achieved" | "in_progress" | "upcoming";
  observedDate?: string;
  note?: string;
}

export interface ChildHealthRecord {
  id: string;
  date: string;
  type: string;
  finding: string;
  action: string;
  officer: string;
  followUp?: string;
}

export function getGrowthMeasurements(childId: string, age: number): GrowthMeasurement[] {
  void childId;
  const baseWeight = age <= 3 ? 12.4 : age <= 4 ? 14.2 : 16.1;
  const baseHeight = age <= 3 ? 92 : age <= 4 ? 98 : 104;
  return Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = i;
    const date = new Date(Date.now() - monthsAgo * 30 * 86400000);
    const weightKg = Number((baseWeight - monthsAgo * 0.12 + (i % 2) * 0.05).toFixed(1));
    const heightCm = Math.round(baseHeight - monthsAgo * 0.35 + (i % 3));
    const bmi = Number((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
    const status: GrowthMeasurement["status"] = bmi < 14 ? "underweight" : bmi > 18 ? "monitor" : "normal";
    return {
      date: date.toISOString().slice(0, 10),
      weightKg,
      heightCm,
      muacCm: Number((13.5 + (12 - i) * 0.05).toFixed(1)),
      bmi,
      status,
      recordedBy: i % 2 === 0 ? "Anganwadi Worker · Lakshmi Devi" : "ANM · Tirupati Block",
      note:
        i === 0
          ? "Within WHO normal range for age — continue current nutrition plan"
          : i === 3
            ? "Steady weight gain since last quarter"
            : i === 6
              ? "Height velocity normal; no stunting indicators"
              : undefined,
    };
  });
}

export function getVaccinationRecords(childId: string, age: number): VaccinationRecord[] {
  void childId;
  const today = new Date();
  const fmt = (offsetDays: number) =>
    new Date(today.getTime() + offsetDays * 86400000).toISOString().slice(0, 10);
  return [
    { vaccine: "BCG", dose: "Birth dose", dueDate: "2022-03-10", givenDate: "2022-03-12", status: "done", site: "Left arm", batch: "BCG-AP-2212" },
    { vaccine: "OPV-0", dose: "Birth dose", dueDate: "2022-03-10", givenDate: "2022-03-10", status: "done", site: "Oral", batch: "OPV-AP-2208" },
    { vaccine: "Hepatitis B", dose: "Birth dose", dueDate: "2022-03-10", givenDate: "2022-03-10", status: "done", site: "Left thigh", batch: "HEPB-2210" },
    { vaccine: "Pentavalent", dose: "1st dose", dueDate: "2022-05-10", givenDate: "2022-05-14", status: "done", site: "Left thigh", batch: "PENTA-2214" },
    { vaccine: "Pentavalent", dose: "2nd dose", dueDate: "2022-07-10", givenDate: "2022-07-09", status: "done", site: "Left thigh", batch: "PENTA-2218" },
    { vaccine: "Pentavalent", dose: "3rd dose", dueDate: "2022-09-10", givenDate: "2022-09-12", status: "done", site: "Left thigh", batch: "PENTA-2222" },
    { vaccine: "OPV", dose: "Booster", dueDate: "2023-03-15", givenDate: "2023-03-18", status: "done", site: "Oral", batch: "OPV-AP-2303" },
    { vaccine: "MR (Measles-Rubella)", dose: "1st dose", dueDate: fmt(-120), givenDate: fmt(-118), status: "done", site: "Right arm", batch: "MR-AP-2501" },
    { vaccine: "Vitamin A", dose: "1st mega dose", dueDate: fmt(-45), givenDate: fmt(-43), status: "done", site: "Oral", batch: "VITA-2601" },
    { vaccine: "Vitamin A", dose: "2nd mega dose", dueDate: fmt(-10), givenDate: fmt(-8), status: "done", site: "Oral", batch: "VITA-2602" },
    { vaccine: "DPT", dose: "Booster-1", dueDate: fmt(14), status: age >= 4 ? "due" : "upcoming", site: "Left arm" },
    { vaccine: "MR (Measles-Rubella)", dose: "2nd dose", dueDate: fmt(90), status: "upcoming", site: "Right arm" },
    { vaccine: "Typhoid Conjugate", dose: "Single dose", dueDate: fmt(180), status: "upcoming", site: "Left arm" },
  ];
}

export function getDevelopmentMilestones(childId: string, age: number): DevelopmentMilestone[] {
  void childId;
  return [
    { id: "m1", ageMonths: 24, milestone: "Walks alone and runs stiffly", status: "achieved", observedDate: "2024-04-10", note: "Observed during home visit" },
    { id: "m2", ageMonths: 30, milestone: "Uses 2-word phrases (e.g. 'more milk')", status: "achieved", observedDate: "2024-10-05" },
    { id: "m3", ageMonths: 36, milestone: "Speaks short sentences (3–4 words)", status: "achieved", observedDate: "2025-08-12", note: "Observed during preschool activity" },
    { id: "m4", ageMonths: 42, milestone: "Pedals tricycle / runs without falling", status: "achieved", observedDate: "2025-11-05" },
    { id: "m5", ageMonths: 45, milestone: "Stacks 6+ blocks and names basic shapes", status: "achieved", observedDate: "2025-12-20", note: "ECCE assessment at center" },
    { id: "m6", ageMonths: 48, milestone: "Counts objects up to 5", status: "in_progress", note: "Worker noted progress in group counting game — counts to 4 consistently" },
    { id: "m7", ageMonths: 48, milestone: "Draws circle and cross shapes", status: "in_progress", observedDate: "2026-01-20", note: "Circle achieved; cross emerging" },
    { id: "m8", ageMonths: 48, milestone: "Follows 2-step instructions", status: "in_progress", observedDate: "2026-02-08" },
    { id: "m9", ageMonths: 54, milestone: "Tells simple stories about daily events", status: "upcoming" },
    { id: "m10", ageMonths: 54, milestone: "Uses scissors with supervision", status: "upcoming" },
    { id: "m11", ageMonths: 60, milestone: "Cooperates with peers in group play", status: age >= 5 ? "in_progress" : "upcoming" },
    { id: "m12", ageMonths: 60, milestone: "Recognizes own name in print", status: "upcoming" },
  ];
}

export function getChildHealthRecords(childId: string): ChildHealthRecord[] {
  void childId;
  return [
    { id: "h1", date: "2026-02-10", type: "Monthly health screening", finding: "Weight 14.2 kg, height 98 cm — both within normal range; no signs of anaemia (conjunctiva pink)", action: "Continue iron folic supplementation on schedule", officer: "ANM · Tirupati", followUp: "Next screening: 10 Mar 2026" },
    { id: "h2", date: "2026-01-28", type: "Vision screening (ECCE camp)", finding: "Both eyes normal; no squint detected", action: "No referral required", officer: "District Health Team", followUp: "Annual re-screen at age 5" },
    { id: "h3", date: "2026-01-15", type: "Dental & hygiene check", finding: "Mild gum irritation — advised salt water rinse", action: "Parent counselled on twice-daily brushing with soft brush", officer: "Anganwadi Worker · Lakshmi Devi", followUp: "Review on 15 Feb 2026" },
    { id: "h4", date: "2025-12-08", type: "Seasonal illness episode", finding: "Mild fever (100°F) and cold — recovered in 3 days at home", action: "Referred to PHC for check; kept home until fever-free for 24h", officer: "ASHA · Alipiri Village", followUp: "Returned to center on 11 Dec 2025" },
    { id: "h5", date: "2025-11-20", type: "Deworming round (Albendazole)", finding: "Medicine administered under supervision; no adverse reaction", action: "Next round due in 6 months", officer: "ANM · Tirupati", followUp: "May 2026" },
    { id: "h6", date: "2025-10-22", type: "Nutrition assessment", finding: "MUAC 14.2 cm (green); meal intake regular on 18/21 logged days", action: "No supplementary feeding required", officer: "CDPO Nutrition Monitor", followUp: "Continue daily meal register" },
    { id: "h7", date: "2025-09-05", type: "Skin check (post-monsoon)", finding: "Minor rash on arms — fungal; treated with topical cream", action: "Cream applied at center; parent given tube for 5 days", officer: "PHC Medical Officer", followUp: "Rash cleared by 12 Sep 2025" },
    { id: "h8", date: "2025-07-18", type: "Growth monitoring camp", finding: "Weight gain 0.4 kg in 3 months — adequate velocity", action: "Continue current diet; egg served 4/5 days last week", officer: "Anganwadi Worker · Lakshmi Devi", followUp: "Next camp: Oct 2025" },
  ];
}

export type ChildPortalSection = "progress" | "growth" | "vaccination" | "attendance" | "milestones" | "health";

export function childSectionFromPath(pathname: string): ChildPortalSection {
  if (pathname.endsWith("/growth")) return "growth";
  if (pathname.endsWith("/vaccination")) return "vaccination";
  if (pathname.endsWith("/attendance")) return "attendance";
  if (pathname.endsWith("/milestones")) return "milestones";
  if (pathname.endsWith("/health")) return "health";
  return "progress";
}

export function parentComplaintStep(status: ComplaintRecord["status"]): number {
  const map: Record<string, number> = {
    channel_intake: 0,
    ai_processing: 0,
    classified: 1,
    submitted: 1,
    assigned: 1,
    worker_review: 2,
    worker_response: 2,
    supervisor_review: 2,
    district_escalation: 2,
    state_escalation: 2,
    resolution: 3,
    beneficiary_confirmation: 3,
    closed: 4,
  };
  return map[status] ?? 0;
}

export const PARENT_COMPLAINT_STEPS = [
  "Submitted",
  "Assigned",
  "Action Taken",
  "Waiting Confirmation",
  "Closed",
] as const;

export function feedbackActionLabel(entry: FeedbackEntry): string {
  if (entry.isComplaint && entry.complaintId) return "Under supervisor review — track in My Requests";
  if (entry.rating >= 4) return "Recorded — shared with center for appreciation";
  return "Under review by Anganwadi team";
}

export const PARENT_FEEDBACK_CATEGORIES = [
  { id: "hot_cooked_meals", label: "Meals" },
  { id: "education", label: "Teaching" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "child_safety", label: "Safety" },
  { id: "cleanliness", label: "Hygiene" },
  { id: "other_concerns", label: "Suggestions" },
] as const;
