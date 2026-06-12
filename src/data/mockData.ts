import type { Role as PlatformRole } from "@/types/platform";
export type Role = PlatformRole;

export interface Center {
  id: string;
  name: string;
  district: string;
  mandal: string;
  worker: string;
  compliance: number;
  children: number;
  status: "healthy" | "warning" | "critical";
}

export interface ActivityLog {
  id: string;
  centerId: string;
  centerName: string;
  worker: string;
  type: string;
  description: string;
  childrenPresent: number;
  timestamp: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  status: "submitted" | "approved" | "issue" | "pending";
  aiConfidence: number;
  supervisorRemark?: string;
  aiResult?: {
    activityMatch: "match" | "partial" | "mismatch";
    detectedChildren: number;
    classroomCheck: {
      materials: boolean;
      seating: boolean;
      setup: boolean;
    };
    specificEvidence: string[];
    anomalies: string[];
    confidence: number;
    summary: string;
    isGeoMatch?: boolean;
    isCountMatch?: boolean;
    explanation?: string;
  };
  isLiveCapture?: boolean;
  capturedLocation?: { lat: number; lng: number };
  synced: boolean;
  /** Service evidence capture (AnganSakti 360) */
  mealDistribution?: boolean;
  classroomEngagement?: number;
  voiceNoteUrl?: string;
  serviceMetrics?: {
    classroomSetup: number;
    childPresence: number;
    mealDelivery: number;
    activityExecution: number;
    safetyCompliance: number;
    overallConfidence: number;
  };
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lat: number;
  lng: number;
}

export interface AlertItem {
  id: string;
  type: "missed" | "anomaly" | "low-confidence";
  centerId: string;
  centerName: string;
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
}

export const mockCenters: Center[] = [
  // Tirupati Centers (For Worker & Supervisor)
  { id: "AWC-TPT-01", name: "Alipiri Center", district: "Tirupati", mandal: "Tirupati Urban", worker: "Lakshmi Devi", compliance: 96, children: 34, status: "healthy" },
  { id: "AWC-TPT-02", name: "Tiruchanoor Main", district: "Tirupati", mandal: "Tirupati Rural", worker: "Rajeshwari", compliance: 91, children: 30, status: "healthy" },
  { id: "AWC-TPT-03", name: "Renigunta Sector", district: "Tirupati", mandal: "Renigunta", worker: "Padma Sri", compliance: 78, children: 26, status: "warning" },
  { id: "AWC-TPT-04", name: "Srikalahasti West", district: "Tirupati", mandal: "Srikalahasti", worker: "Saraswati", compliance: 84, children: 29, status: "healthy" },
  { id: "AWC-TPT-05", name: "Chandragiri East", district: "Tirupati", mandal: "Chandragiri", worker: "Vijaya Lakshmi", compliance: 88, children: 31, status: "healthy" },
  { id: "AWC-TPT-06", name: "Pakala South", district: "Tirupati", mandal: "Pakala", worker: "Anitha Rani", compliance: 65, children: 24, status: "critical" },
  { id: "AWC-TPT-07", name: "Puttur Central", district: "Tirupati", mandal: "Puttur", worker: "M. Durga", compliance: 93, children: 36, status: "healthy" },
  { id: "AWC-TPT-08", name: "Nagari Border", district: "Tirupati", mandal: "Nagari", worker: "K. Sunitha", compliance: 72, children: 21, status: "warning" },
  
  // Other Districts (For Admin)
  { id: "AWC-KRI-01", name: "Gandhi Nagar", district: "Krishna", mandal: "Vijayawada Urban", worker: "Mary John", compliance: 92, children: 31, status: "healthy" },
  { id: "AWC-KRI-02", name: "Subhash Colony", district: "Krishna", mandal: "Vijayawada Rural", worker: "P. Ratna", compliance: 85, children: 28, status: "healthy" },
  { id: "AWC-KRI-03", name: "Labbipet Main", district: "Krishna", mandal: "Vijayawada Urban", worker: "V. Shanti", compliance: 97, children: 40, status: "healthy" },
  { id: "AWC-GNT-01", name: "Ambedkar Colony", district: "Guntur", mandal: "Tenali", worker: "Kamala Bai", compliance: 62, children: 22, status: "critical" },
  { id: "AWC-GNT-02", name: "Patel Road", district: "Guntur", mandal: "Guntur City", worker: "S. Rani", compliance: 94, children: 33, status: "healthy" },
  { id: "AWC-VSP-01", name: "RK Beach Center", district: "Visakhapatnam", mandal: "Vizag Urban", worker: "B. Lakshmi", compliance: 89, children: 27, status: "healthy" },
  { id: "AWC-VSP-02", name: "Gajuwaka Main", district: "Visakhapatnam", mandal: "Gajuwaka", worker: "P. Mary", compliance: 76, children: 25, status: "warning" },
  { id: "AWC-KRN-01", name: "Kurnool Gateway", district: "Kurnool", mandal: "Kurnool", worker: "T. Bhavani", compliance: 74, children: 25, status: "warning" },
  { id: "AWC-KRN-02", name: "Nandyal Sector", district: "Kurnool", mandal: "Nandyal", worker: "M. Kavita", compliance: 91, children: 32, status: "healthy" },
];

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();

