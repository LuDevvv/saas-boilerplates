import { test, expect } from "@playwright/test";

import { loginAs, assertRedirectsToLogin, TEST_USER } from "./fixtures.js";

test.describe("Login", () => {
  test("valid credentials → redirects to dashboard", async ({ page }) => {
    await loginAs(page);
    await expect(page).toHaveURL(/\/$/);
  });

  test("wrong password → shows error", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.locator('input[id="email"]').fill(TEST_USER.email);
    await page.locator('input[id="password"]').fill("WrongPassword!");
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText(/credenciales|contraseña incorrecta|inválid/i),
    ).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("empty form → validation errors", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.locator('button[type="submit"]').click();

    // At least one error message visible
    await expect(page.locator('[role="alert"], .text-destructive, .error')).toBeVisible({
      timeout: 3000,
    });
  });

  test("protected routes redirect to login when unauthenticated", async ({ page }) => {
    await assertRedirectsToLogin(page, "/settings/profile");
    await assertRedirectsToLogin(page, "/billing");
  });

  test("after login, back button does not show protected page without auth", async ({ page }) => {
    await loginAs(page);
    await page.goto("/auth/sign-in");
    // Redirects away from sign-in when already logged in
    await expect(page).not.toHaveURL(/\/auth\/sign-in/, { timeout: 5000 });
  });
});

test.describe("Logout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("logout redirects to sign-in and blocks back-navigation", async ({ page }) => {
    // Open profile / avatar dropdown
    const profileTrigger = page
      .locator('button[aria-label*="profile" i], button[aria-label*="perfil" i], [data-testid="avatar-button"]')
      .first();
    await profileTrigger.click();

    await page.getByText(/cerrar sesión|logout|sign out/i).click();
    await expect(page).toHaveURL(/\/auth\/sign-in/, { timeout: 8000 });

    // Going back should stay on login, not re-enter the app
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

test.describe("Forgot password", () => {
  test("submitting known email shows confirmation", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await page.locator('input[id="email"], input[type="email"]').fill(TEST_USER.email);
    await page.locator('button[type="submit"]').click();

    // Expect a success / check-email message
    await expect(
      page.getByText(/revisa tu correo|email enviado|check your email/i),
    ).toBeVisible({ timeout: 8000 });
  });

  test("submitting unknown email does not leak user existence", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await page.locator('input[id="email"], input[type="email"]').fill("nobody@nowhere.invalid");
    await page.locator('button[type="submit"]').click();

    // Should show the same confirmation message (no user-enumeration)
    await expect(
      page.getByText(/revisa tu correo|email enviado|check your email/i),
    ).toBeVisible({ timeout: 8000 });
  });
});
