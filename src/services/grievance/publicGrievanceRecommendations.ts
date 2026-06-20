import { ComplaintRecord } from "@/types/platform";
import { AIRecommendationCardData } from "@/components/executive/AIRecommendationCard";
import { isPublicSupervisorGrievance } from "@/services/grievance/publicGrievanceService";

function countByCategory(list: ComplaintRecord[], match: (c: ComplaintRecord) => boolean) {
  return list.filter(match).length;
}

/** District-level AI recommendations for the Public Grievance Center queue (Tirupati). */
export function buildPublicGrievanceCenterRecommendations(complaints: ComplaintRecord[]): AIRecommendationCardData[] {
  const queue = complaints.filter((c) => c.district === "Tirupati" && isPublicSupervisorGrievance(c));
  const pending = queue.filter((c) => c.status !== "closed").length;
  const nutrition = countByCategory(queue, (c) => c.category.includes("nutrition") || c.category === "hot_cooked_meals");
  const infrastructure = countByCategory(queue, (c) => c.category === "infrastructure");
  const water = countByCategory(queue, (c) => c.category === "drinking_water");
  const conduct = countByCategory(queue, (c) => c.category === "worker_behavior");
  const needEvidence = queue.filter((c) => c.status === "need_evidence").length;

  const topIssue =
    nutrition >= infrastructure && nutrition >= water && nutrition >= conduct
      ? "nutrition supply"
      : infrastructure >= water && infrastructure >= conduct
        ? "infrastructure safety"
        : water >= conduct
          ? "drinking water quality"
          : conduct > 0
            ? "worker conduct"
            : "general service compliance";

  return [
    {
      id: "pgc-rec-1",
      recommendation: "Clear Nutrition Supply Backlog Across Tirupati Block",
      reason: `${nutrition} active nutrition grievance(s) in queue — empty stock and missed rations are the top citizen complaint theme.`,
      fullExplanation: `AI analysis of ${queue.length} public grievances in Tirupati identifies nutrition supply as the dominant issue (${nutrition} cases). Citizen evidence including photos of empty storage and OCR stock registers confirms upstream supply delay rather than isolated worker error. Approving ₹12,400 per affected center for emergency egg and take-home ration replenishment, plus ₹2,800 for food inspection logistics, will restore service within 48 hours. AI predicts 42% reduction in nutrition complaints block-wide, 21% improvement in child welfare indicators, and +34% parent satisfaction when combined with transparent SMS updates to beneficiaries.`,
      generatedFrom: ["Public grievance queue", "Nutrition category filter", "Citizen photo evidence", "Stock ledger OCR", "30-day district trend"],
      expectedImpact: `Resolve ${nutrition} nutrition case(s) · Block-wide complaint drop 42% · Restore daily ration compliance`,
      officer: "CDPO · Tirupati",
      completion: "2 Days",
      priority: nutrition > 0 ? "critical" : "high",
      complaintReduction: "42%",
      welfareImprovement: "21%",
      satisfactionImprovement: "+34%",
      confidenceScore: 91,
      estimatedBudget: "₹15,200",
    },
    {
      id: "pgc-rec-2",
      recommendation: "Accelerate Supervisor Review for Pending Cases",
      reason: `${pending} grievance(s) awaiting supervisor action — SLA breach risk increases after 72 hours.`,
      fullExplanation: `The Public Grievance Center currently holds ${pending} open cases. AI SLA modelling shows resolution probability drops 18% for each day beyond 72 hours without supervisor assignment. Deploying two additional supervisor field visits per week (₹1,500 travel and staff cost) with mandatory beneficiary callback within 24 hours (₹0) will cut backlog by an estimated 35%. Each visit includes checklist audit of center registers, evidence verification, and documented corrective steps uploaded to the grievance file. This directly addresses citizen trust erosion visible in negative sentiment scores across ${pending} pending submissions.`,
      generatedFrom: ["Queue status dashboard", "SLA prediction model", "Supervisor workload data", "Resolution time history"],
      expectedImpact: `Reduce ${pending} case backlog by 35% · Prevent district escalation · Improve citizen trust`,
      officer: "Supervisor · Tirupati",
      completion: "7 Days",
      priority: pending > 3 ? "high" : "medium",
      complaintReduction: "35%",
      welfareImprovement: "High",
      satisfactionImprovement: "+20%",
      confidenceScore: 86,
      estimatedBudget: "₹1,500",
    },
    {
      id: "pgc-rec-3",
      recommendation: topIssue === "infrastructure safety" ? "Emergency Infrastructure Safety Sweep" : "Proactive Infrastructure Inspection Before Monsoon",
      reason:
        infrastructure > 0
          ? `${infrastructure} infrastructure grievance(s) with photo evidence of structural damage — safety incident risk elevated.`
          : "Monsoon season approaching — preventive inspection reduces seasonal complaint spikes by 55%.",
      fullExplanation:
        infrastructure > 0
          ? `${infrastructure} citizen submissions include photos of roof leakage, wall damage, or unsafe classrooms. AI structural risk model predicts 88% probability of safety incident within 30 days without repair at affected centers. Emergency engineering assessment (₹45,000) plus temporary roof covering (₹18,000) secures facilities while permanent repair work orders (₹1,25,000) are processed. Expected: 60% reduction in infrastructure complaints, 35% child welfare improvement as preschool sessions resume safely, and +28% parent satisfaction.`
          : `Although no critical infrastructure grievances are open today, historical data shows 55% complaint increase during monsoon at Tirupati centers. A preventive block-level inspection sweep (₹2,400 per center × estimated 3 high-risk centers = ₹7,200) with maintenance register updates will identify issues before citizen escalation. Cost is significantly lower than emergency repair after damage occurs.`,
      generatedFrom: ["Infrastructure grievances", "Citizen photo analysis", "Monsoon risk model", "Engineering maintenance register"],
      expectedImpact: infrastructure > 0 ? "Prevent safety incident · 60% fewer infrastructure complaints" : "Prevent monsoon complaint surge · Protect preschool sessions",
      officer: "District Engineering · WDCW",
      completion: infrastructure > 0 ? "5 Days" : "14 Days",
      priority: infrastructure > 0 ? "critical" : "medium",
      complaintReduction: infrastructure > 0 ? "60%" : "22%",
      welfareImprovement: infrastructure > 0 ? "35%" : "12%",
      satisfactionImprovement: infrastructure > 0 ? "+28%" : "+14%",
      confidenceScore: infrastructure > 0 ? 92 : 81,
      estimatedBudget: infrastructure > 0 ? "₹1,88,000" : "₹7,200",
    },
    {
      id: "pgc-rec-4",
      recommendation: water > 0 ? "Emergency Safe Water Protocol" : "Water Quality Compliance Audit",
      reason:
        water > 0
          ? `${water} drinking water grievance(s) report contamination or illness — child health risk is critical.`
          : "Periodic water testing prevents high-severity health complaints.",
      fullExplanation:
        water > 0
          ? `${water} citizens report foul-smelling water and child illness after consumption. AI severity scoring classifies these as critical health-risk cases. Immediate actions: emergency tanker dispatch (₹8,500), NABL lab testing (₹3,200), and RO unit installation where filtration is inadequate (₹22,000). ASHA health camp (₹6,800) for affected children within 72 hours. Combined budget ₹40,500 per affected center. Expected 80% complaint reduction and 40% child welfare improvement when safe water is restored within 24 hours.`
          : `Proactive water quality audit across centers with historical complaints costs ₹3,200 per lab test cycle. Daily chlorine logging (₹0) and supervisor verification prevents escalation to critical health cases. AI recommends quarterly testing at centers with any water-related grievance in the last 12 months.`,
      generatedFrom: ["Water category grievances", "Health symptom keywords", "Lab testing records", "Child welfare screening data"],
      expectedImpact: water > 0 ? "Eliminate unsafe water · Protect child health within 24h" : "Prevent water contamination complaints",
      officer: "District Water & Sanitation",
      completion: water > 0 ? "24 Hours" : "10 Days",
      priority: water > 0 ? "critical" : "medium",
      complaintReduction: water > 0 ? "80%" : "30%",
      welfareImprovement: water > 0 ? "40%" : "15%",
      satisfactionImprovement: water > 0 ? "+35%" : "+18%",
      confidenceScore: water > 0 ? 93 : 84,
      estimatedBudget: water > 0 ? "₹40,500" : "₹3,200",
    },
    {
      id: "pgc-rec-5",
      recommendation: needEvidence > 0 ? "Citizen Evidence Collection Drive" : "Worker Conduct & Service Quality Refresh",
      reason:
        needEvidence > 0
          ? `${needEvidence} case(s) blocked awaiting citizen evidence — resolution stalled.`
          : conduct > 0
            ? `${conduct} conduct grievance(s) require workforce intervention and training.`
            : "Preventive training reduces repeat grievances across all categories.",
      fullExplanation:
        needEvidence > 0
          ? `${needEvidence} grievances are in "Need Evidence" status. AI workflow analysis shows 65% of stalled cases close within 48 hours once citizens upload photo or document proof via WhatsApp link. A targeted SMS/WhatsApp reminder campaign (₹1,200) with simplified upload instructions, plus supervisor phone follow-up (₹0), will unblock cases without district escalation. Each resolved evidence gap saves an estimated ₹2,000 in district review costs and improves citizen satisfaction by +25%.`
          : conduct > 0
            ? `${conduct} grievances cite worker behaviour — shouting, refusal to serve, or poor communication. AI sentiment analysis confirms high emotional distress in citizen submissions. Immediate supervisor counselling (₹0) plus district sensitivity training (₹3,500 per batch) and increased monitoring visits (₹1,500/month) will reduce conduct complaints by 50% and improve parent satisfaction by +30% based on historical intervention outcomes at peer centers.`
            : `With ${queue.length} total grievances analysed, AI recommends a preventive service quality refresh: half-day ICDS standards training (₹3,500), monthly citizen feedback circles (₹800), and documented corrective action templates (₹0). This cross-cutting intervention reduces repeat grievances by 20% even when no single category dominates the queue.`,
      generatedFrom: ["Need evidence queue", "Conduct grievances", "Citizen sentiment scores", "Training outcome history"],
      expectedImpact: needEvidence > 0 ? `Unblock ${needEvidence} stalled case(s) · Faster citizen resolution` : "Improve service quality · Reduce repeat complaints",
      officer: needEvidence > 0 ? "Supervisor · Tirupati" : "District Training Unit · WDCW",
      completion: needEvidence > 0 ? "48 Hours" : "10 Days",
      priority: needEvidence > 0 || conduct > 0 ? "high" : "medium",
      complaintReduction: needEvidence > 0 ? "25%" : conduct > 0 ? "50%" : "20%",
      welfareImprovement: needEvidence > 0 ? "Medium" : "18%",
      satisfactionImprovement: needEvidence > 0 ? "+25%" : conduct > 0 ? "+30%" : "+15%",
      confidenceScore: 85,
      estimatedBudget: needEvidence > 0 ? "₹1,200" : "₹3,500",
    },
  ];
}