export const mockActivities: ActivityLog[] = [
  // Tirupati Activities
  { id: "A-101", centerId: "AWC-TPT-01", centerName: "Alipiri Center", worker: "Lakshmi Devi", type: "Nutrition Distribution", description: "Hot cooked meal served — Pulihora & egg", childrenPresent: 32, timestamp: ago(15), lat: 13.6288, lng: 79.4192, status: "approved", aiConfidence: 0.98, synced: true },
  { id: "A-102", centerId: "AWC-TPT-02", centerName: "Tiruchanoor Main", worker: "Rajeshwari", type: "Preschool Education", description: "Storytelling & alphabet activity", childrenPresent: 28, timestamp: ago(45), lat: 13.6125, lng: 79.4533, status: "approved", aiConfidence: 0.92, synced: true },
  { id: "A-103", centerId: "AWC-TPT-03", centerName: "Renigunta Sector", worker: "Padma Sri", type: "Health Check-up", description: "Weight & height measurement", childrenPresent: 24, timestamp: ago(120), lat: 13.6450, lng: 79.5122, status: "submitted", aiConfidence: 0.58, synced: true },
  { id: "A-106", centerId: "AWC-TPT-01", centerName: "Alipiri Center", worker: "Lakshmi Devi", type: "Preschool Education", description: "Creative drawing & coloring", childrenPresent: 31, timestamp: ago(360), lat: 13.6288, lng: 79.4192, status: "approved", aiConfidence: 0.94, synced: true },
  { id: "A-107", centerId: "AWC-TPT-05", centerName: "Chandragiri East", worker: "Vijaya Lakshmi", type: "Nutrition Distribution", description: "Morning milk & snacks", childrenPresent: 29, timestamp: ago(420), lat: 13.5850, lng: 79.3122, status: "approved", aiConfidence: 0.96, synced: true },
  { id: "A-108", centerId: "AWC-TPT-04", centerName: "Srikalahasti West", worker: "Saraswati", type: "Health Check-up", description: "Fever screening & sanitization", childrenPresent: 27, timestamp: ago(480), lat: 13.7495, lng: 79.7032, status: "submitted", aiConfidence: 0.81, synced: false },
  { id: "A-109", centerId: "AWC-TPT-02", centerName: "Tiruchanoor Main", worker: "Rajeshwari", type: "Nutrition Distribution", description: "Lunch service - Rice and dal", childrenPresent: 30, timestamp: ago(540), lat: 13.6125, lng: 79.4533, status: "approved", aiConfidence: 0.95, synced: true },
  { id: "A-110", centerId: "AWC-TPT-01", centerName: "Alipiri Center", worker: "Lakshmi Devi", type: "Attendance", description: "Morning staff and child check-in", childrenPresent: 34, timestamp: ago(2000), lat: 13.6288, lng: 79.4192, status: "approved", aiConfidence: 0.99, synced: true },
  
  // Other District Activities
  { id: "A-104", centerId: "AWC-GNT-01", centerName: "Ambedkar Colony", worker: "Kamala Bai", type: "Immunization", description: "Polio drops administered", childrenPresent: 20, timestamp: ago(180), lat: 16.2433, lng: 80.6500, status: "issue", aiConfidence: 0.32, synced: true },
  { id: "A-105", centerId: "AWC-KRI-01", centerName: "Gandhi Nagar", worker: "Mary John", type: "Nutrition Distribution", description: "Afternoon snacks distributed", childrenPresent: 30, timestamp: ago(240), lat: 16.5062, lng: 80.6480, status: "submitted", aiConfidence: 0.75, synced: false },
  { id: "A-111", centerId: "AWC-VSP-01", centerName: "RK Beach Center", worker: "B. Lakshmi", type: "Preschool Education", description: "Basic counting & number identification", childrenPresent: 26, timestamp: ago(660), lat: 17.7127, lng: 83.3235, status: "approved", aiConfidence: 0.91, synced: true },
  { id: "A-112", centerId: "AWC-KRN-02", centerName: "Nandyal Sector", worker: "M. Kavita", type: "Health Check-up", description: "Growth monitoring session", childrenPresent: 31, timestamp: ago(720), lat: 15.4847, lng: 78.4815, status: "approved", aiConfidence: 0.88, synced: true },
  { id: "A-113", centerId: "AWC-GNT-02", centerName: "Patel Road", worker: "S. Rani", type: "Nutrition Distribution", description: "Balamrutham distribution for infants", childrenPresent: 18, timestamp: ago(780), lat: 16.3067, lng: 80.4365, status: "submitted", aiConfidence: 0.45, synced: true },
];

