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

/** Center-specific AI recommendations from all grievances at one Anganwadi center. */
export function buildCenterAnalyticsRecommendations(
  complaints: ComplaintRecord[],
  centerId: string
): AIRecommendationCardData[] {
  const center = mockCenters.find((c) => c.id === centerId);
  const centerName = center?.name ?? centerId;
  const all = complaints.filter((c) => c.centerId === centerId);
  const pending = all.filter((c) => c.status !== "closed").length;
  const resolved = all.filter((c) => c.status === "closed").length;
  const highPriority = countBy(all, (c) => c.priority === "critical" || c.priority === "high" || (c.urgencyScore ?? 0) > 0.7);
  const nutrition = countBy(all, (c) => c.category.includes("nutrition") || c.category === "hot_cooked_meals");
  const infrastructure = countBy(all, (c) => c.category === "infrastructure");
  const water = countBy(all, (c) => c.category === "drinking_water");
  const conduct = countBy(all, (c) => c.category === "worker_behavior");
  const education = countBy(all, (c) => c.category === "education" || c.category.includes("preschool"));
  const anonymous = countBy(all, (c) => c.anonymous || c.beneficiaryName === "Anonymous Citizen");

  if (all.length === 0) {
    return [
      {
        id: `${centerId}-baseline-1`,
        recommendation: "Baseline Monitoring & Preventive Compliance Audit",
        reason: `No grievances recorded yet at ${centerName} — establish preventive oversight.`,
        fullExplanation: `Anganwadi Analytics found no citizen grievances for ${centerName}. AI recommends a baseline compliance audit: nutrition stock verification (₹2,800), water quality check (₹3,200), and parent feedback circle (₹800). This prevents first-time escalations and maintains trust before issues arise.`,
        generatedFrom: ["Center registry", "Compliance score", "Preventive analytics model"],
        expectedImpact: "Prevent first grievances · Maintain center health score",
        officer: "Supervisor · Tirupati Block",
        completion: "14 Days",
        priority: "medium",
        complaintReduction: "Preventive",
        welfareImprovement: "12%",
        satisfactionImprovement: "+10%",
        confidenceScore: 82,
        estimatedBudget: "₹6,800",
      },
    ];
  }

  return [
    {
      id: `${centerId}-rec-1`,
      recommendation: nutrition > 0 ? "Emergency Nutrition Replenishment at Center" : "Nutrition Stock Compliance Review",
      reason:
        nutrition > 0
          ? `${nutrition} of ${all.length} grievance(s) at ${centerName} relate to nutrition or meals.`
          : `Proactive nutrition audit recommended based on ${all.length} grievance(s) analysed at this center.`,
      fullExplanation: `AI analysed all ${all.length} grievance(s) submitted for ${centerName}. ${nutrition} case(s) cite missing meals, ration gaps, or egg distribution failures. Recommended action: emergency ration replenishment (₹28,500), weekly stock register audit (₹2,800), and supervisor verification visit (₹750). Expected: 40% reduction in nutrition complaints at this center within 30 days and measurable improvement in child nutrition indicators.`,
      generatedFrom: [`${all.length} center grievances`, "Nutrition category breakdown", "Citizen photo evidence", "Stock ledger"],
      expectedImpact: nutrition > 0 ? `Resolve ${nutrition} nutrition grievance(s) · 40% complaint drop` : "Prevent nutrition escalations",
      officer: "District Nutrition Officer · WDCW",
      completion: "7 Days",
      priority: nutrition > 0 ? "critical" : "medium",
      complaintReduction: nutrition > 0 ? "40%" : "20%",
      welfareImprovement: nutrition > 0 ? "High" : "Medium",
      satisfactionImprovement: nutrition > 0 ? "+22%" : "+12%",
      confidenceScore: nutrition > 0 ? 90 : 82,
      estimatedBudget: nutrition > 0 ? "₹32,050" : "₹2,800",
    },
    {
      id: `${centerId}-rec-2`,
      recommendation: pending > 0 ? "Supervisor Resolution Sprint for Pending Cases" : "Maintain Resolution SLA Compliance",
      reason:
        pending > 0
          ? `${pending} pending grievance(s) at ${centerName} — ${highPriority} marked high or critical.`
          : `All ${resolved} grievance(s) resolved — maintain SLA compliance at ${centerName}.`,
      fullExplanation: `At ${centerName}, ${pending} grievance(s) remain open of ${all.length} total submissions. AI SLA modelling recommends a 14-day resolution sprint: oldest cases first, mandatory beneficiary callbacks within 24 hours (₹0), and two extra supervisor visits (₹1,500). ${highPriority} high-priority case(s) require immediate assignment. Target: 40% backlog reduction at this center.`,
      generatedFrom: ["Pending vs resolved ratio", "SLA breach model", "Center grievance register"],
      expectedImpact: pending > 0 ? `Clear ${pending} pending case(s) · 40% backlog reduction` : "Sustain resolution performance",
      officer: "Supervisor · Tirupati Block",
      completion: "14 Days",
      priority: pending > 2 ? "high" : "medium",
      complaintReduction: pending > 0 ? "40%" : "10%",
      welfareImprovement: "High",
      satisfactionImprovement: "+18%",
      confidenceScore: 86,
      estimatedBudget: pending > 0 ? "₹1,500" : "₹0",
    },
    {
      id: `${centerId}-rec-3`,
      recommendation: infrastructure > 0 ? "Infrastructure Safety Repair at Center" : "Pre-Monsoon Infrastructure Inspection",
      reason:
        infrastructure > 0
          ? `${infrastructure} infrastructure grievance(s) at ${centerName} — structural safety risk.`
          : "Preventive inspection before monsoon season at this center.",
      fullExplanation: `${infrastructure > 0 ? `${infrastructure} grievances cite roof damage, leaking classrooms, or unsafe buildings at ${centerName}.` : `Analytics predict infrastructure complaint spike during monsoon at ${centerName}.`} Engineering assessment (₹45,000 if damage confirmed), temporary roof covering (₹18,000), and maintenance register update recommended based on all ${all.length} grievances analysed.`,
      generatedFrom: ["Infrastructure grievances at center", "Photo evidence", "Monsoon risk forecast"],
      expectedImpact: infrastructure > 0 ? "Prevent safety incidents · 55% fewer infrastructure complaints" : "Prevent monsoon surge",
      officer: "District Engineering · WDCW",
      completion: infrastructure > 0 ? "10 Days" : "21 Days",
      priority: infrastructure > 0 ? "critical" : "medium",
      complaintReduction: infrastructure > 0 ? "55%" : "24%",
      welfareImprovement: infrastructure > 0 ? "32%" : "14%",
      satisfactionImprovement: infrastructure > 0 ? "+26%" : "+12%",
      confidenceScore: infrastructure > 0 ? 91 : 80,
      estimatedBudget: infrastructure > 0 ? "₹63,000" : "₹7,200",
    },
    {
      id: `${centerId}-rec-4`,
      recommendation: water > 0 ? "Safe Water Emergency Protocol at Center" : "Quarterly Water Quality Testing",
      reason:
        water > 0
          ? `${water} drinking water grievance(s) at ${centerName} — child health risk.`
          : "Proactive water testing at this center based on grievance history.",
      fullExplanation: `${water > 0 ? `${water} grievances report contaminated or foul water at ${centerName} with child health symptoms.` : `Water issues remain a latent risk at ${centerName} based on ${all.length} analysed grievances.`} Emergency tanker (₹8,500), NABL lab testing (₹3,200), RO unit if needed (₹22,000).`,
      generatedFrom: ["Water category grievances", "Health symptom analysis", "Center water facility registry"],
      expectedImpact: water > 0 ? "Eliminate unsafe water · Protect child health" : "Prevent water escalations",
      officer: "District Water & Sanitation",
      completion: water > 0 ? "5 Days" : "30 Days",
      priority: water > 0 ? "critical" : "medium",
      complaintReduction: water > 0 ? "72%" : "28%",
      welfareImprovement: water > 0 ? "38%" : "16%",
      satisfactionImprovement: water > 0 ? "+32%" : "+16%",
      confidenceScore: water > 0 ? 92 : 83,
      estimatedBudget: water > 0 ? "₹33,700" : "₹3,200",
    },
    {
      id: `${centerId}-rec-5`,
      recommendation:
        conduct > 0
          ? "Worker Conduct & Service Quality Intervention"
          : education > 0
            ? "Preschool Session Delivery Improvement"
            : anonymous > 0
              ? "Anonymous Grievance Verification & Trust Outreach"
              : "Beneficiary Trust & Transparency Drive",
      reason:
        conduct > 0
          ? `${conduct} worker conduct grievance(s) at ${centerName} affecting parent trust.`
          : education > 0
            ? `${education} education grievance(s) at ${centerName} — session delivery gaps.`
            : anonymous > 0
              ? `${anonymous} anonymous submission(s) at ${centerName} require extra verification.`
              : `${all.length} grievance(s) analysed — proactive trust-building recommended.`,
      fullExplanation: conduct > 0
        ? `${conduct} conduct grievances at ${centerName} from ${all.length} total submissions. Supervisor counselling (₹0), sensitivity training (₹3,500), and unannounced monitoring (₹1,500/month) projected to reduce conduct complaints by 45%.`
        : education > 0
          ? `${education} education grievances cite missed preschool sessions at ${centerName}. ECCE coordinator visit (₹3,500) and session observation audit (₹1,500) will restore daily delivery.`
          : anonymous > 0
            ? `${anonymous} anonymous grievance(s) at ${centerName} require verification before field action. Supervisor outreach and evidence cross-check (₹1,200) while protecting citizen privacy.`
            : `Analysis of all ${all.length} grievances at ${centerName} shows trust improves with visible resolution updates. SMS status alerts (₹1,200) and monthly open day (₹800) recommended.`,
      generatedFrom: ["Conduct & education grievances", "Anonymous submission patterns", "Sentiment analysis", "Repeat submission data"],
      expectedImpact: conduct > 0 ? "Restore parent trust · 45% fewer conduct complaints" : education > 0 ? "Restore daily preschool" : "Improve verification & trust",
      officer: conduct > 0 ? "District Training Unit · WDCW" : education > 0 ? "District ECCE Coordinator" : "Supervisor · Tirupati Block",
      completion: "10 Days",
      priority: conduct > 0 || water > 0 ? "high" : "medium",
      complaintReduction: conduct > 0 ? "45%" : education > 0 ? "55%" : "25%",
      welfareImprovement: "18%",
      satisfactionImprovement: conduct > 0 ? "+28%" : "+20%",
      confidenceScore: 85,
      estimatedBudget: conduct > 0 ? "₹5,000" : education > 0 ? "₹5,000" : "₹2,000",
    },
  ];
}
