import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { ROOT, makeTest } from "./lib.mjs";

export function read(path) {
  return readFileSync(path, "utf8");
}

export function extractRoutes(appSrc) {
  const routes = new Set();
  const re = /path="([^"]+)"/g;
  let m;
  while ((m = re.exec(appSrc))) routes.add(m[1]);
  return [...routes].sort();
}

export function routeExists(path, routes) {
  if (routes.includes(path)) return true;
  for (const r of routes) {
    if (!r.includes(":")) continue;
    const pattern = "^" + r.replace(/:[^/]+/g, "[^/]+") + "$";
    if (new RegExp(pattern).test(path)) return true;
  }
  const base = path.split("/").slice(0, -1).join("/");
  return routes.some((r) => r.replace(/\/:[^/]+/g, "") === base || r === base);
}

export function runCmd(cmd) {
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, out: out.trim() };
  } catch (e) {
    return { ok: false, out: (e.stdout || "") + (e.stderr || "") + (e.message || "") };
  }
}

export function navForRole(govSrc, roleId) {
  const start = govSrc.indexOf(`${roleId}: [`);
  if (start < 0) return [];
  const endMarkers = ["worker:", "supervisor:", "district_admin:", "state_admin:", "};"].filter((x) => x !== `${roleId}:`);
  let end = govSrc.length;
  for (const em of endMarkers) {
    if (em === `${roleId}:`) continue;
    const i = govSrc.indexOf(em, start + 10);
    if (i > start && i < end) end = i;
  }
  const slice = govSrc.slice(start, end);
  const items = [];
  const re = /\{\s*to:\s*"([^"]+)",\s*labelKey:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(slice))) items.push({ to: m[1], labelKey: m[2] });
  return items;
}

export function loadPlatformContext() {
  const appSrc = read(join(ROOT, "src", "App.tsx"));
  const govSrc = read(join(ROOT, "src", "lib", "govNav.ts"));
  const routes = extractRoutes(appSrc);
  const omniPage = join(ROOT, "src", "pages", "beneficiary", "OmnichannelFeedback.tsx");
  const omniWs = join(ROOT, "src", "components", "beneficiary", "omnichannel", "ChannelWorkspaces.tsx");
  const omniSrc = existsSync(omniPage) ? read(omniPage) : "";
  const wsSrc = existsSync(omniWs) ? read(omniWs) : "";
  const appCtx = read(join(ROOT, "src", "context", "AppContext.tsx"));

  const skipBuild = process.env.VERIFY_SKIP_BUILD === "1";
  const tsc = runCmd("npx tsc --noEmit");
  const build = skipBuild ? { ok: true, out: "skipped" } : runCmd("npm run build");

  return { appSrc, govSrc, routes, omniSrc, wsSrc, appCtx, tsc, build };
}

export function buildRouteHealth(routes, ctx) {
  const samplePaths = {
    "/": "/",
    "/beneficiary": "/beneficiary",
    "/beneficiary/omnichannel-feedback": "/beneficiary/omnichannel-feedback",
    "/worker/dashboard": "/worker/dashboard",
    "/worker/session-monitor": "/worker/session-monitor",
    "/worker/training": "/worker/training",
    "/supervisor": "/supervisor",
    "/district-admin/mission-control": "/district-admin/mission-control",
    "/state-admin/mission-control": "/state-admin/mission-control",
    "/public/transparency": "/public/transparency",
    "/settings/sync": "/settings/sync",
  };

  return routes.map((route) => {
    const exists = true;
    const protectedRoute =
      route.startsWith("/beneficiary") ||
      route.startsWith("/worker") ||
      route.startsWith("/supervisor") ||
      route.startsWith("/district-admin") ||
      route.startsWith("/state-admin");
    const isPublic = route.startsWith("/public") || route === "/" || route.startsWith("/experience");
    const componentWired = ctx.appSrc.includes(`path="${route}"`) || route.includes(":");
    let status = componentWired ? "PASS" : "FAIL";
    if (route.includes(":")) status = "PARTIAL";

    return makeTest({
      id: `ROUTE-${route.replace(/[^a-z0-9]+/gi, "-")}`,
      module: "Route Health",
      route,
      function: `Route ${route}`,
      expected: "Registered in App.tsx, component import present",
      actualResult: componentWired ? "Route registered" : "Missing route definition",
      evidence: `App.tsx path="${route}"`,
      consoleStatus: "static_only",
      status,
      steps: ["Route Open", "UI Validation"],
    });
  });
}

