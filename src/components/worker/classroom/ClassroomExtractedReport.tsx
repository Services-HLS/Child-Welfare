import type { Ref } from "react";
import { SessionExtractedAnalysis } from "@/types/session-extraction";
import { SessionMetadata } from "@/types/session";
import { USE_DEMO_CLASSROOM_ANALYSIS } from "@/lib/featureFlags";
import { DemoClassroomObservationReport } from "@/components/worker/classroom/DemoClassroomObservationReport";
import { VerifiedClassroomObservationReport } from "@/components/worker/classroom/VerifiedClassroomObservationReport";
import { SessionClassroomVideo } from "@/components/worker/classroom/SessionClassroomVideo";
import { ExtractedContextFromVideo } from "@/components/worker/classroom/ExtractedContextFromVideo";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  BookOpen,
  Sparkles,
  TrendingUp,
  Layout,
  Eye,
} from "lucide-react";

function confBadge(label: SessionExtractedAnalysis["confidenceLabel"]) {
  if (label === "high") return { text: "High Confidence", className: "bg-emerald-100 text-emerald-800" };
  if (label === "moderate") return { text: "Moderate Confidence", className: "bg-amber-100 text-amber-900" };
  return { text: "Estimated (camera visibility)", className: "bg-slate-200 text-slate-700" };
}

function supportBandUI(band: SessionExtractedAnalysis["supportLevel"]) {
  if (band === "green") return { bg: "bg-emerald-50 border-emerald-300", text: "text-emerald-900", dot: "bg-emerald-600" };
  if (band === "orange") return { bg: "bg-amber-50 border-amber-300", text: "text-amber-900", dot: "bg-amber-500" };
  return { bg: "bg-rose-50 border-rose-300", text: "text-rose-900", dot: "bg-rose-500" };
}

export interface ClassroomExtractedReportProps {
  extracted: SessionExtractedAnalysis;
  metadata: SessionMetadata;
  videoUrl?: string;
  videoFile?: File | null;
  uploadedAt: string;
  transcriptSaved?: boolean;
  onSaveTranscript?: () => void;
  onRefreshGps?: () => void;
  saved?: boolean;
  transcriptAnchorRef?: Ref<HTMLDivElement>;
}

