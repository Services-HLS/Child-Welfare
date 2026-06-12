import { ReactNode } from "react";
import { GovCard } from "./GovCard";

/** Four-zone government situation room */
export function SituationRoomLayout({
  executiveSummary,
  operationalMetrics,
  alertsAndActions,
  detailedInsights,
}: {
  executiveSummary: ReactNode;
  operationalMetrics: ReactNode;
  alertsAndActions: ReactNode;
  detailedInsights: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <GovCard title="Executive Summary" subtitle="State of operations at a glance">
        {executiveSummary}
      </GovCard>
      <GovCard title="Operational Metrics" subtitle="Centers covered, service quality, and compliance indicators">
        {operationalMetrics}
      </GovCard>
      <div className="grid lg:grid-cols-2 gap-5">
        <GovCard title="Notifications & Actions Required" subtitle="Priority tasks for officials">
          {alertsAndActions}
        </GovCard>
        <GovCard title="Detailed Insights" subtitle="Recommendations and trend analysis">
          {detailedInsights}
        </GovCard>
      </div>
    </div>
  );
}