export const mockAlerts: AlertItem[] = [
  // Tirupati Alerts
  { id: "AL-1", type: "missed", centerId: "AWC-TPT-03", centerName: "Renigunta Sector", message: "Morning attendance not marked", time: ago(180), severity: "high" },
  { id: "AL-2", type: "anomaly", centerId: "AWC-TPT-02", centerName: "Tiruchanoor Main", message: "Geo-tag 1.2km from registered location", time: ago(95), severity: "medium" },
  { id: "AL-4", type: "low-confidence", centerId: "AWC-TPT-06", centerName: "Pakala South", message: "AI verification failed for food photo", time: ago(210), severity: "high" },
  { id: "AL-5", type: "missed", centerId: "AWC-TPT-08", centerName: "Nagari Border", message: "Lunch log entry missing today", time: ago(320), severity: "medium" },
  { id: "AL-6", type: "anomaly", centerId: "AWC-TPT-01", centerName: "Alipiri Center", message: "Sudden drop in enrollment reported", time: ago(400), severity: "low" },
  
  // Other District Alerts
  { id: "AL-3", type: "low-confidence", centerId: "AWC-GNT-01", centerName: "Ambedkar Colony", message: "AI mismatch on immunization upload", time: ago(70), severity: "high" },
  { id: "AL-7", type: "missed", centerId: "AWC-KRN-01", centerName: "Kurnool Gateway", message: "No activity records for 48 hours", time: ago(1440), severity: "high" },
  { id: "AL-8", type: "anomaly", centerId: "AWC-KRI-02", centerName: "Subhash Colony", message: "Check-in time outside official hours", time: ago(600), severity: "medium" },
];

export const complianceTrend = [
  { day: "Mon", value: 78 }, { day: "Tue", value: 82 }, { day: "Wed", value: 80 },
  { day: "Thu", value: 85 }, { day: "Fri", value: 88 }, { day: "Sat", value: 84 }, { day: "Sun", value: 87 },
];

export const activityBreakdown = [
  { name: "Nutrition", value: 420, color: "#3B82F6" },
  { name: "Education", value: 280, color: "#10B981" },
  { name: "Health", value: 180, color: "#F59E0B" },
  { name: "Immunization", value: 120, color: "#6366F1" },
];

export const districtPerformance = [
  { district: "Tirupati", verified: 92, pending: 6, mismatch: 2 },
  { district: "Krishna", verified: 84, pending: 12, mismatch: 4 },
  { district: "Guntur", verified: 78, pending: 16, mismatch: 6 },
  { district: "Visakha", verified: 88, pending: 9, mismatch: 3 },
  { district: "Kurnool", verified: 74, pending: 18, mismatch: 8 },
  { district: "Chittoor", verified: 81, pending: 14, mismatch: 5 },
  { district: "Nellore", verified: 85, pending: 11, mismatch: 4 },
];

export const demoUsers: Record<Role, Record<string, unknown>> = {
  beneficiary: {
    id: "B-1001",
    name: "Sunita Rao",
    center: "Alipiri Center",
    centerId: "AWC-TPT-01",
    phone: "9876501234",
    children: [
      { id: "CH-01", name: "Aarav Rao", age: 4, gender: "M", enrollmentDate: "2024-06-01" },
      { id: "CH-02", name: "Priya Rao", age: 3, gender: "F", enrollmentDate: "2025-01-15" },
    ],
  },
  worker: { id: "W-1042", name: "Lakshmi Devi", center: "Alipiri Center", centerId: "AWC-TPT-01", phone: "9876543210" },
  supervisor: { id: "S-204", name: "Ravi Kumar", area: "Tirupati District", phone: "9123456780" },
  district_admin: { id: "DA-01", name: "Dr. Meena Reddy", area: "Tirupati District", phone: "9000000001" },
  state_admin: { id: "SA-01", name: "Sri Venkatesh Rao", area: "Andhra Pradesh", phone: "9000000099" },
};