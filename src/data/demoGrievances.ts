import { ComplaintRecord } from "@/types/platform";
import { generateInvestigationReport } from "@/services/ai/investigation-engine";
import { analyzePublicGrievance } from "@/services/ai/grievance-engine";

const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();
const sla = (hours: number) => new Date(Date.now() + hours * 3600_000).toISOString();

function buildDemo(
  partial: Omit<ComplaintRecord, "investigationReport"> & { investigationReport?: never }
): ComplaintRecord {
  const base = { ...partial };
  if (base.grievance && (base.citizenEvidence?.length ?? 0) > 0) {
    base.grievance = { ...base.grievance, evidence: base.citizenEvidence! };
  }
  return { ...base, investigationReport: generateInvestigationReport(base) };
}

const nutritionAi = analyzePublicGrievance(
  "Children did not receive eggs for three consecutive days — food was unavailable — empty food storage",
  1,
  "mobile_app"
);
const infraAi = analyzePublicGrievance(
  "Roof leaking rainwater into classroom — wall damage visible",
  2,
  "mobile_app"
);
const workerAi = analyzePublicGrievance(
  "Anganwadi worker shouted at parent and refused to serve meal",
  1,
  "mobile_app"
);
const preschoolAi = analyzePublicGrievance(
  "No preschool session conducted for three days — children sitting idle",
  2,
  "mobile_app"
);
const waterAi = analyzePublicGrievance(
  "Drinking water smells bad and children fell sick after drinking",
  1,
  "mobile_app"
);
const hotMealAi = analyzePublicGrievance(
  "Hot cooked meal not served for five days — only dry ration given to children",
  1,
  "mobile_app"
);
const safetyAi = analyzePublicGrievance(
  "Open drain near Anganwadi playground — child nearly fell inside during play time",
  1,
  "mobile_app"
);
const cleanlinessAi = analyzePublicGrievance(
  "Toilet not cleaned for a week — flies around kitchen area — children refused to eat",
  2,
  "mobile_app"
);

