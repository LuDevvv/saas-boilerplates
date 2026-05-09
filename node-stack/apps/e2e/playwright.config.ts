import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for NodeStack
 * 
 * Target: apps/dashboard
 * Backend: apps/api
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @node-stack/api start:test',
      port: 4000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '4000',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'pnpm --filter @node-stack/dashboard dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
