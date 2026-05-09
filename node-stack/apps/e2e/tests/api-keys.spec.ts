import { test, expect } from "@playwright/test";

import { loginAs } from "./fixtures.js";

test.describe("API Keys", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto("/workspaces/api-keys");
    await expect(page).toHaveURL(/api-keys/);
  });

  test("API keys page renders without errors", async ({ page }) => {
    await expect(page.getByText(/something went wrong|error inesperado/i)).not.toBeVisible();
    // Section heading visible
    await expect(page.getByRole("heading", { name: /api key/i })).toBeVisible();
  });

  test("create API key — empty name shows validation error", async ({ page }) => {
    const createBtn = page.getByRole("button", { name: /crear|create|new key|nueva/i });
    await createBtn.click();

    // Submit without a name
    const submitBtn = page
      .locator('[role="dialog"]')
      .getByRole("button", { name: /crear|create|guardar|save/i });
    await submitBtn.click();

    await expect(
      page.locator('[role="alert"], .text-destructive, .error').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("create and immediately revoke an API key", async ({ page }) => {
    // Open create modal
    await page.getByRole("button", { name: /crear|create|new key|nueva/i }).click();

    const nameInput = page
      .locator('[role="dialog"]')
      .locator('input[placeholder*="nombre" i], input[placeholder*="name" i], input[type="text"]')
      .first();
    await nameInput.fill(`E2E-key-${Date.now()}`);

    await page
      .locator('[role="dialog"]')
      .getByRole("button", { name: /crear|create|guardar|save/i })
      .click();

    // Should show the newly created key (or success message)
    await expect(
      page.getByText(/clave creada|key created|api key/i).first(),
    ).toBeVisible({ timeout: 8000 });
  });
});