export function ClassroomExtractedReport({
  extracted,
  metadata,
  videoUrl,
  videoFile,
  uploadedAt,
  transcriptSaved,
  onSaveTranscript,
  onRefreshGps,
  saved,
  transcriptAnchorRef,
}: ClassroomExtractedReportProps) {
  const template = extracted.demoStorytellingTemplate ?? extracted.sessionAnalysis;
  if (USE_DEMO_CLASSROOM_ANALYSIS && template && extracted.sessionVerification) {
    return (
      <VerifiedClassroomObservationReport
        extracted={extracted}
        template={template}
        metadata={metadata}
        sessionId={extracted.sessionId}
        videoUrl={videoUrl}
        videoFile={videoFile}
        uploadedAt={uploadedAt}
        transcriptSaved={transcriptSaved}
        onSaveTranscript={onSaveTranscript}
        onRefreshGps={onRefreshGps}
        transcriptAnchorRef={transcriptAnchorRef}
      />
    );
  }
  if (USE_DEMO_CLASSROOM_ANALYSIS && template) {
    return (
      <DemoClassroomObservationReport
        template={template}
        sessionId={extracted.sessionId}
        metadata={metadata}
        videoUrl={videoUrl}
        videoFile={videoFile}
        uploadedAt={uploadedAt}
        transcriptSaved={transcriptSaved}
        onSaveTranscript={onSaveTranscript}
      />
    );
  }

  const conf = confBadge(extracted.confidenceLabel);
  const band = supportBandUI(extracted.supportLevel);
  const fmtDur = `${Math.floor(extracted.durationSeconds / 60)}:${String(extracted.durationSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-5 border-t-4 border-[#1e3a5f] pt-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]">AI Extracted Session Summary</h2>
        <p className="text-sm text-slate-600">Observations extracted from your uploaded classroom video — coaching support, not penalties.</p>
      </div>

      <div className="worker-card border-2 border-[#1e3a5f]/30 bg-white p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Session ID</span><p className="font-mono font-semibold">{extracted.sessionId}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Uploaded</span><p>{format(new Date(uploadedAt), "PPp")}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Duration</span><p>{fmtDur} · {extracted.framesAnalyzed} frames</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Activity</span><p>{extracted.activityType}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Worker</span><p>{metadata.workerName}</p></div>
        <div><span className="text-[10px] font-bold uppercase text-slate-500">Center</span><p>{metadata.centerName}</p></div>
        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2 items-center">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", conf.className)}>{conf.text}</span>
          <span className="text-xs text-slate-600">AI confidence {extracted.confidence}%</span>
        </div>
        <p className="sm:col-span-2 lg:col-span-3 text-xs text-slate-600 italic border-l-2 border-amber-400 pl-2">{extracted.confidenceNote}</p>
      </div>

      {(videoUrl || videoFile || extracted.sessionId) && (
        <SessionClassroomVideo
          sessionId={extracted.sessionId}
          src={videoUrl}
          file={videoFile}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="worker-card border p-4 flex gap-3">
          <Users className="h-8 w-8 text-[#1e3a5f]" />
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Children visible (estimated)</p>
            <p className="text-2xl font-bold">{extracted.childrenDetected}</p>
            <p className="text-xs text-slate-600">{extracted.attentiveChildren} attentive · classroom strength approx.</p>
          </div>
        </div>
        <div className="worker-card border p-4 flex gap-3">
          <UserCheck className="h-8 w-8 text-[#1e3a5f]" />
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Teacher detected</p>
            <p className="text-2xl font-bold">{extracted.teacherDetected}</p>
            <p className="text-xs text-slate-600">Primary Anganwadi worker visible in frame</p>
          </div>
        </div>
      </div>

      <section className="worker-card border p-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-3"><Layout className="h-4 w-4" /> Classroom Presence Analysis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded"><div className="font-bold text-lg">{extracted.childrenDetected}</div>Children visible</div>
          <div className="bg-emerald-50 p-2 rounded"><div className="font-bold text-lg">{extracted.attentiveChildren}</div>Attentive est.</div>
          <div className="bg-slate-50 p-2 rounded"><div className="font-bold text-lg">{Math.round(extracted.childrenDetected * 0.85)}</div>Occupancy est.</div>
          <div className="bg-blue-50 p-2 rounded"><div className="font-bold text-lg">{extracted.classroomReadiness}%</div>Readiness</div>
        </div>
        <ul className="text-sm space-y-1.5 text-slate-700">
          {extracted.classroomPresenceObservations.map((o) => (
            <li key={o}>• {o}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Classroom Readiness", v: extracted.classroomReadiness },
            { label: "Seating Quality", v: extracted.seatingQuality },
            { label: "Visibility", v: extracted.visibilityScore },
            { label: "Participation Environment", v: extracted.participationEnvironment },
          ].map((ind) => (
            <span key={ind.label} className="text-[10px] font-semibold bg-[#eff6ff] text-[#1e40af] px-2 py-1 rounded">
              {ind.label}: {ind.v}%
            </span>
          ))}
        </div>
      </section>

      <section className="worker-card border p-4">
        <h3 className="text-sm font-bold text-[#0F172A] mb-2">Teacher Observation Analysis</h3>
        <p className="text-xs text-slate-500 mb-3">Extracted from video — posture, movement, gestures, storytelling energy</p>
        <ul className="text-sm space-y-1.5 text-slate-700 mb-3">
          {extracted.teacherObservations.map((o) => (
            <li key={o}>• {o}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">Teaching Quality: {extracted.teachingQuality}%</span>
          <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">Storytelling Effectiveness: {extracted.storytellingEffectiveness}%</span>
        </div>
      </section>

      <section className="worker-card border p-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4" /> Child Engagement Analysis</h3>
        <p className="text-sm text-slate-700 mb-3">{extracted.engagementSummary}</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
          <div className="bg-emerald-50 p-2 rounded"><div className="font-bold">{extracted.attentiveChildren}</div>Attentive</div>
          <div className="bg-amber-50 p-2 rounded"><div className="font-bold">{extracted.moderateAttention}</div>Moderate</div>
          <div className="bg-rose-50 p-2 rounded"><div className="font-bold">{extracted.distractedChildren}</div>Distracted</div>
        </div>
        <div className="flex items-end gap-1 h-20 mb-3">
          {extracted.attentionTrend.map((t) => (
            <div key={t.segment} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#1e3a5f] rounded-t min-h-[4px]" style={{ height: `${Math.max(12, t.attentive)}%` }} title={`${t.attentive}%`} />
              <span className="text-[9px] text-slate-500 truncate w-full text-center">{t.segment}</span>
            </div>
          ))}
        </div>
        <ul className="text-sm space-y-1 text-slate-700">
          {extracted.childObservations.map((o) => (
            <li key={o}>• {o}</li>
          ))}
        </ul>
        <p className="text-xs mt-2 text-[#1e40af] font-medium">Participation rate: {extracted.participationRate}%</p>
      </section>

      <section className="worker-card border border-amber-200 bg-amber-50/40 p-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4" /> Storytelling Intelligence Analysis</h3>
        <p className="text-sm text-slate-700 mb-3">{extracted.storytellingSummary}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
          <div className="bg-white p-2 rounded border text-center"><div className="font-bold">{extracted.storytellingEffectiveness}%</div>Effectiveness</div>
          <div className="bg-white p-2 rounded border text-center"><div className="font-bold">{extracted.expressionQuality}%</div>Expression</div>
          <div className="bg-white p-2 rounded border text-center"><div className="font-bold">{extracted.interactionLevel}%</div>Interaction</div>
          <div className="bg-white p-2 rounded border text-center"><div className="font-bold">{extracted.classroomEnergy}%</div>Energy</div>
        </div>
        <ul className="text-sm space-y-1 text-slate-700">
          {extracted.recommendations.slice(0, 4).map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>

      <section className="worker-card border-2 border-slate-200 p-4">
        <h3 className="text-sm font-bold uppercase text-slate-600 mb-3 flex items-center gap-2"><Eye className="h-4 w-4" /> Classroom Metrics Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { l: "Children", v: extracted.childrenDetected },
            { l: "Teachers", v: extracted.teacherDetected },
            { l: "Engagement", v: `${extracted.engagementPercent}%` },
            { l: "Participation", v: `${extracted.participationRate}%` },
            { l: "Readiness", v: `${extracted.classroomReadiness}%` },
            { l: "Storytelling", v: `${extracted.storytellingScore}%` },
            { l: "Activity match", v: `${extracted.activityCompletionConfidence}%` },
          ].map((m) => (
            <div key={m.l} className="bg-slate-50 p-2 rounded border">
              <div className="font-bold text-sm">{m.v}</div>
              <div className="text-slate-500">{m.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={cn("rounded-lg border-2 p-4", band.bg)}>
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("h-3 w-3 rounded-full", band.dot)} />
          <span className={cn("text-sm font-bold uppercase", band.text)}>Support level — {extracted.supportLevel}</span>
        </div>
        <p className={cn("text-sm font-semibold", band.text)}>{extracted.supportLevelMessage}</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="worker-card border border-emerald-200 bg-emerald-50/50 p-4">
          <h4 className="text-xs font-bold uppercase text-emerald-900 mb-2 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> What Went Well</h4>
          <ul className="text-sm space-y-1">{extracted.whatWentWell.map((w) => <li key={w}>• {w}</li>)}</ul>
        </div>
        <div className="worker-card border border-amber-200 bg-amber-50/50 p-4">
          <h4 className="text-xs font-bold uppercase text-amber-900 mb-2">Improve Next Session</h4>
          <ul className="text-sm space-y-1">{extracted.improveNextSession.map((w) => <li key={w}>• {w}</li>)}</ul>
        </div>
        <div className="worker-card border border-blue-200 bg-blue-50/50 p-4">
          <h4 className="text-xs font-bold uppercase text-blue-900 mb-2">Suggested Follow-up Activity</h4>
          <p className="text-sm">{extracted.suggestedFollowUpActivity}</p>
        </div>
        <div className="worker-card border p-4">
          <h4 className="text-xs font-bold uppercase text-slate-600 mb-2">Supervisor Guidance</h4>
          <p className="text-sm text-slate-700">{extracted.supervisorGuidance}</p>
        </div>
      </section>

      {extracted.extractedContextTelugu && extracted.extractedContextEnglish && (
        <ExtractedContextFromVideo
          extractedContextTelugu={extracted.extractedContextTelugu}
          extractedContextEnglish={extracted.extractedContextEnglish}
          transcriptSaved={transcriptSaved}
          onSaveTranscript={onSaveTranscript}
        />
      )}
    </div>
  );
}
