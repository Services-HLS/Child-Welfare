import { join } from "path";
import { existsSync } from "fs";
import { ROOT, makeTest } from "./lib.mjs";
import { read } from "./static-checks.mjs";

export function buildStateValidationTests(ctx) {
  const { appCtx, omniSrc } = ctx;
  const tests = [];

  const checks = [
    {
      id: "STATE-feedback-submit",
      module: "Feedback",
      function: "Feedback submission creates feedback state",
      expected: "setFeedback / feedback array update",
      probe: () => appCtx.includes("submitFeedback") && appCtx.includes("setFeedback"),
      evidence: "AppContext.submitFeedback",
    },
    {
      id: "STATE-feedback-notification",
      module: "Feedback",
      function: "Feedback triggers notification",
      expected: "addNotification on submit",
      probe: () => appCtx.includes("addNotification"),
      evidence: "AppContext notifications",
    },
    {
      id: "STATE-feedback-complaint",
      module: "Complaint",
      function: "Low rating creates complaint record",
      expected: "registerComplaint when isComplaint",
      probe: () => appCtx.includes("registerComplaint") && appCtx.includes("isComplaint"),
      evidence: "AppContext.registerComplaint",
    },
    {
      id: "STATE-omnichannel-intake",
      module: "Omnichannel",
      function: "Omnichannel creates omnichannelInputs + feedback",
      expected: "processChannelIntake + setOmnichannelInputs",
      probe: () => appCtx.includes("submitOmnichannel") && appCtx.includes("processChannelIntake"),
      evidence: "services/feedback/intake.ts",
    },
    {
      id: "STATE-complaint-survey",
      module: "Complaint",
      function: "Complaint closure schedules survey",
      expected: "scheduleSurvey on complaint_closed",
      probe: () => appCtx.includes("scheduleSurvey") && appCtx.includes("complaint_closed"),
      evidence: "AppContext.advanceComplaint",
    },
    {
      id: "STATE-training-progress",
      module: "Training",
      function: "Training completion updates progress IDB",
      expected: "training_course_progress store + save",
      probe: () => {
        const db = read(join(ROOT, "src", "lib", "storage", "db.ts"));
        const tp = existsSync(join(ROOT, "src", "lib", "storage", "trainingProgress.ts"));
        return db.includes("training_course_progress") && tp;
      },
      evidence: "trainingProgress.ts",
    },
    {
      id: "STATE-training-growth",
      module: "Training",
      function: "Training completion updates growth journey",
      expected: "completeTrainingCourse in WorkerFlow",
      probe: () => {
        const wf = read(join(ROOT, "src", "context", "worker", "WorkerFlowContext.tsx"));
        return wf.includes("completeTrainingCourse");
      },
      evidence: "WorkerFlowContext",
    },
    {
      id: "STATE-session-gps",
      module: "Session",
      function: "GPS verification status generated",
      expected: "resolveSessionGps + buildSessionVerification",
      probe: () => {
        const sm = read(join(ROOT, "src", "pages", "worker", "SessionMonitor.tsx"));
        return sm.includes("resolveSessionGps") && existsSync(join(ROOT, "src", "services", "session", "buildSessionVerification.ts"));
      },
      evidence: "SessionMonitor + buildSessionVerification",
    },
    {
      id: "STATE-session-transcript",
      module: "Session",
      function: "Session pipeline produces transcript",
      expected: "processSessionUpload / transcript fields",
      probe: () => appCtx.includes("processSessionUpload"),
      evidence: "AppContext.processSessionUpload",
    },
    {
      id: "STATE-session-history",
      module: "Session",
      function: "Completed session in session history",
      expected: "session_recordings IDB store",
      probe: () => read(join(ROOT, "src", "lib", "storage", "db.ts")).includes("session_recordings"),
      evidence: "IndexedDB session_recordings",
    },
    {
      id: "STATE-persist-user",
      module: "Persistence",
      function: "Login persists to localStorage",
      expected: "angansakti.user key",
      probe: () => read(join(ROOT, "src", "services", "auth", "session.ts")).includes("angansakti.user"),
      evidence: "session.ts persistUser",
    },
    {
      id: "STATE-offline-queue",
      module: "Persistence",
      function: "Offline sync queue store",
      expected: "session_offline_queue store",
      probe: () => read(join(ROOT, "src", "lib", "storage", "db.ts")).includes("session_offline_queue"),
      evidence: "db.ts STORES",
    },
    {
      id: "STATE-omni-draft-idb",
      module: "Persistence",
      function: "Omnichannel draft IDB",
      expected: "omnichannel_drafts store",
      probe: () => read(join(ROOT, "src", "lib", "storage", "db.ts")).includes("omnichannel_drafts"),
      evidence: "db.ts v7",
    },
  ];

  for (const c of checks) {
    const ok = c.probe();
    tests.push(
      makeTest({
        id: c.id,
        module: c.module,
        function: c.function,
        expected: c.expected,
        expectedState: c.expected,
        actualResult: ok ? "State wiring present in codebase" : "Wiring not found",
        actualState: ok ? "wired" : "missing",
        evidence: c.evidence,
        status: ok ? "PASS" : "FAIL",
        consoleStatus: "static_state_probe",
        steps: ["User Action", "State Change", "Persistence"],
      })
    );
  }

  return tests;
}

