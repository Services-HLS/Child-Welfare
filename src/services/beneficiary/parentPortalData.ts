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

export function getChildProgressHistory(
  childId: string,
  centerId: string,
  records: ChildProgressRecord[]
): ChildProgressRecord[] {
  return records
    .filter((r) => r.childId === childId && r.centerId === centerId)
    .sort((a, b) => b.date.localeCompare(a.date));
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