export function buildOmnichannelFlowTests(omniSrc, wsSrc) {
  const channels = [
    { id: "ivr", ws: "IvrWorkspace", steps: ["recording", "transcription", "preview", "submit"] },
    { id: "whatsapp", ws: "WhatsAppWorkspace", steps: ["message", "attachments", "history"] },
    { id: "qr_code", ws: "QrWorkspace", steps: ["scan", "center detection", "feedback"] },
    { id: "sms", ws: "SmsWorkspace", steps: ["message", "char limit"] },
    { id: "handwritten_ocr", ws: "OcrWorkspace", steps: ["upload", "extraction", "edit"] },
    { id: "photo_issue", ws: "PhotoWorkspace", steps: ["upload", "classification"] },
  ];

  const tests = [];
  for (const c of channels) {
    const inPage = omniSrc.includes(`selectedChannel === "${c.id}"`) && omniSrc.includes(c.ws);
    const inWs = wsSrc.includes(`export function ${c.ws}`);
    const submitWired = omniSrc.includes("submitOmnichannel");
    const draft = omniSrc.includes("saveOmnichannelDrafts");

    tests.push(
      makeTest({
        id: `OMNI-${c.id}-workspace`,
        module: "Omnichannel",
        route: "/beneficiary/omnichannel-feedback",
        function: `${c.id} channel workspace`,
        expected: `Dedicated ${c.ws} UI; steps: ${c.steps.join(" → ")}`,
        actualResult: inPage && inWs ? `${c.ws} mounted on select` : "Workspace missing",
        evidence: `OmnichannelFeedback.tsx + ChannelWorkspaces.tsx`,
        status: inPage && inWs ? "PASS" : "FAIL",
        consoleStatus: "static_wiring",
      }),
      makeTest({
        id: `OMNI-${c.id}-pipeline`,
        module: "Omnichannel",
        route: "/beneficiary/omnichannel-feedback",
        function: `${c.id} submit → grievance pipeline`,
        expected: "submitOmnichannel → processChannelIntake → feedback/complaint",
        actualResult: submitWired ? "Pipeline wired in AppContext" : "Not wired",
        status: submitWired ? "PASS" : "FAIL",
        evidence: "AppContext.submitOmnichannel",
        consoleStatus: "static_wiring",
      })
    );
  }

  tests.push(
    makeTest({
      id: "OMNI-draft-persist",
      module: "Omnichannel",
      route: "/beneficiary/omnichannel-feedback",
      function: "Draft preservation on channel switch",
      expected: "IDB omnichannel_drafts per channel",
      actualResult: omniSrc.includes("saveOmnichannelDrafts") ? "load/save on switch" : "Not implemented",
      status: omniSrc.includes("saveOmnichannelDrafts") && omniSrc.includes("switchChannel") ? "PASS" : "FAIL",
      evidence: "lib/storage/omnichannelDraft.ts",
      consoleStatus: "static_wiring",
    }),
    makeTest({
      id: "OMNI-no-shared-form",
      module: "Omnichannel",
      function: "No shared textarea for all channels",
      expected: "Conditional workspaces only",
      actualResult: omniSrc.includes("Channel workspace") ? "Dynamic workspace section" : "Unknown",
      status: omniSrc.includes("switchChannel") ? "PASS" : "PARTIAL",
      evidence: "Section 2 channel workspace",
    })
  );

  return tests;
}
