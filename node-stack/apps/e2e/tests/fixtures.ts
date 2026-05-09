import { type Page, expect } from "@playwright/test";

export const TEST_USER = {
  email: "admin@ludevv.com",
  password: "Password123",
};

/** Login helper shared across all spec files. */
export async function loginAs(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password,
): Promise<void> {
  await page.goto("/auth/sign-in");
  await page.locator('input[id="email"]').fill(email);
  await page.locator('input[id="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
}

/** Assert that the current page redirects unauthenticated users to sign-in. */
export async function assertRedirectsToLogin(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page).toHaveURL(/\/auth\/sign-in/);
}
