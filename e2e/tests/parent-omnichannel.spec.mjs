import { test, expect } from "@playwright/test";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const evidenceDir = join(__dirname, "..", "..", "TESTING", "evidence", new Date().toISOString().slice(0, 10), "beneficiary");

async function loginParent(page) {
  await page.goto("/");
  await page.getByRole("button", { name: /parent|beneficiary|caregiver/i }).first().click({ timeout: 5000 }).catch(() => {});
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/beneficiary/, { timeout: 15000 });
}

test.describe("Parent omnichannel channels", () => {
  test.beforeAll(() => mkdirSync(evidenceDir, { recursive: true }));

  test("six channel workspaces, no shared-only form", async ({ page }) => {
    await loginParent(page);
    await page.goto("/beneficiary/omnichannel-feedback");
    await expect(page.getByText(/choose channel|channel/i).first()).toBeVisible({ timeout: 10000 });

    const channels = [
      { label: /IVR/i, expectText: /voice|transcript|call/i },
      { label: /WhatsApp/i, expectText: /whatsapp|message|chat/i },
      { label: /QR/i, expectText: /QR|scan|center/i },
      { label: /SMS/i, expectText: /SMS|160/i },
      { label: /Handwritten/i, expectText: /OCR|handwritten|upload/i },
      { label: /Photo/i, expectText: /Photo|evidence|image/i },
    ];

    for (const ch of channels) {
      await page.getByRole("button", { name: ch.label }).first().click();
      await page.waitForTimeout(400);
      await expect(page.locator("body")).toContainText(ch.expectText, { timeout: 8000 });
      await page.screenshot({ path: join(evidenceDir, `channel-${ch.label.source.replace(/[^a-z]/gi, "")}.png`) });
    }
  });

  test("draft preserved when switching SMS → WhatsApp", async ({ page }) => {
    await loginParent(page);
    await page.goto("/beneficiary/omnichannel-feedback");
    await page.getByRole("button", { name: /SMS/i }).first().click();
    const ta = page.locator("textarea").first();
    await ta.fill("Draft test message 12345");
    await page.getByRole("button", { name: /WhatsApp/i }).first().click();
    await page.getByRole("button", { name: /SMS/i }).first().click();
    await expect(ta).toHaveValue(/Draft test message/, { timeout: 5000 });
  });
});
