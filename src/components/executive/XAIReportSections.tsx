import { XAIModule, PipelineStep } from "@/types/investigation-xai";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export function XAIModulePanel({ module }: { module: XAIModule }) {
  return (
    <div className="space-y-4 text-sm border-t border-slate-200 pt-4 mt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <XAIBlock title="1. Input Data" content={module.inputData} list />
        <XAIBlock title="2. AI Processing" content={module.aiProcessing} />
      </div>
      <XAIBlock title="3. AI Reasoning" content={module.aiReasoning} prose highlight />
      <XAIBlock title="4. Confidence Calculation" content={module.confidenceCalculation} />
      <div className="rounded-sm border-2 border-[#c9a227] bg-amber-50/50 p-4">
        <p className="text-[10px] font-bold uppercase text-[#92400e] mb-1">5. Government Recommendation</p>
        <p className="text-sm text-[#0c1f3d] leading-relaxed">{module.governmentRecommendation}</p>
        <p className="text-xs font-bold text-[#1e40af] mt-2">Module confidence: {module.confidence}%</p>
      </div>
    </div>
  );
}

function XAIBlock({ title, content, list, prose, highlight }: { title: string; content: string | string[]; list?: boolean; prose?: boolean; highlight?: boolean }) {
  return (
    <div className={cn("rounded-sm border p-3", highlight ? "border-l-4 border-[#1e40af] bg-blue-50/40" : "border-slate-200 bg-slate-50")}>
      <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">{title}</p>
      {list && Array.isArray(content) ? (
        <ul className="text-xs space-y-1">{content.map((c) => <li key={c}>• {c}</li>)}</ul>
      ) : (
        <p className={cn("text-xs leading-relaxed text-slate-800", prose && "text-sm")}>{typeof content === "string" ? content : content.join(", ")}</p>
      )}
    </div>
  );
}

export function ProcessingPipelineVisual({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex flex-col gap-0 min-w-[280px]">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3 items-start">
            <div className="flex flex-col items-center shrink-0">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : step.status === "active" ? (
                <Loader2 className="h-5 w-5 text-[#1e40af] animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              {i < steps.length - 1 && (
                <div className={cn("w-0.5 h-6", step.status === "completed" ? "bg-emerald-400" : "bg-slate-200")} />
              )}
            </div>
            <div className={cn("pb-3 flex-1", step.status === "active" && "bg-blue-50/50 -mx-2 px-2 rounded-sm")}>
              <p className={cn("text-xs font-bold", step.status === "completed" ? "text-emerald-800" : step.status === "active" ? "text-[#1e40af]" : "text-slate-400")}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NarrativeProse({ children }: { children: string }) {
  return (
    <p className="text-sm leading-relaxed text-slate-800 border-l-4 border-[#1e40af] pl-4 py-2 bg-slate-50/80">
      {children}
    </p>
  );
}

export function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-2 text-xs">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border border-slate-100 bg-white p-2">
          <dt className="font-bold uppercase text-[9px] text-slate-500">{item.label}</dt>
          <dd className="mt-0.5 text-slate-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FactorBreakdown({ factors }: { factors: { factor: string; percentage: number; reason: string }[] }) {
  return (
    <div className="space-y-3">
      {factors.map((f) => (
        <div key={f.factor} className="rounded-sm border border-slate-200 p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-[#0c1f3d]">{f.factor}</span>
            <span className="text-sm font-black text-[#1e40af]">{f.percentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-sm overflow-hidden mb-2">
            <div className="h-full bg-[#1e40af]" style={{ width: `${f.percentage}%` }} />
          </div>
          <p className="text-xs text-slate-700 leading-relaxed"><strong>Reason:</strong> {f.reason}</p>
        </div>
      ))}
    </div>
  );
}

export function RiskFactorTable({ factors }: { factors: { factor: string; weight: number; contribution: number; explanation: string }[] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-[#1e3a5f] text-white">
          <th className="p-2 text-left font-bold">Risk Factor</th>
          <th className="p-2 text-center font-bold">Weight</th>
          <th className="p-2 text-center font-bold">Contribution</th>
          <th className="p-2 text-left font-bold">Explanation</th>
        </tr>
      </thead>
      <tbody>
        {factors.map((f) => (
          <tr key={f.factor} className="border-b border-slate-100">
            <td className="p-2 font-semibold">{f.factor}</td>
            <td className="p-2 text-center">{f.weight}%</td>
            <td className="p-2 text-center font-bold text-[#1e40af]">{f.contribution}%</td>
            <td className="p-2 text-slate-600">{f.explanation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FraudChecklist({ checks }: { checks: { label: string; result: string; explanation: string }[] }) {
  return (
    <div className="space-y-2">
      {checks.map((c) => (
        <div key={c.label} className="flex gap-3 text-xs border border-slate-100 rounded-sm p-2 bg-white">
          <span className="font-bold text-slate-700 w-32 shrink-0">{c.label}</span>
          <span className={cn("font-black w-16 shrink-0", c.result === "YES" || c.result.includes("genuine") ? "text-emerald-700" : c.result === "NO" || c.result === "NOT DETECTED" ? "text-emerald-700" : "text-amber-700")}>{c.result}</span>
          <span className="text-slate-600 flex-1">{c.explanation}</span>
        </div>
      ))}
    </div>
  );
}
