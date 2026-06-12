import type { Ref } from "react";
import { DemoStorytellingSessionAnalysis } from "@/types/session-extraction";
import { SessionMetadata } from "@/types/session";
import { SessionClassroomVideo } from "@/components/worker/classroom/SessionClassroomVideo";
import { ExtractedContextFromVideo } from "@/components/worker/classroom/ExtractedContextFromVideo";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="worker-card border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[#0F172A] border-b border-slate-200 pb-2 mb-4 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-[#0F172A] mt-0.5 whitespace-pre-line">{value}</p>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-slate-800">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DemoClassroomObservationReport({
  template: t,
  sessionId,
  metadata,
  videoUrl,
  videoFile,
  uploadedAt,
  transcriptSaved,
  onSaveTranscript,
  hideVideo,
  hideHeader,
  transcriptAnchorRef,
  sectionTitleSupportSummary,
}: {
  template: DemoStorytellingSessionAnalysis;
  sessionId: string;
  metadata: SessionMetadata;
  videoUrl?: string;
  videoFile?: File | null;
  uploadedAt: string;
  transcriptSaved?: boolean;
  onSaveTranscript?: () => void;
  hideVideo?: boolean;
  hideHeader?: boolean;
  transcriptAnchorRef?: Ref<HTMLDivElement>;
  sectionTitleSupportSummary?: boolean;
}) {
  return (
    <div className={cn("space-y-5", !hideHeader && "border-t-4 border-[#1e3a5f] pt-6")}>
      {!hideHeader && (
        <div className="bg-[#0F172A] text-white px-4 py-3 rounded-sm">
          <h2 className="text-lg font-bold">AI Extracted Session Summary</h2>
          <p className="text-xs text-white/80 mt-1">
            Government-style classroom observation report · extracted from uploaded video · Session {sessionId}
          </p>
          <p className="text-[10px] text-amber-200/90 mt-1">WDCW · {metadata.centerName} · {metadata.workerName}</p>
        </div>
      )}

      {!hideVideo && (videoUrl || videoFile || sessionId) && (
        <SessionClassroomVideo sessionId={sessionId} src={videoUrl} file={videoFile} />
      )}

      {sectionTitleSupportSummary && (
        <div className="border-l-4 border-[#1e3a5f] pl-3">
          <h2 className="text-lg font-bold text-[#0F172A]">Session Support Summary</h2>
          <p className="text-sm text-slate-600">Detailed government observation metrics from verified session.</p>
        </div>
      )}

      <Section title="Session Snapshot">
        <div className="grid sm:grid-cols-2 gap-0">
          <LabelValue label="Activity Type" value={t.activityType} />
          <LabelValue label="Duration" value={t.duration} />
          <LabelValue label="Classroom Type" value={t.classroomType} />
          <LabelValue label="Teacher Visible" value={t.teacherVisible} />
          <LabelValue label="AI Confidence" value={t.confidence} />
          <LabelValue label="Recorded" value={format(new Date(uploadedAt), "PPp")} />
        </div>
      </Section>

      <Section title="Classroom Attendance Analysis">
        <p className="text-xs font-bold uppercase text-slate-500 mb-3">Estimated Children Present</p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
          <div className="bg-slate-50 p-3 rounded border">
            <p className="text-[10px] font-bold uppercase text-slate-500">Children visible</p>
            <p className="text-lg font-bold">{t.childrenVisibleRange}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <p className="text-[10px] font-bold uppercase text-slate-500">Most stable estimate</p>
            <p className="text-lg font-bold">Class strength: ≈ {t.classStrength} children</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <p className="text-[10px] font-bold uppercase text-slate-500">Teacher count</p>
            <p className="font-semibold">{t.teacherDetected} teacher</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <p className="text-[10px] font-bold uppercase text-slate-500">Total visible</p>
            <p className="font-semibold">≈ {t.totalVisible} people</p>
          </div>
        </div>
        <LabelValue label="Confidence" value={t.attendanceConfidence} />
        <p className="text-sm text-slate-700 mt-2">
          <span className="font-semibold">Reason: </span>
          {t.attendanceConfidenceReason}
        </p>
      </Section>

      <Section title="Seating & Classroom Layout Analysis">
        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Observed layout</p>
        <div className="flex flex-col items-center gap-1 py-4 bg-slate-50 rounded border text-sm font-semibold">
          <span>Teacher Standing</span>
          <span className="text-slate-400">↓</span>
          <span>Children Seated Facing Front</span>
        </div>
        <p className="text-xs font-bold uppercase text-slate-500 mt-4 mb-2">Show seating</p>
        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
          <div className="border p-2 rounded bg-white">
            <p className="text-[10px] uppercase text-slate-500">Front Area</p>
            <p className="font-bold">{t.seatingFront}</p>
          </div>
          <div className="border p-2 rounded bg-white">
            <p className="text-[10px] uppercase text-slate-500">Middle</p>
            <p className="font-bold">{t.seatingMiddle}</p>
          </div>
          <div className="border p-2 rounded bg-white">
            <p className="text-[10px] uppercase text-slate-500">Back</p>
            <p className="font-bold">{t.seatingBack}</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase text-slate-500">Assessment</p>
        <p className="text-sm font-semibold mt-1">
          Classroom Arrangement: <span className="text-emerald-700">{t.classroomArrangement}</span>
        </p>
        <p className="text-xs font-bold uppercase text-slate-500 mt-3 mb-2">Observations</p>
        <CheckList items={t.seatingObservations} />
        <p className="text-sm font-semibold mt-4">
          Estimated readiness: <span className="text-[#1e3a5f] text-lg">{t.readiness} / 100</span>
        </p>
      </Section>

      <Section title="Teacher Body Language Analysis">
        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Observed</p>
        <ul className="text-sm space-y-1 mb-4 list-disc pl-5 text-slate-800">
          {t.teacherBodyObserved.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="text-xs font-bold uppercase text-emerald-800 mb-2">Strengths</p>
        <CheckList items={t.teacherStrengths} />
        <p className="text-xs font-bold uppercase text-amber-800 mt-4 mb-2">Improve</p>
        <ul className="text-sm space-y-1 list-disc pl-5 text-slate-800">
          {t.teacherImprove.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="text-sm font-semibold mt-4">
          Estimated: Teaching Presence: <span className="text-[#1e3a5f] text-lg">{t.teachingPresence} / 100</span>
        </p>
      </Section>

      <Section title="Child Engagement Analysis">
        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Estimated child attention</p>
        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded">
            <p className="text-[10px] uppercase">Highly attentive</p>
            <p className="font-bold">{t.highlyAttentive}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-2 rounded">
            <p className="text-[10px] uppercase">Moderately attentive</p>
            <p className="font-bold">{t.moderatelyAttentive}</p>
          </div>
          <div className="bg-slate-100 border p-2 rounded">
            <p className="text-[10px] uppercase">Distracted</p>
            <p className="font-bold">{t.distracted}</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Observed</p>
        <CheckList items={t.childEngagementObserved} />
        <p className="text-sm font-semibold mt-3">
          Estimated engagement: <span className="text-[#1e3a5f]">{t.engagementPercentRange}</span>
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="border p-3 rounded">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Participation — Current</p>
            <p>Teacher: ~{t.participationCurrentTeacher}%</p>
            <p>Children: ~{t.participationCurrentChildren}%</p>
          </div>
          <div className="border p-3 rounded bg-blue-50/50">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Recommended</p>
            <p>Teacher: {t.participationRecommendedTeacher}%</p>
            <p>Children: {t.participationRecommendedChildren}%</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase text-slate-500 mt-4 mb-2">Recommendations</p>
        <ul className="text-sm space-y-1 list-disc pl-5">
          {t.engagementRecommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Storytelling Intelligence Analysis">
        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Observed</p>
        <ul className="text-sm space-y-1 list-disc pl-5 mb-4">
          {t.storytellingObserved.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="text-xs font-bold uppercase text-emerald-800 mb-2">Strengths</p>
        <CheckList items={t.storytellingStrengths} />
        <p className="text-xs font-bold uppercase text-amber-800 mt-4 mb-2">Improve</p>
        <ul className="text-sm space-y-1 list-disc pl-5 mb-4">
          {t.storytellingImprove.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="text-sm font-semibold">
          Estimated: Storytelling Effectiveness: <span className="text-[#1e3a5f] text-lg">{t.storytellingEffectiveness} / 100</span>
        </p>
      </Section>

      <Section title="Classroom Participation Analysis">
        <div className="flex flex-col items-center gap-2 py-4 text-sm font-semibold bg-slate-50 rounded border">
          <span>Teacher</span>
          <span className="text-slate-400">↓</span>
          <span>Children Listen</span>
        </div>
        <p className="text-xs font-bold uppercase text-slate-500 mt-4 mb-2">Target</p>
        <div className="flex flex-col items-center gap-1 py-3 text-sm font-semibold border border-dashed border-[#1e3a5f] rounded">
          <span>Teacher</span>
          <span className="text-slate-400">↓</span>
          <span>Question</span>
          <span className="text-slate-400">↓</span>
          <span>Child Response</span>
          <span className="text-slate-400">↓</span>
          <span>Continue Story</span>
        </div>
        <p className="text-sm font-semibold mt-4 text-center">
          Estimated: Participation: <span className="text-[#1e3a5f] text-xl">{t.participation}%</span>
        </p>
      </Section>

      <Section title="Activity Completion Confidence">
        <CheckList items={t.completionChecklist} />
        <p className="text-sm font-semibold mt-4">
          Estimated: Activity Completion Confidence: <span className="text-[#1e3a5f] text-lg">{t.completionConfidence}%</span>
        </p>
      </Section>

      <Section title="AI Extracted Session Summary">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-emerald-200 bg-emerald-50/60 p-4 rounded">
            <h4 className="text-xs font-bold uppercase text-emerald-900 mb-2">What Went Well</h4>
            <ul className="text-sm space-y-1">
              {t.strengths.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div className="border border-amber-200 bg-amber-50/60 p-4 rounded">
            <h4 className="text-xs font-bold uppercase text-amber-900 mb-2">Improve Next Session</h4>
            <ul className="text-sm space-y-1">
              {t.improvements.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border border-blue-200 bg-blue-50/60 p-4 rounded mt-4">
          <h4 className="text-xs font-bold uppercase text-blue-900 mb-2">Suggested Follow-up Activity</h4>
          <p className="text-sm font-semibold">{t.followUpActivities.join(" OR ")}</p>
        </div>
      </Section>

      <Section title="Final Classroom Metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
          {[
            ["Children Detected", t.childrenDetected],
            ["Teacher Detected", t.teacherDetected],
            ["Teaching Quality", t.teachingQuality],
            ["Child Engagement", t.engagement],
            ["Storytelling Quality", t.storytellingQuality],
            ["Classroom Readiness", t.readiness],
            ["Participation", t.participation],
          ].map(([label, val]) => (
            <div key={label} className="border bg-slate-50 p-3 rounded text-center">
              <p className="text-[10px] uppercase text-slate-500">{label}</p>
              <p className="text-xl font-bold text-[#0F172A]">→ {val}</p>
            </div>
          ))}
        </div>
        <div className={cn("mt-4 p-4 rounded-lg border-2", "bg-emerald-50 border-emerald-400")}>
          <p className="text-xs font-bold uppercase text-slate-600">Support Level</p>
          <p className="text-lg font-bold text-emerald-800 flex items-center gap-2 mt-1">
            <span className="text-2xl" aria-hidden>🟢</span> Green
          </p>
          <p className="text-sm font-semibold text-emerald-900 mt-1">{t.supportLevelMessage}</p>
        </div>
      </Section>

      <div ref={transcriptAnchorRef}>
        <ExtractedContextFromVideo
          extractedContextTelugu={t.extractedContextTelugu}
          extractedContextEnglish={t.extractedContextEnglish}
          transcriptSaved={transcriptSaved}
          onSaveTranscript={onSaveTranscript}
        />
      </div>
    </div>
  );
}
