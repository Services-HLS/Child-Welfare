import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { ROOT, makeTest, writeJsonEvidence } from "./lib.mjs";

const BASE_URL = process.env.VERIFY_BASE_URL || "http://localhost:5173";

export async function probeServer() {
  try {
    const t0 = Date.now();
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    return {
      up: res.ok,
      status: res.status,
      hasRoot: html.includes('id="root"') || html.includes("id='root'"),
      loadMs: Date.now() - t0,
    };
  } catch {
    return { up: false, status: 0, hasRoot: false, loadMs: 0 };
  }
}

export async function buildRuntimeRouteTests(routes, serverUp) {
  const keyRoutes = [
    { path: "/", role: "public" },
    { path: "/beneficiary", role: "beneficiary" },
    { path: "/beneficiary/omnichannel-feedback", role: "beneficiary" },
    { path: "/worker/dashboard", role: "worker" },
    { path: "/worker/session-monitor", role: "worker" },
    { path: "/supervisor", role: "supervisor" },
    { path: "/district-admin/mission-control", role: "district_admin" },
    { path: "/state-admin/mission-control", role: "state_admin" },
    { path: "/public/transparency", role: "public" },
  ];

  if (!serverUp) {
    return keyRoutes.map((r) =>
      makeTest({
        id: `E2E-LOAD-${r.path}`,
        module: "Route Health",
        route: r.path,
        function: `Route loads ${r.path}`,
        expected: "HTTP 200 + SPA shell",
        actualResult: "Dev server not reachable — start npm run dev",
        status: "PARTIAL",
        consoleStatus: "server_down",
        evidence: `Skipped: ${BASE_URL}`,
      })
    );
  }

  const results = [];
  for (const r of keyRoutes) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${r.path}`, { signal: AbortSignal.timeout(8000) });
      const html = await res.text();
      const ok = res.ok && (html.includes('id="root"') || html.includes("id='root'"));
      const evidencePath = writeJsonEvidence(r.role, `route-load-${r.path.replace(/\//g, "_")}`, {
        path: r.path,
        status: res.status,
        ok,
        loadMs: Date.now() - t0,
      });
      results.push(
        makeTest({
          id: `E2E-LOAD-${r.path}`,
          module: "Route Health",
          route: r.path,
          function: `Route loads ${r.path}`,
          expected: "HTTP 200 + SPA shell (index.html)",
          actualResult: ok ? `HTTP ${res.status}, root mount OK` : `HTTP ${res.status}, shell incomplete`,
          status: ok ? "PASS" : "FAIL",
          consoleStatus: ok ? "clean" : "load_fail",
          evidence: evidencePath,
          durationMs: Date.now() - t0,
          steps: ["Route Open", "UI Validation"],
        })
      );
    } catch (e) {
      results.push(
        makeTest({
          id: `E2E-LOAD-${r.path}`,
          module: "Route Health",
          route: r.path,
          function: `Route loads ${r.path}`,
          expected: "HTTP 200",
          actualResult: String(e.message || e),
          status: "FAIL",
          consoleStatus: "error",
        })
      );
    }
  }
  return results;
}

export function runPlaywrightIfEnabled() {
  if (process.env.VERIFY_E2E !== "1") {
    return { ran: false, tests: [], passRate: 0 };
  }
  const config = join(ROOT, "e2e", "playwright.config.mjs");
  if (!existsSync(config)) return { ran: false, tests: [], passRate: 0 };

  const result = spawnSync("npx", ["playwright", "test", "--config", config], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 300000,
    shell: true,
  });

  writeJsonEvidence("platform", "playwright-output", {
    exitCode: result.status,
    stdout: (result.stdout || "").slice(-8000),
    stderr: (result.stderr || "").slice(-4000),
  });

  const passed = (result.stdout || "").includes(" passed");
  return {
    ran: true,
    ok: result.status === 0,
    passRate: result.status === 0 ? 100 : 0,
    tests: [
      makeTest({
        id: "E2E-playwright-suite",
        module: "Browser E2E",
        function: "Playwright verification suite",
        expected: "All playwright tests pass",
        actualResult: result.status === 0 ? "Suite passed" : "Suite failed — see evidence",
        status: result.status === 0 ? "PASS" : "FAIL",
        evidence: "TESTING/evidence/.../platform/playwright-output.json",
        consoleStatus: result.status === 0 ? "clean" : "test_failures",
      }),
    ],
  };
}
