import { writeFileSync, readFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

export const ROOT = join(import.meta.dirname, "..", "..");
export const REPORT = join(ROOT, "docs", "APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md");
export const BUG_TRACKER = join(ROOT, "docs", "BUG_TRACKER.md");
export const LAST_RUN = join(ROOT, "TESTING", "LAST_RUN_SUMMARY.md");
export const EVIDENCE_ROOT = join(ROOT, "TESTING", "evidence");

export const READINESS_LEVELS = [
  "Development",
  "Internal QA",
  "Demo Ready",
  "Hackathon Ready",
  "Government Demo Ready",
  "Production Candidate",
];

export function nowIso() {
  return new Date().toISOString();
}

export function runDateFolder() {
  return nowIso().slice(0, 10);
}

export function evidenceDir(role = "platform") {
  const dir = join(EVIDENCE_ROOT, runDateFolder(), role);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function statusIcon(s) {
  if (s === "PASS") return "✅ PASS";
  if (s === "FAIL") return "❌ FAIL";
  return "⚠️ PARTIAL";
}

/** @typedef {Object} TestResult
 * @property {string} id
 * @property {string} module
 * @property {string} [route]
 * @property {string} function
 * @property {string} expected
 * @property {string} actualResult
 * @property {string} [evidence]
 * @property {string} [screenshotRef]
 * @property {string} [consoleStatus]
 * @property {string} timestamp
 * @property {number} durationMs
 * @property {string} owner
 * @property {'PASS'|'PARTIAL'|'FAIL'} status
 * @property {string[]} [steps]
 */

export function makeTest(partial) {
  const t0 = Date.now();
  return {
    timestamp: nowIso(),
    durationMs: 0,
    owner: "cursor-agent",
    consoleStatus: "not_run",
    screenshotRef: "—",
    evidence: "",
    actualResult: "",
    ...partial,
    durationMs: partial.durationMs ?? Date.now() - t0,
  };
}

export function evidenceRow(t) {
  return `| ${t.function} | ${t.expected} | ${t.actualResult} | ${statusIcon(t.status)} | ${t.evidence || "—"} | ${t.screenshotRef || "—"} | ${t.consoleStatus} | ${t.timestamp} | ${t.durationMs}ms | ${t.owner} |`;
}

export const EVIDENCE_HEADER =
  "| Function | Expected | Actual Result | Status | Evidence | Screenshot | Console | Timestamp | Duration | Owner |";

export function writeJsonEvidence(role, name, data) {
  const dir = evidenceDir(role);
  const path = join(dir, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
  return path.replace(/\\/g, "/");
}

export function computeReadiness({ pass, partial, fail, critical, buildOk, tscOk, e2ePassRate = 0, flowsExecuted = 0 }) {
  const total = pass + partial + fail;
  const passPct = total ? Math.round((pass / total) * 100) : 0;
  const coveragePct = total ? Math.round(((pass + partial * 0.5) / total) * 100) : 0;

  if (!buildOk || !tscOk || critical > 0) return { level: "Development", passPct, coveragePct };
  if (passPct < 50) return { level: "Development", passPct, coveragePct };
  if (passPct < 70) return { level: "Internal QA", passPct, coveragePct };
  if (passPct < 85) return { level: "Demo Ready", passPct, coveragePct };
  if (passPct < 95 || e2ePassRate < 80 || flowsExecuted < 20)
    return { level: "Hackathon Ready", passPct, coveragePct };
  if (passPct < 100 || e2ePassRate < 95 || fail > 0)
    return { level: "Government Demo Ready", passPct, coveragePct };
  return { level: "Production Candidate", passPct, coveragePct };
}

let bugSeq = 1;
export function initBugSeq(n) {
  bugSeq = n;
}
export function loadBugSeq() {
  if (!existsSync(BUG_TRACKER)) return 1;
  const m = readFileSync(BUG_TRACKER, "utf8").match(/BUG-(\d+)/g);
  if (!m?.length) return 1;
  return Math.max(...m.map((x) => parseInt(x.replace("BUG-", ""), 10))) + 1;
}

export function appendBug(bugs, { module, route, description, severity, status = "Open", evidence = "" }) {
  const id = `BUG-${String(bugSeq++).padStart(4, "0")}`;
  bugs.push({
    id,
    module,
    route: route ?? "—",
    description,
    severity,
    status,
    owner: "Engineering",
    fixVersion: "—",
    evidence,
    verificationDate: nowIso().slice(0, 10),
  });
  return id;
}

export function writeBugTracker(bugs, existingContent) {
  mkdirSync(join(ROOT, "docs"), { recursive: true });
  let header = existingContent;
  if (!existsSync(BUG_TRACKER)) {
    header = `# AnganSakti 360 — Bug Tracker

> Auto-updated by \`npm run verify:app\`. Cursor Agent appends on FAIL.

| Bug ID | Module | Route | Description | Severity | Status | Owner | Fix Version | Evidence | Verification Date |
|--------|--------|-------|-------------|----------|--------|-------|-------------|----------|-------------------|
`;
  } else {
    header = readFileSync(BUG_TRACKER, "utf8");
    if (!header.includes("| Bug ID |")) {
      header += "\n| Bug ID | Module | Route | Description | Severity | Status | Owner | Fix Version | Evidence | Verification Date |\n|--------|--------|-------|-------------|----------|--------|-------|-------------|----------|-------------------|\n";
    }
  }
  const existingIds = new Set([...header.matchAll(/BUG-\d+/g)].map((x) => x[0]));
  let body = header.trimEnd() + "\n";
  for (const b of bugs) {
    if (existingIds.has(b.id)) continue;
    body += `| ${b.id} | ${b.module} | ${b.route} | ${b.description} | ${b.severity} | ${b.status} | ${b.owner} | ${b.fixVersion} | ${b.evidence} | ${b.verificationDate} |\n`;
  }
  writeFileSync(BUG_TRACKER, body, "utf8");
}

export function writeLastRunSummary(summary) {
  mkdirSync(join(ROOT, "TESTING"), { recursive: true });
  const md = `# Last Verification Run Summary

> Auto-generated · Do not edit manually (re-run \`npm run verify:app\`)

| Field | Value |
|-------|-------|
| **Run Date** | ${summary.runDate} |
| **Run ID** | ${summary.runId} |
| **Total Routes Checked** | ${summary.totalRoutes} |
| **Total Flows Executed** | ${summary.totalFlows} |
| **Pass** | ${summary.pass} |
| **Partial** | ${summary.partial} |
| **Fail** | ${summary.fail} |
| **Coverage %** | ${summary.coveragePct}% |
| **Critical Issues** | ${summary.critical} |
| **Build Status** | ${summary.buildStatus} |
| **TypeScript** | ${summary.tscStatus} |
| **E2E Executed** | ${summary.e2eExecuted} |
| **E2E Pass Rate** | ${summary.e2ePassRate}% |
| **Readiness Decision** | **${summary.readiness}** |
| **Evidence Folder** | \`${summary.evidencePath}\` |

## Historical comparison

| Run Date | Pass | Fail | Coverage | Readiness |
|----------|------|------|----------|-----------|
${summary.historyRows || `| ${summary.runDate} | ${summary.pass} | ${summary.fail} | ${summary.coveragePct}% | ${summary.readiness} |`}

## Quick links

- [Full report](../docs/APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md)
- [Bug tracker](../docs/BUG_TRACKER.md)
- [E2E checklist](./END_TO_END_FLOW_CHECKLIST.md)
- [Evidence](./evidence/${summary.runDateFolder}/)
`;
  writeFileSync(LAST_RUN, md, "utf8");

  const histPath = join(ROOT, "TESTING", "evidence", "run-history.jsonl");
  appendFileSync(
    histPath,
    JSON.stringify({
      runDate: summary.runDate,
      pass: summary.pass,
      fail: summary.fail,
      coveragePct: summary.coveragePct,
      readiness: summary.readiness,
      critical: summary.critical,
    }) + "\n",
    "utf8"
  );
}