/** Hardcoded demo grievances — always merged on load (Vercel + local storage). */
export const DEMO_GRIEVANCES: ComplaintRecord[] = [
  // —— Alipiri Center (AWC-TPT-01) · 4 grievances ——
  buildDemo({
    id: "GRV-240001",
    beneficiaryId: "PUB-001",
    beneficiaryName: "Rama Devi",
    registeredMobile: "9876501234",
    centerId: "AWC-TPT-01",
    centerName: "Alipiri Center",
    village: "Alipiri",
    mandal: "Tirupati Urban",
    district: "Tirupati",
    category: "nutrition_quality",
    title: "Children did not receive eggs for three consecutive days",
    description:
      "The children were not served eggs for the last three days. Food was unavailable at the center. Children did not receive nutrition meal today. Food storage found empty with no egg trays or milk containers visible. Photo evidence attached showing empty food storage containers.",
    status: "supervisor_review",
    urgencyScore: 0.88,
    sentiment: "negative",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "parent_caregiver",
    priority: "critical",
    sourceChannel: "mobile_app",
    createdAt: ago(180),
    updatedAt: ago(60),
    slaDueAt: sla(48),
    citizenEvidence: [
      { id: "ev1", type: "photo", url: "/placeholder-evidence.jpg", label: "Empty storage photo", uploadedAt: ago(175) },
      {
        id: "ev1-ocr",
        type: "ocr",
        label: "OCR: anganwadi_register_note.pdf",
        text: "Anganwadi daily register — 12 June: Egg stock not received from supplier. 13 June: No eggs distributed. 14 June: Food storage empty. Children served only rice without protein supplement. Signed AWW.",
        ocrLanguage: "en",
        ocrLanguageLabel: "English",
        ocrSource: "pdf",
        ocrFileKind: "document",
        ocrFileName: "anganwadi_register_note.pdf",
        ocrCharacterCount: 198,
        uploadedAt: ago(175),
      },
    ],
    grievanceActions: [
      { id: "GA-1", ownerRole: "beneficiary", officerName: "Rama Devi", notes: "Citizen submission received", timestamp: ago(180) },
      { id: "GA-2", ownerRole: "system", officerName: "AI Engine", notes: "AI verification complete — nutrition classification", timestamp: ago(170) },
    ],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: nutritionAi,
      citizenPriority: "critical",
    },
  }),
  buildDemo({
    id: "GRV-240004",
    beneficiaryId: "PUB-004",
    beneficiaryName: "Geetha Reddy",
    registeredMobile: "9876543210",
    centerId: "AWC-TPT-01",
    centerName: "Alipiri Center",
    village: "Alipiri",
    mandal: "Tirupati Urban",
    district: "Tirupati",
    category: "education",
    title: "Preschool education not conducted",
    description:
      "No ECCE session for three consecutive days. Children not engaged in learning activities. Blackboard unused and learning kits locked in storage.",
    status: "ai_processing",
    urgencyScore: 0.65,
    sentiment: "negative",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "guardian",
    priority: "medium",
    sourceChannel: "mobile_app",
    createdAt: ago(60),
    updatedAt: ago(30),
    slaDueAt: sla(48),
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: preschoolAi,
      citizenPriority: "medium",
    },
  }),
  buildDemo({
    id: "GRV-240006",
    beneficiaryId: "B-1001",
    beneficiaryName: "Sunita Rao",
    registeredMobile: "9876501234",
    centerId: "AWC-TPT-01",
    centerName: "Alipiri Center",
    village: "Alipiri",
    mandal: "Tirupati Urban",
    district: "Tirupati",
    category: "hot_cooked_meals",
    title: "Hot cooked meal not served for five days",
    description:
      "Hot cooked meal (Pulihora) was not prepared or served for five consecutive working days. Children received only dry take-home ration without a warm meal at the center.",
    status: "supervisor_review",
    urgencyScore: 0.9,
    sentiment: "negative",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "parent_caregiver",
    priority: "critical",
    sourceChannel: "mobile_app",
    createdAt: ago(140),
    updatedAt: ago(50),
    slaDueAt: sla(24),
    citizenEvidence: [
      { id: "ev6", type: "photo", url: "/placeholder-evidence.jpg", label: "Empty kitchen photo", uploadedAt: ago(135) },
    ],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: hotMealAi,
      citizenPriority: "critical",
    },
  }),
  buildDemo({
    id: "GRV-240007",
    beneficiaryId: "PUB-007",
    beneficiaryName: "Venkatamma",
    registeredMobile: "9345678901",
    centerId: "AWC-TPT-01",
    centerName: "Alipiri Center",
    village: "Alipiri",
    mandal: "Tirupati Urban",
    district: "Tirupati",
    category: "child_safety",
    title: "Open drain near playground — child safety risk",
    description:
      "An open drain without cover runs beside the Anganwadi playground. A 4-year-old child nearly fell inside during outdoor play. Parents demand immediate fencing and cover.",
    status: "supervisor_review",
    urgencyScore: 0.93,
    sentiment: "critical",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "parent_caregiver",
    priority: "critical",
    sourceChannel: "mobile_app",
    createdAt: ago(100),
    updatedAt: ago(40),
    slaDueAt: sla(24),
    citizenEvidence: [
      { id: "ev7", type: "photo", url: "/placeholder-evidence.jpg", label: "Open drain near playground", uploadedAt: ago(95) },
    ],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: safetyAi,
      citizenPriority: "critical",
    },
  }),

  // —— Other Tirupati centers · 4 grievances ——
  buildDemo({
    id: "GRV-240002",
    beneficiaryId: "PUB-002",
    beneficiaryName: "Anonymous Citizen",
    anonymous: true,
    centerId: "AWC-TPT-03",
    centerName: "Renigunta Sector",
    village: "Renigunta",
    mandal: "Renigunta",
    district: "Tirupati",
    category: "infrastructure",
    title: "Roof damage — rainwater entering classroom",
    description:
      "Building roof has cracks. Rainwater enters during monsoon. Children at safety risk. Wall plaster peeling near seating area.",
    status: "supervisor_review",
    urgencyScore: 0.85,
    sentiment: "negative",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "citizen_community",
    priority: "high",
    sourceChannel: "mobile_app",
    createdAt: ago(300),
    updatedAt: ago(120),
    slaDueAt: sla(48),
    citizenEvidence: [{ id: "ev2", type: "photo", url: "/placeholder-evidence.jpg", label: "Roof damage", uploadedAt: ago(295) }],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: infraAi,
      citizenPriority: "high",
    },
  }),
  buildDemo({
    id: "GRV-240003",
    beneficiaryId: "PUB-003",
    beneficiaryName: "Lakshmi Ammal",
    registeredMobile: "9988776655",
    centerId: "AWC-TPT-06",
    centerName: "Pakala South",
    village: "Pakala",
    mandal: "Pakala",
    district: "Tirupati",
    category: "worker_behavior",
    title: "Worker misbehaviour with parent",
    description:
      "Anganwadi worker shouted at parent in front of children and refused to distribute meal. Other parents witnessed the incident.",
    status: "supervisor_review",
    urgencyScore: 0.82,
    sentiment: "critical",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "parent_caregiver",
    priority: "high",
    sourceChannel: "mobile_app",
    createdAt: ago(240),
    updatedAt: ago(90),
    slaDueAt: sla(48),
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: workerAi,
      citizenPriority: "high",
    },
  }),
  buildDemo({
    id: "GRV-240005",
    beneficiaryId: "PUB-005",
    beneficiaryName: "Community Observer",
    registeredMobile: "9000012345",
    centerId: "AWC-TPT-06",
    centerName: "Pakala South",
    village: "Pakala",
    mandal: "Pakala",
    district: "Tirupati",
    category: "drinking_water",
    title: "Unsafe drinking water at center",
    description:
      "Water from hand pump smells foul. Two children reported stomach pain after drinking. Parents stopped sending children until water is tested.",
    status: "supervisor_review",
    urgencyScore: 0.95,
    sentiment: "critical",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "citizen_community",
    priority: "critical",
    sourceChannel: "mobile_app",
    createdAt: ago(45),
    updatedAt: ago(15),
    slaDueAt: sla(24),
    citizenEvidence: [{ id: "ev5", type: "photo", url: "/placeholder-evidence.jpg", label: "Water source", uploadedAt: ago(40) }],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: waterAi,
      citizenPriority: "critical",
    },
  }),
  buildDemo({
    id: "GRV-240008",
    beneficiaryId: "PUB-008",
    beneficiaryName: "Padma Lakshmi",
    registeredMobile: "9012345678",
    centerId: "AWC-TPT-07",
    centerName: "Puttur Central",
    village: "Puttur",
    mandal: "Puttur",
    district: "Tirupati",
    category: "cleanliness",
    title: "Unsanitary toilet and kitchen area",
    description:
      "Toilet not cleaned for over a week. Flies around kitchen preparation area. Children refused to eat meals citing bad smell. Sanitation register not updated.",
    status: "supervisor_review",
    urgencyScore: 0.78,
    sentiment: "negative",
    supervisorId: "SUP-TPT-01",
    supervisorName: "Ravi Kumar · Supervisor",
    submittedAs: "lactating_mother",
    priority: "high",
    sourceChannel: "mobile_app",
    createdAt: ago(200),
    updatedAt: ago(70),
    slaDueAt: sla(48),
    citizenEvidence: [
      { id: "ev8", type: "photo", url: "/placeholder-evidence.jpg", label: "Kitchen sanitation photo", uploadedAt: ago(195) },
    ],
    grievance: {
      ownerRole: "supervisor",
      ownerId: "SUP-TPT-01",
      ownerName: "Ravi Kumar",
      evidence: [],
      actions: [],
      aiAnalysis: cleanlinessAi,
      citizenPriority: "high",
    },
  }),
];

/** Always inject hardcoded demo grievances — upserts by ID so Vercel deploys get fresh demo data. */
export function mergeDemoGrievances(existing: ComplaintRecord[]): ComplaintRecord[] {
  const demoIds = new Set(DEMO_GRIEVANCES.map((d) => d.id));
  const withoutDemo = existing.filter((c) => !demoIds.has(c.id));
  return [...withoutDemo, ...DEMO_GRIEVANCES];
}
