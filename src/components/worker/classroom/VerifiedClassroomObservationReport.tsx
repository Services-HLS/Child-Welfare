import type { Ref } from "react";
import { useMemo } from "react";
import { DemoStorytellingSessionAnalysis, SessionExtractedAnalysis } from "@/types/session-extraction";
import { SessionMetadata } from "@/types/session";
import { SessionVerificationSection } from "@/components/worker/classroom/SessionVerificationSection";
import { normalizeSessionVerification } from "@/services/session/buildSessionVerification";
import { SessionClassroomVideo } from "@/components/worker/classroom/SessionClassroomVideo";
import { DemoClassroomObservationReport } from "@/components/worker/classroom/DemoClassroomObservationReport";

export function VerifiedClassroomObservationReport({
  extracted,
  template,
  metadata,
  sessionId,
  videoUrl,
  videoFile,
  uploadedAt,
  transcriptSaved,
  onSaveTranscript,
  onRefreshGps,
  transcriptAnchorRef,
}: {
  extracted: SessionExtractedAnalysis;
  template: DemoStorytellingSessionAnalysis;
  metadata: SessionMetadata;
  sessionId: string;
  videoUrl?: string;
  videoFile?: File | null;
  uploadedAt: string;
  transcriptSaved?: boolean;
  onSaveTranscript?: () => void;
  onRefreshGps?: () => void;
  transcriptAnchorRef?: Ref<HTMLDivElement>;
}) {
  const normalized = useMemo(
    () => normalizeSessionVerification(metadata),
    [metadata.centerId, metadata.centerName, metadata.gps?.lat, metadata.gps?.lng, metadata.timestamp]
  );
  const verification = normalized.sessionVerification;
  const authenticity = normalized.authenticityChecks;
  const evidence = extracted.classroomEvidence!;
  const observation = extracted.classroomObservationSummary!;
  const timeline = extracted.verificationTimeline ?? normalized.verificationTimeline;

  return (
    <div className="space-y-6 w-full">
      <SessionVerificationSection
        verification={verification}
        authenticity={authenticity}
        evidence={evidence}
        observation={observation}
        timeline={timeline}
        onRefreshGps={onRefreshGps}
      />

      {(videoUrl || videoFile || sessionId) && (
        <SessionClassroomVideo sessionId={sessionId} src={videoUrl} file={videoFile} />
      )}

      <DemoClassroomObservationReport
        template={template}
        sessionId={sessionId}
        metadata={metadata}
        videoUrl={undefined}
        videoFile={null}
        uploadedAt={uploadedAt}
        transcriptSaved={transcriptSaved}
        onSaveTranscript={onSaveTranscript}
        hideVideo
        hideHeader
        transcriptAnchorRef={transcriptAnchorRef}
        sectionTitleSupportSummary
      />
    </div>
  );
}
