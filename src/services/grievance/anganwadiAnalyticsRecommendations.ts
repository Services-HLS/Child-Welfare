import { ComplaintRecord } from "@/types/platform";
import { AIRecommendationCardData } from "@/components/executive/AIRecommendationCard";
import { mockCenters } from "@/data/mockData";

function countBy(list: ComplaintRecord[], match: (c: ComplaintRecord) => boolean) {
  return list.filter(match).length;
}

/** District-wide AI recommendations from all grievances across Anganwadi centers. */
export function buildDistrictAnalyticsRecommendations(
  complaints: ComplaintRecord[],
  district: string
): AIRecommendationCardData[] {
  const all = complaints.filter((c) => c.district === district);
  const pending = all.filter((c) => c.status !== "closed").length;
  const resolved = all.filter((c) => c.status === "closed").length;
  const centers = mockCenters.filter((c) => c.district === district);
  const highPriority = countBy(all, (c) => c.priority === "critical" || c.priority === "high" || (c.urgencyScore ?? 0) > 0.7);
  const nutrition = countBy(all, (c) => c.category.includes("nutrition") || c.category === "hot_cooked_meals");
  const infrastructure = countBy(all, (c) => c.category === "infrastructure");
  const water = countBy(all, (c) => c.category === "drinking_water");
  const conduct = countBy(all, (c) => c.category === "worker_behavior");
  const education = countBy(all, (c) => c.category === "education" || c.category.includes("preschool"));

  const centerCounts: Record<string, number> = {};
  all.forEach((c) => {
    centerCounts[c.centerId] = (centerCounts[c.centerId] ?? 0) + 1;
  });
  const hotCenter = Object.entries(centerCounts).sort((a, b) => b[1] - a[1])[0];
  const hotCenterName = centers.find((c) => c.id === hotCenter?.[0])?.name ?? "highest-risk center";

  return [
    {
      id: "analytics-district-1",
      recommendation: "District Nutrition Supply Stabilization Program",
      reason: `${nutrition} of ${all.length} district grievance(s) relate to nutrition — highest cross-center complaint theme.`,
      fullExplanation: `Anganwadi Analytics analysed ${all.length} grievances across ${centers.length} centers in ${district}. Nutrition supply gaps appear in ${nutrition} case(s), spanning multiple centers. AI recommends a district nutrition officer-led stabilization: emergency ration replenishment (₹28,500 per affected center), weekly stock audits (₹2,800 per inspection cycle), and ICDS supply chain alerts (₹0 system trigger). ${hotCenterName} shows the highest volume and should be prioritized first. Expected district-wide outcomes: 38% reduction in nutrition complaints, 19% child welfare indicator improvement, and +22% parent satisfaction within 30 days.`,
      generatedFrom: [`${all.length} district grievances`, "Category breakdown", "Center heat map", "Stock ledger trends", "Citizen evidence corpus"],
      expectedImpact: `Address ${nutrition} nutrition grievance(s) · District complaint drop 38% · Restore ration compliance`,
      officer: "District Nutrition Officer · WDCW",
      completion: "7 Days",
      priority: nutrition > 0 ? "critical" : "high",
      complaintReduction: "38%",
      welfareImprovement: "19%",
      satisfactionImprovement: "+22%",
      confidenceScore: 89,
      estimatedBudget: nutrition > 0 ? "₹31,300" : "₹12,400",
    },
    {
      id: "analytics-district-2",
      recommendation: "Cross-Center Supervisor Resolution Sprint",
      reason: `${pending} pending grievance(s) district-wide — ${highPriority} marked high or critical priority.`,
      fullExplanation: `With ${pending} open grievances and ${resolved} resolved across ${district}, AI SLA modelling predicts backlog growth unless a 14-day resolution sprint is launched. Assign supervisors to clear oldest cases first with mandatory beneficiary callbacks within 24 hours (₹0) and two extra field visits per high-risk center (₹1,500 per center). Analytics show pending cases cluster at ${hotCenterName} (${hotCenter?.[1] ?? 0} cases). Sprint target: reduce district pending queue by 40% and prevent ${Math.max(1, Math.floor(pending * 0.2))} district escalations.`,
      generatedFrom: ["Pending vs resolved ratio", "SLA breach model", "Center complaint distribution", "Supervisor capacity data"],
      expectedImpact: `Clear ${pending} pending case(s) · 40% backlog reduction · Fewer escalations`,
      officer: "Supervisor · Tirupati Block",
      completion: "14 Days",
      priority: pending > 2 ? "high" : "medium",
      complaintReduction: "40%",
      welfareImprovement: "High",
      satisfactionImprovement: "+18%",
      confidenceScore: 86,
      estimatedBudget: `₹${(centers.length * 1500).toLocaleString("en-IN")}`,
    },
    {
      id: "analytics-district-3",
      recommendation: infrastructure > 0 ? "District Infrastructure Safety Blitz" : "Pre-Monsoon Infrastructure Preventive Sweep",
      reason:
        infrastructure > 0
          ? `${infrastructure} infrastructure grievance(s) across centers — structural safety risk before monsoon.`
          : "Analytics predict monsoon-season infrastructure complaint spike — preventive action recommended.",
      fullExplanation:
        infrastructure > 0
          ? `${infrastructure} grievances cite roof damage, leaking classrooms, or unsafe buildings across ${centers.length} centers. AI structural risk model recommends emergency engineering assessments (₹45,000 per affected center), temporary roof covering (₹18,000), and permanent repair work orders (₹1,25,000 where damage confirmed). Total district budget estimate depends on inspection outcomes — initial sweep budget ₹63,000 for top 2 at-risk centers including ${hotCenterName}.`
          : `Historical analytics show 55% infrastructure complaint increase during monsoon across ${district}. Preventive inspection sweep across ${centers.length} centers (₹7,200 total) with maintenance register updates will identify issues before citizen escalation. Cost is significantly lower than emergency repair after damage.`,
      generatedFrom: ["Infrastructure grievance register", "Photo evidence analysis", "Monsoon risk forecast", "Engineering audit history"],
      expectedImpact: infrastructure > 0 ? "Prevent safety incidents · 55% fewer infrastructure complaints" : "Prevent monsoon surge · Protect preschool sessions",
      officer: "District Engineering · WDCW",
      completion: infrastructure > 0 ? "10 Days" : "21 Days",
      priority: infrastructure > 0 ? "critical" : "medium",
      complaintReduction: infrastructure > 0 ? "55%" : "24%",
      welfareImprovement: infrastructure > 0 ? "32%" : "14%",
      satisfactionImprovement: infrastructure > 0 ? "+26%" : "+12%",
      confidenceScore: infrastructure > 0 ? 91 : 80,
      estimatedBudget: infrastructure > 0 ? "₹1,88,000" : "₹7,200",
    },
    {
      id: "analytics-district-4",
      recommendation: water > 0 ? "District Safe Water Emergency Protocol" : "Quarterly Water Quality Compliance Program",
      reason:
        water > 0
          ? `${water} drinking water grievance(s) — child health risk flagged in citizen submissions.`
          : "Proactive water testing prevents high-severity health complaints across centers.",
      fullExplanation:
        water > 0
          ? `${water} grievances report contaminated or foul water with child health symptoms. District protocol: emergency tanker dispatch (₹8,500 per center), NABL lab testing (₹3,200), RO unit installation where needed (₹22,000), and ASHA health camps (₹6,800). Analytics cross-reference ${all.length} total grievances to identify centers needing immediate action versus scheduled upgrade.`
          : `Across ${all.length} analysed grievances, water issues remain a latent risk. Quarterly lab testing (₹3,200 per cycle) and daily chlorine logging (₹0) at all ${centers.length} centers prevents escalation to critical health cases.`,
      generatedFrom: ["Water category grievances", "Health symptom NLP analysis", "Lab testing records", "Center water facility registry"],
      expectedImpact: water > 0 ? "Eliminate unsafe water · Protect child health" : "Prevent water-related escalations",
      officer: "District Water & Sanitation",
      completion: water > 0 ? "5 Days" : "30 Days",
      priority: water > 0 ? "critical" : "medium",
      complaintReduction: water > 0 ? "72%" : "28%",
      welfareImprovement: water > 0 ? "38%" : "16%",
      satisfactionImprovement: water > 0 ? "+32%" : "+16%",
      confidenceScore: water > 0 ? 92 : 83,
      estimatedBudget: water > 0 ? "₹40,500" : "₹9,600",
    },
    {
      id: "analytics-district-5",
      recommendation:
        conduct > 0 || education > 0
          ? "Workforce & Service Quality District Intervention"
          : "District-Wide Beneficiary Trust & Transparency Drive",
      reason:
        conduct > 0
          ? `${conduct} worker conduct grievance(s) affecting parent trust across centers.`
          : education > 0
            ? `${education} education/preschool grievance(s) — session delivery gaps identified.`
            : `${all.length} grievances analysed — proactive trust-building reduces repeat submissions.`,
      fullExplanation:
        conduct > 0
          ? `Analytics identify ${conduct} conduct-related grievances across ${district}. Combined intervention: supervisor counselling (₹0), district sensitivity training (₹3,500 per batch), unannounced monitoring visits (₹1,500/month per center), and citizen feedback circles (₹800). Applied across ${centers.length} centers, this addresses the second-largest complaint driver after nutrition and is projected to reduce conduct grievances by 45%.`
          : education > 0
            ? `${education} grievances cite missed preschool sessions or poor engagement. District ECCE coordinator visits (₹3,500), session observation audits (₹1,500), and parent session calendars via SMS (₹1,200) will restore daily preschool delivery. Analytics link session gaps to 55% complaint recurrence within 14 days if uncorrected.`
            : `Analysis of all ${all.length} grievances shows trust erosion when citizens lack visibility into resolution. District-wide transparency drive: SMS status updates (₹1,200), monthly center open days (₹800 per center), and published resolution summaries on public dashboard (₹0). Expected 25% reduction in repeat grievances and +20% satisfaction improvement.`,
      generatedFrom: ["Conduct & education grievances", "Sentiment analysis", "Repeat submission patterns", "Beneficiary feedback scores"],
      expectedImpact: conduct > 0 ? "Restore parent trust · 45% fewer conduct complaints" : education > 0 ? "Restore daily preschool · 55% fewer education complaints" : "Reduce repeat grievances · Improve transparency",
      officer: conduct > 0 ? "District Training Unit · WDCW" : education > 0 ? "District ECCE Coordinator" : "CDPO · Tirupati",
      completion: "10 Days",
      priority: conduct > 0 || education > 0 ? "high" : "medium",
      complaintReduction: conduct > 0 ? "45%" : education > 0 ? "55%" : "25%",
      welfareImprovement: "18%",
      satisfactionImprovement: conduct > 0 ? "+28%" : education > 0 ? "+30%" : "+20%",
      confidenceScore: 85,
      estimatedBudget: conduct > 0 ? "₹5,800" : education > 0 ? "₹6,200" : "₹2,000",
    },
  ];
}
