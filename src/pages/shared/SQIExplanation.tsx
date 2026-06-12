import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockCenters } from "@/data/mockData";
import { explainSQI } from "@/services/ai/explainability";
import { ExplainabilityFramework } from "@/components/explainability";

export default function SQIExplanation() {
  const { id } = useParams();
  const { serviceQualityScores, childWellnessIndexes } = useApp();
  const score = serviceQualityScores.find((s) => s.centerId === id);
  const center = mockCenters.find((c) => c.id === id);
  const cwi = childWellnessIndexes.find((w) => w.centerId === id);
  if (!score) return <div className="p-10">SQI record not found</div>;
  return (
    <div className="space-y-6 pb-20 w-full max-w-none">
      <Link to="/state-admin/mission-control" className="text-xs font-black uppercase text-blue-600">← Mission Control</Link>
      <h1 className="text-2xl font-black uppercase">Service Quality Index Explanation</h1>
      {cwi && (
        <div className="rounded-xl border bg-teal-50 p-4 text-sm">
          <strong>Child Wellness Index (CWI):</strong> {cwi.cwiScore} — attendance {cwi.attendanceComponent}%, nutrition {cwi.nutritionComponent}%, participation {cwi.participationComponent}%
        </div>
      )}
      <ExplainabilityFramework explanation={explainSQI(score, center)} />
    </div>
  );
}
