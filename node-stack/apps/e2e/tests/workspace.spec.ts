import { test, expect } from "@playwright/test";

import { loginAs } from "./fixtures.js";

test.describe("Workspace management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("workspace switcher shows current workspace name", async ({ page }) => {
    // The workspace name should be visible somewhere in the sidebar / header
    await expect(
      page.locator('[data-testid="workspace-name"], .workspace-name, [aria-label*="workspace" i]'),
    ).toBeVisible({ timeout: 5000 });
  });

  test("members page lists at least the logged-in user", async ({ page }) => {
    await page.goto("/workspaces/members");
    await expect(page).toHaveURL(/members/);
    // The table/list should have at least one row
    await expect(page.locator("table tbody tr, [data-testid='member-row']").first()).toBeVisible({
      timeout: 8000,
    });
  });

  test("invite member — invalid email shows validation error", async ({ page }) => {
    await page.goto("/workspaces/members");
    const inviteBtn = page.getByRole("button", { name: /invitar|invite/i });
    await inviteBtn.click();

    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').last();
    await emailInput.fill("not-an-email");
    await page.getByRole("button", { name: /enviar|send|invitar|invite/i }).last().click();

    await expect(page.locator('[role="alert"], .text-destructive, .error').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("settings page loads without error", async ({ page }) => {
    await page.goto("/settings/workspace");
    await expect(page).not.toHaveURL(/error|404/);
    // No unhandled error boundary visible
    await expect(page.getByText(/something went wrong|error inesperado/i)).not.toBeVisible();
  });
});
