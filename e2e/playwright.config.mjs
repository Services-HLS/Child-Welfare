import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.VERIFY_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  outputDir: "../TESTING/evidence/playwright-test-results",
  reporter: [["list"], ["json", { outputFile: "../TESTING/evidence/playwright-report.json" }]],
});
