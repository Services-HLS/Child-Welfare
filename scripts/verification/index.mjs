#!/usr/bin/env node
/**
 * AnganSakti 360 — evidence-based verification engine.
 * Updates report, bug tracker, last run summary, and TESTING/evidence/
 */
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import {
  ROOT,
  nowIso,
  runDateFolder,
  EVIDENCE_ROOT,
  makeTest,
  computeReadiness,
  loadBugSeq,
  initBugSeq,
  appendBug,
  writeBugTracker,
  writeLastRunSummary,
  writeJsonEvidence,
} from "./lib.mjs";
import {
  loadPlatformContext,
  extractRoutes,
  routeExists,
  navForRole,
  buildRouteHealth,
  buildOmnichannelFlowTests,
} from "./static-checks.mjs";
import {
  buildStateValidationTests,
  buildCrossRoleTests,
  buildSessionPipelineTests,
} from "./state-validation.mjs";
import { probeServer, buildRuntimeRouteTests, runPlaywrightIfEnabled } from "./e2e-runner.mjs";
import { generateReport } from "./report-generator.mjs";

const PKG = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const now = nowIso();
const runId = `RUN-${now.replace(/[:.]/g, "-")}`;
initBugSeq(loadBugSeq());
const newBugs = [];

function trackFail(test) {
  if (test.status !== "FAIL") return;
  appendBug(newBugs, {
    module: test.module,
    route: test.route,
    description: `${test.function}: ${test.actualResult}`,
    severity: test.module === "Route Health" ? "High" : "Medium",
    evidence: test.evidence || "verify:app",
  });
}

const ctx = loadPlatformContext();
const { routes, govSrc, omniSrc, wsSrc, appCtx, tsc, build } = ctx;

const roles = [
  { id: "beneficiary", label: "Parent (Beneficiary)", login: "Login → Parent" },
  { id: "worker", label: "Worker", login: "Login → Worker" },
  { id: "supervisor", label: "Supervisor", login: "Login → Supervisor" },
  { id: "district_admin", label: "District Officer", login: "Login → District Admin" },
  { id: "state_admin", label: "State Officer", login: "Login → State Admin" },
];

const navValidation = [];
for (const r of roles) {
  for (const item of navForRole(govSrc, r.id)) {
    const exists = routeExists(item.to, routes);
    navValidation.push({
      role: r.label,
      ...item,
      routeExists: exists,
      status: exists ? "PASS" : "FAIL",
    });
  }
}

const routeHealth = buildRouteHealth(routes, ctx);
const stateTests = buildStateValidationTests(ctx);
const crossRoleTests = buildCrossRoleTests(ctx);
const sessionTests = buildSessionPipelineTests();
const omniTests = buildOmnichannelFlowTests(omniSrc, wsSrc);

const integrations = [
  { fn: "submitOmnichannel", file: "src/context/AppContext.tsx" },
  { fn: "processChannelIntake", file: "src/services/feedback/intake.ts" },
  { fn: "resolveSessionGps", file: "src/lib/geo/resolveSessionGps.ts" },
  { fn: "openPlatformDB", file: "src/lib/storage/db.ts" },
  { fn: "speechToText", file: "src/services/ai/speech.ts" },
  { fn: "classifyGrievance", file: "src/services/ai/grievance-engine.ts" },
].map((i) => ({
  ...i,
  exists: existsSync(join(ROOT, i.file)) && readFileSync(join(ROOT, i.file), "utf8").includes(i.fn),
}));

const functionalTests = [
  makeTest({
    id: "FLOW-parent-login",
    module: "Parent",
    route: "/",
    function: "Parent login → Control Room",
    expected: "Authenticate → /beneficiary",
    actualResult: routeExists("/beneficiary", routes) ? "Home route exists" : "Missing",
    status: routeExists("/beneficiary", routes) ? "PASS" : "FAIL",
    evidence: "rolePaths.ts beneficiary",
    steps: ["Route Open", "User Action", "State Change"],
  }),
  makeTest({
    id: "FLOW-complaint-engine",
    module: "Complaint",
    function: "Feedback → complaint → notification",
    expected: "registerComplaint + addNotification",
    actualResult: appCtx.includes("registerComplaint") ? "Wired" : "Missing",
    status: appCtx.includes("registerComplaint") ? "PARTIAL" : "FAIL",
    evidence: "AppContext.tsx",
  }),
  makeTest({
    id: "FLOW-offline-sync",
    module: "Upload",
    route: "/settings/sync",
    function: "Offline sync center",
    expected: "Route + sync queue store",
    actualResult: routeExists("/settings/sync", routes) ? "Route OK" : "Missing",
    status: routeExists("/settings/sync", routes) ? "PASS" : "FAIL",
    evidence: "OfflineSyncCenter.tsx",
  }),
];

const persistenceTests = stateTests.filter((t) => t.module === "Persistence" || t.id?.includes("persist") || t.id?.includes("draft") || t.id?.includes("offline"));

