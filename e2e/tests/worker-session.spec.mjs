import { test, expect } from "@playwright/test";

async function loginWorker(page) {
  await page.goto("/");
  const workerBtn = page.locator("button").filter({ hasText: /worker/i }).first();
  await workerBtn.click().catch(() => {});
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/worker/, { timeout: 15000 });
}

test.describe("Worker session monitor", () => {
  test("session page loads pipeline UI", async ({ page }) => {
    await loginWorker(page);
    await page.goto("/worker/session-monitor");
    await expect(page.locator("body")).toContainText(/session|recording|upload|GPS|transcript/i, { timeout: 12000 });
  });
});