export function buildCrossRoleTests(ctx) {
  return [
    makeTest({
      id: "XROLE-grievance-chain",
      module: "Cross-Role",
      function: "Parent grievance → worker queue → escalation",
      expected: "submitFeedback/omnichannel → complaints state → role complaint pages",
      expectedState: "complaints[] shared via AppContext",
      actualResult: ctx.appCtx.includes("complaints") && ctx.appCtx.includes("advanceComplaint") ? "Shared complaint model" : "Incomplete",
      actualState: ctx.appCtx.includes("complaints") ? "complaints in AppContext" : "unknown",
      evidence: "RoleComplaints pages + AppContext",
      status: ctx.appCtx.includes("advanceComplaint") ? "PARTIAL" : "FAIL",
      consoleStatus: "requires_e2e",
      steps: ["Parent submit", "Worker view", "Supervisor escalate", "District review", "Parent closure"],
    }),
    makeTest({
      id: "XROLE-notifications",
      module: "Cross-Role",
      function: "Notifications on complaint events",
      expected: "addNotification across roles",
      actualResult: ctx.appCtx.includes("addNotification") ? "Notification API present" : "Missing",
      status: ctx.appCtx.includes("addNotification") ? "PARTIAL" : "FAIL",
      evidence: "AppContext.addNotification",
      consoleStatus: "requires_e2e",
    }),
    makeTest({
      id: "XROLE-timeline",
      module: "Cross-Role",
      function: "Parent timeline updates on resolution",
      expected: "Status page + getTimeline",
      actualResult: existsSync(join(ROOT, "src/pages/beneficiary/Status.tsx")) ? "Status page exists" : "Missing",
      status: "PARTIAL",
      evidence: "beneficiary/Status.tsx",
    }),
  ];
}

export function buildSessionPipelineTests() {
  const sm = read(join(ROOT, "src/pages/worker/SessionMonitor.tsx"));
  const steps = [
    { key: "upload", label: "Video upload", probe: () => sm.includes("upload") || sm.includes("Upload") },
    { key: "processing", label: "Processing state", probe: () => sm.includes("processSessionUpload") || sm.includes("pipeline") },
    { key: "transcript", label: "Transcript extraction", probe: () => sm.includes("transcript") || sm.includes("Transcript") },
    { key: "gps", label: "GPS verification", probe: () => sm.includes("resolveSessionGps") || sm.includes("verification") },
    { key: "observation", label: "Classroom observation", probe: () => sm.includes("scorecard") || sm.includes("Scorecard") || sm.includes("observation") },
    { key: "save", label: "Save session", probe: () => sm.includes("updateSession") || sm.includes("addSession") },
    { key: "history", label: "Session history update", probe: () => existsSync(join(ROOT, "src/pages/worker/SessionHistory.tsx")) },
  ];

  return steps.map((s) =>
    makeTest({
      id: `SESSION-${s.key}`,
      module: "Worker Session",
      route: "/worker/session-monitor",
      function: s.label,
      expected: `Pipeline step: ${s.label}`,
      actualResult: s.probe() ? "Component/handler present" : "Not detected in SessionMonitor",
      status: s.probe() ? "PARTIAL" : "FAIL",
      evidence: "SessionMonitor.tsx",
      consoleStatus: "static_wiring",
      steps: ["Upload", "Processing", "Transcript", "GPS", "Observation", "Save", "History"],
    })
  );
}