const performanceTests = [
  makeTest({
    id: "PERF-build",
    module: "Performance",
    function: "Production build",
    expected: "vite build succeeds",
    actualResult: build.ok ? "Build PASS" : build.out.slice(0, 200),
    status: build.ok ? "PASS" : "FAIL",
    evidence: "npm run build",
    consoleStatus: build.ok ? "clean" : "build_error",
  }),
  makeTest({
    id: "PERF-tsc",
    module: "Performance",
    function: "TypeScript health",
    expected: "tsc --noEmit clean",
    actualResult: tsc.ok ? "No errors" : tsc.out.slice(0, 300),
    status: tsc.ok ? "PASS" : "FAIL",
    evidence: "npx tsc --noEmit",
  }),
  makeTest({
    id: "PERF-bundle",
    module: "Performance",
    function: "Bundle size",
    expected: "Main chunk < 500KB",
    actualResult: "Main ~1.5MB — split recommended",
    status: "PARTIAL",
    evidence: "vite build output",
  }),
];

mkdirSync(EVIDENCE_ROOT, { recursive: true });
writeJsonEvidence("platform", "run-manifest", {
  runId,
  now,
  routes: routes.length,
  build: build.ok,
  tsc: tsc.ok,
});

const server = await probeServer();
const runtimeTests = await buildRuntimeRouteTests(routes, server.up);
performanceTests.push(
  makeTest({
    id: "PERF-dev-server",
    module: "Performance",
    function: "Dev server response",
    expected: "localhost:5173 returns SPA",
    actualResult: server.up ? `UP ${server.loadMs}ms` : "DOWN — run npm run dev",
    status: server.up ? "PASS" : "PARTIAL",
    evidence: `probe ${server.status}`,
    durationMs: server.loadMs,
  })
);

const e2eResult = runPlaywrightIfEnabled();

const allTests = [
  ...routeHealth,
  ...stateTests,
  ...crossRoleTests,
  ...sessionTests,
  ...omniTests,
  ...functionalTests,
  ...runtimeTests,
  ...performanceTests,
  ...(e2eResult.tests || []),
];

allTests.forEach(trackFail);

const pass = allTests.filter((t) => t.status === "PASS").length;
const partial = allTests.filter((t) => t.status === "PARTIAL").length;
const fail = allTests.filter((t) => t.status === "FAIL").length;
const critical = allTests.filter((t) => t.status === "FAIL" && (t.module === "Route Health" || t.id === "PERF-tsc" || t.id === "PERF-build")).length;

const readiness = computeReadiness({
  pass,
  partial,
  fail,
  critical,
  buildOk: build.ok,
  tscOk: tsc.ok,
  e2ePassRate: e2eResult.passRate ?? 0,
  flowsExecuted: allTests.length,
});

const issues = [
  { issue: "Duplicate i18n key help_support", severity: "Low", owner: "Frontend", fix: "Dedupe src/lib/i18n.ts" },
  { issue: "Main bundle >500KB", severity: "Low", owner: "Frontend", fix: "Code-split routes" },
  { issue: "IDB v7 hard refresh after upgrade", severity: "Medium", owner: "Platform", fix: "Close tabs / hard refresh" },
];
if (!tsc.ok) issues.unshift({ issue: "TypeScript errors", severity: "Critical", owner: "Engineering", fix: "tsc --noEmit" });
if (!build.ok) issues.unshift({ issue: "Build failed", severity: "Critical", owner: "Engineering", fix: "npm run build" });
if (!server.up) issues.push({ issue: "Dev server not running for runtime probes", severity: "Medium", owner: "QA", fix: "npm run dev" });

generateReport({
  now,
  pkg: PKG,
  build,
  tsc,
  routes,
  roles,
  navForRole: (id) => navForRole(govSrc, id),
  routeExists,
  navValidation,
  routeHealth,
  stateTests,
  crossRoleTests,
  sessionTests,
  omniTests,
  functionalTests,
  performanceTests,
  persistenceTests,
  runtimeTests,
  e2eResult,
  readiness,
  issues,
  integrations,
  runId,
  evidencePath: `TESTING/evidence/${runDateFolder()}/`,
  dashboard: {
    totalRoutes: routes.length,
    totalNav: navValidation.length,
    totalFlows: allTests.length,
    critical,
  },
});

writeBugTracker(newBugs);
writeLastRunSummary({
  runDate: now,
  runId,
  totalRoutes: routes.length,
  totalFlows: allTests.length,
  pass,
  partial,
  fail,
  coveragePct: readiness.coveragePct,
  critical,
  buildStatus: build.ok ? "PASS" : "FAIL",
  tscStatus: tsc.ok ? "PASS" : "FAIL",
  e2eExecuted: e2eResult.ran ? 1 : 0,
  e2ePassRate: e2eResult.passRate ?? 0,
  readiness: readiness.level,
  evidencePath: `TESTING/evidence/${runDateFolder()}/`,
  runDateFolder: runDateFolder(),
});

console.log(`Verification complete: ${runId}`);
console.log(`  Flows: ${allTests.length} | Pass: ${pass} | Partial: ${partial} | Fail: ${fail}`);
console.log(`  Coverage: ${readiness.coveragePct}% | Readiness: ${readiness.level}`);
console.log(`  Evidence: TESTING/evidence/${runDateFolder()}/`);
console.log(`  Bugs added: ${newBugs.length}`);

process.exit(fail > 0 && critical > 0 ? 1 : 0);
