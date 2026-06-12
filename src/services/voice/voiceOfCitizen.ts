import { VoiceOfCitizenInsights } from "@/types/intelligence";
import { FeedbackEntry, ComplaintRecord } from "@/types/platform";
import { OmnichannelInput } from "@/types/feedback-channels";
import { BeneficiarySurvey } from "@/types/intelligence";
import { mockCenters } from "@/data/mockData";

const CHANNEL_LABELS: Record<string, string> = {
  mobile_app: "Mobile app",
  ivr: "IVR calls",
  whatsapp: "WhatsApp",
  qr_form: "QR code intake",
  sms: "SMS",
  handwritten: "Handwritten / OCR",
  photo: "Photo upload",
  web_form: "Web form",
};

export function buildVoiceOfCitizenInsights(ctx: {
  feedback: FeedbackEntry[];
  complaints: ComplaintRecord[];
  omnichannel: OmnichannelInput[];
  surveys: BeneficiarySurvey[];
}): VoiceOfCitizenInsights {
  const byChannel: Record<string, number> = {};
  ctx.feedback.forEach((f) => {
    const ch = f.sourceChannel ?? "mobile_app";
    byChannel[ch] = (byChannel[ch] ?? 0) + 1;
  });
  ctx.omnichannel.forEach((o) => {
    byChannel[o.channel] = (byChannel[o.channel] ?? 0) + 1;
  });

  const catCount: Record<string, number> = {};
  ctx.feedback.forEach((f) => {
    catCount[f.category] = (catCount[f.category] ?? 0) + 1;
  });
  ctx.complaints.forEach((c) => {
    catCount[c.category] = (catCount[c.category] ?? 0) + 1;
  });
  const topIssues = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label: label.replace(/_/g, " "), count }));

  const positive = ctx.feedback.filter((f) => f.rating >= 4).map((f) => f.text.slice(0, 80));
  const negative = ctx.feedback.filter((f) => f.rating <= 2).map((f) => f.text.slice(0, 80));
  const avgSat = ctx.feedback.length ? ctx.feedback.reduce((a, f) => a + f.rating, 0) / ctx.feedback.length : 4;
  const recent = ctx.feedback.filter((f) => new Date(f.timestamp) > new Date(Date.now() - 14 * 86400_000));
  const recentAvg = recent.length ? recent.reduce((a, f) => a + f.rating, 0) / recent.length : avgSat;
  const sentimentTrend = recentAvg >= avgSat + 0.2 ? "improving" : recentAvg <= avgSat - 0.3 ? "declining" : "stable";

  const districts = [...new Set(mockCenters.map((c) => c.district))];
  const districtComparison = districts.map((district) => {
    const fb = ctx.feedback.filter((f) => mockCenters.find((c) => c.id === f.centerId)?.district === district);
    const score = fb.length ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length / 5) * 100 : 75;
    return { district, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);

  const infraCats = ["cleanliness", "infrastructure", "facility", "hot_cooked_meals"];
  const infrastructureIssues = topIssues
    .filter((t) => infraCats.some((c) => t.label.toLowerCase().includes(c.replace(/_/g, " "))))
    .map((t) => `${t.label} (${t.count} signals)`);

  const clusterMap: Record<string, Set<string>> = {};
  ctx.complaints.forEach((c) => {
    const k = c.category;
    if (!clusterMap[k]) clusterMap[k] = new Set();
    clusterMap[k].add(c.centerId);
  });
  const recurringClusters = Object.entries(clusterMap)
    .filter(([, set]) => set.size >= 2)
    .map(([label, set]) => ({ label: label.replace(/_/g, " "), centers: set.size }));

  const closed = ctx.complaints.filter((c) => c.status === "closed").length;
  const trustIndicator = Math.round(
    ((avgSat / 5) * 50 + (closed / Math.max(1, ctx.complaints.length)) * 50) * 100
  ) / 100;

  const aiSummary =
    sentimentTrend === "declining"
      ? `Beneficiary trust indicators are softening in the last 14 days. Top concerns: ${topIssues.slice(0, 3).map((t) => t.label).join(", ")}. Proactive outreach and grievance closure recommended before AEI satisfaction drops further.`
      : `Overall perception is ${sentimentTrend}. Parents praise ${positive.length ? "teaching and care" : "regular services"} while ${negative.length ? "meal and facility themes need attention" : "few critical themes"}. ${ctx.complaints.length} grievances converted to tracked resolutions.`;

  return {
    totalSignals: ctx.feedback.length + ctx.omnichannel.length + ctx.surveys.filter((s) => s.completedAt).length,
    byChannel: Object.fromEntries(Object.entries(byChannel).map(([k, v]) => [CHANNEL_LABELS[k] ?? k, v])),
    topIssues,
    positiveThemes: [...new Set(positive)].slice(0, 6),
    negativeThemes: [...new Set(negative)].slice(0, 6),
    recurringComplaints: ctx.complaints.filter((c) => (c.repeatCount ?? 0) >= 2).length,
    recurringClusters,
    infrastructureIssues,
    avgSatisfaction: Math.round(avgSat * 10) / 10,
    trustIndicator,
    serviceQualityPerception: Math.round((avgSat / 5) * 100),
    sentimentTrend,
    districtComparison,
    aiSummary,
    alertMessage:
      sentimentTrend === "declining"
        ? "Alert: beneficiary satisfaction decreasing — schedule surveys and supervisor visits before complaints spike"
        : undefined,
  };
}
