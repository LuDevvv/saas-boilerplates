import { test, expect } from '@playwright/test';

test.describe('Active User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Shared login for all feature tests
    await page.goto('/auth/sign-in');
    await page.locator('input[id="email"]').fill('admin@ludevv.com');
    await page.locator('input[id="password"]').fill('Password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('Billing: should trigger Polar.sh modal and handle success', async ({ page }) => {
    // Navigate to Pricing
    await page.goto('/payments/pricing');
    
    // Intercept checkout API call to mock Polar URL
    await page.route('**/api/v1/billing/checkout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.polar.sh/test-session' }),
      });
    });
    
    // Click upgrade on a plan (e.g. Growth)
    await page.getByRole('button', { name: /Upgrade|Growth|Elegir/i }).first().click();
    
    // Now on Checkout page
    await expect(page).toHaveURL(/\/payments\/checkout/);
    
    // Click primary pay button
    await page.click('button:has-text("pago seguro")');
    
    // Simulate Polar Modal callback by navigating to success URL
    // In a real modal, this happens via redirect or event
    await page.goto('/payments?success=true');
    
    // Verify success UI
    await expect(page.getByText(/Gracias por tu compra|éxito|activado/i)).toBeVisible();
  });

  test('Tickets: should create and view a support ticket', async ({ page }) => {
    // Navigate to Tickets via sidebar or direct URL
    await page.goto('/tickets');
    
    // Click create button
    // The link is /tickets/create
    await page.click('a[href="/tickets/create"]');
    
    const subject = `E2E Support Request ${Date.now()}`;
    await page.locator('input[name="subject"]').fill(subject);
    // Body might be a textarea or a custom editor
    await page.locator('textarea[name="body"]').fill('This is a test ticket created by Playwright.');
    
    await page.locator('button[type="submit"]').click();
    
    // Should redirect back to list
    await expect(page).toHaveURL(/\/tickets/);
    
    // Verify ticket appears in list
    await expect(page.getByText(subject)).toBeVisible();
  });
});
