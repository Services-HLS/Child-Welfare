import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { PublicGovHeader } from "@/components/gov/PublicGovHeader";
import { GovCard } from "@/components/gov/GovCard";
import { ShieldCheck, Heart, CheckCircle2, GraduationCap, MapPin, MessageSquare, HelpCircle, Phone, FileText } from "lucide-react";

const SECTIONS = [
  { id: "about", title: "About the Department", icon: ShieldCheck },
  { id: "services", title: "Services Delivered", icon: CheckCircle2 },
  { id: "dashboard", title: "Public Dashboard", icon: MapPin },
  { id: "channels", title: "Feedback Channels", icon: MessageSquare },
  { id: "faq", title: "FAQ", icon: HelpCircle },
  { id: "transparency", title: "Data Transparency", icon: FileText },
  { id: "contact", title: "Contact Information", icon: Phone },
  { id: "commitments", title: "Service Commitments", icon: Heart },
];

export default function TransparencyPortal() {
  const { publicTransparency, platformOutcomes, excellenceIndexes, complaints, sessions, feedback } = useApp();
  const t = publicTransparency;
  const openG = complaints.filter((c) => c.status !== "closed").length;
  const resolvedPct = complaints.length
    ? Math.round((complaints.filter((c) => c.status === "closed").length / complaints.length) * 100)
    : 0;
  const aiSessions = sessions.filter((s) => s.scorecard).length;
  const avgRating =
    feedback.length > 0 ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <PublicGovHeader />
      <div className="w-full max-w-none px-4 py-6 space-y-6">
        <div className="border border-slate-200 bg-white p-5">
          <h1 className="text-2xl font-bold text-[#0F172A]">Public Information & Transparency Portal</h1>
          <p className="text-sm text-slate-600 mt-2">Anonymized statewide metrics — no personal data published. Last updated {new Date(t.lastUpdated).toLocaleString()}</p>
        </div>

        <nav className="flex flex-wrap gap-2 text-[11px] font-semibold">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="gov-btn-outline py-1 px-2">{s.title}</a>
          ))}
        </nav>

        <section id="about">
          <GovCard title="About the Department" subtitle="Women Development and Child Welfare Department, Government of Andhra Pradesh">
            <p className="text-sm text-slate-700 leading-relaxed">
              AnganSakti 360 supports Anganwadi service delivery, beneficiary feedback, grievance resolution, and workforce development
              across Andhra Pradesh. The platform is designed for transparency, accountability, and continuous improvement — not punitive ranking.
            </p>
          </GovCard>
        </section>

        <section id="services">
          <GovCard title="Services Delivered" subtitle="Aggregate program reach (anonymized)">
            <p className="text-2xl font-bold text-[#0F172A]">{t.servicesDelivered.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Verified service events indexed statewide</p>
          </GovCard>
        </section>

        <section id="district-stats">
          <GovCard title="Andhra Pradesh — District Service Dashboard" subtitle="Aggregated · no personal data">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Avg grievance resolution", value: "4.2 days (pilot)" },
                { label: "Resolved %", value: `${resolvedPct}%` },
                { label: "Open grievances", value: String(openG) },
                { label: "AI classroom sessions", value: String(aiSessions) },
                { label: "Citizen satisfaction (avg)", value: `${avgRating} / 5` },
                { label: "Supervisor-first routing", value: "100% public cases" },
                { label: "Centers reporting", value: String(excellenceIndexes.length) },
                { label: "Service quality index", value: `${platformOutcomes.trustScore}%` },
              ].map((m) => (
                <div key={m.label} className="border border-[#1e3a5f]/20 p-3 bg-blue-50/30">
                  <div className="text-lg font-bold text-[#0F172A]">{m.value}</div>
                  <div className="text-[10px] font-bold uppercase text-slate-600 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Public grievances route to supervisors with AI explainability and geospatial evidence validation — workers remain on service delivery.
            </p>
          </GovCard>
        </section>

        <section id="dashboard">
          <GovCard title="Public Dashboard" subtitle="Key performance indicators">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Grievance resolution rate", value: `${t.grievanceResolutionRate}%` },
                { label: "Beneficiary satisfaction", value: `${t.beneficiarySatisfaction}%` },
                { label: "Training modules completed", value: String(t.trainingModulesCompleted) },
                { label: "District improvement", value: `+${t.districtImprovementPct}%` },
                { label: "Average excellence index", value: `${platformOutcomes.aeiAvg}` },
                { label: "Trust indicator", value: `${platformOutcomes.trustScore}%` },
              ].map((m) => (
                <div key={m.label} className="border border-slate-200 p-3 bg-slate-50/50">
                  <div className="text-xl font-bold">{m.value}</div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </GovCard>
        </section>

        <section id="channels">
          <GovCard title="Feedback Channels" subtitle="How citizens can reach the department">
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
              <li>Mobile application and beneficiary portal</li>
              <li>IVR, SMS, WhatsApp, and QR intake at centers</li>
              <li>Written feedback and photo submission (OCR supported in pilot)</li>
              <li>In-person communication with Anganwadi worker</li>
            </ul>
          </GovCard>
        </section>

        <section id="faq">
          <GovCard title="Frequently Asked Questions">
            <dl className="text-sm space-y-3">
              <div><dt className="font-semibold">Is my child identified publicly?</dt><dd className="text-slate-600">No. Public dashboards use aggregate data only.</dd></div>
              <div><dt className="font-semibold">What does orange or red mean for a center?</dt><dd className="text-slate-600">Attention required for improvement — coaching and support are assigned, not punishment.</dd></div>
            </dl>
          </GovCard>
        </section>

        <section id="transparency">
          <GovCard title="Data Transparency" subtitle="AI usage in plain language">
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
              <li>Session observation provides teaching insights and suggested improvements</li>
              <li>Grievance routing shows confidence and SLA thresholds</li>
              <li>AEI, SQI, and CWI use published weights with supportive recommendations</li>
            </ul>
            <p className="text-xs text-slate-500 mt-3">{excellenceIndexes.filter((a) => a.band === "green").length} centers at green excellence band (anonymized)</p>
          </GovCard>
        </section>

        <section id="contact">
          <GovCard title="Contact Information">
            <p className="text-sm text-slate-700">WDCW Directorate, Government of Andhra Pradesh · Childline 1098</p>
            <p className="text-sm text-slate-600 mt-2">District officials: contact your District Women Development Agency office</p>
          </GovCard>
        </section>

        <section id="commitments">
          <GovCard title="Service Commitments">
            <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
              <li>Hot cooked meals and nutrition services as per scheme guidelines</li>
              <li>Preschool education and immunization support</li>
              <li>Grievance acknowledgement and resolution within published SLA</li>
              <li>Regular beneficiary feedback and transparency reporting</li>
            </ul>
          </GovCard>
        </section>

        <div className="flex flex-wrap gap-3 pb-8">
          <Link to="/" className="gov-btn-primary text-sm">Official Login</Link>
          <Link to="/impact" className="gov-btn-outline text-sm">Public Impact</Link>
          <Link to="/experience/hackathon" className="gov-btn-outline text-sm">Pilot Walkthrough</Link>
        </div>
      </div>
    </div>
  );
}
