import { test, expect } from '@playwright/test';

test.describe('Authentication & Onboarding', () => {
  test('should allow a new user to sign up, create a workspace and see pricing', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    
    // 1. Sign Up
    await page.goto('/auth/sign-up');
    
    // Fill registration form
    // Note: Using flexible selectors to be resilient to UI changes
    await page.locator('input[id="firstName"]').fill('Test');
    await page.locator('input[id="lastName"]').fill('User');
    await page.locator('input[id="email"]').fill(email);
    await page.locator('input[id="password"]').fill('Password123!');
    await page.locator('input[id="confirmPassword"]').fill('Password123!');
    
    // The checkbox for terms might be inside a label or have a specific ID
    // Based on the code it's id="acceptedTerms"
    await page.locator('button[type="submit"]').click();
    
    // 2. Onboarding
    // After sign up, we expect to be on the onboarding page
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    
    // Fill workspace name
    await page.locator('input[name="name"]').fill('My E2E Workspace');
    await page.locator('button[type="submit"]').click();
    
    // 3. Plan Selection
    // After workspace creation, we expect plan selection
    await expect(page).toHaveURL(/\/onboarding\/pricing/);
    
    // Verify plans are visible
    await expect(page.getByText('Growth')).toBeVisible();
    
    // 4. Finalizing onboarding
    // Click on any plan to finish (e.g. Starter/Free)
    await page.getByRole('button', { name: /Seleccionar|Starter|Growth|Elegir/i }).first().click();
    
    // We should land on the main dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    await expect(page.getByText('My E2E Workspace')).toBeVisible();
  });
});

test.describe('Identity & Session Management', () => {
  test('should logout successfully and prevent unauthorized access', async ({ page }) => {
    // Login first
    await page.goto('/auth/sign-in');
    await page.locator('input[id="email"]').fill('admin@ludevv.com');
    await page.locator('input[id="password"]').fill('Password123');
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/\/$/);
    
    // Find logout button - often in a dropdown or sidebar
    // I'll try to find it by text or aria-label
    const profileButton = page.locator('button[aria-label*="Profile"], button[aria-label*="perfil"], .avatar-button').first();
    await profileButton.click();
    
    const logoutButton = page.getByText(/Cerrar sesión|Logout/i);
    await logoutButton.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    
    // Verify back button doesn't re-auth
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
