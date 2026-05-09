import { execSync } from 'child_process';

import type { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig): Promise<void> {
  if (!process.env['DATABASE_URL']) {
    throw new Error('[E2E] DATABASE_URL is required for E2E global setup');
  }

  console.log('[E2E] Preparing test database...');

  // Push schema (idempotent — safe to run on an existing DB)
  try {
    execSync('pnpm --filter @node-stack/db db:push', { stdio: 'inherit' });
    console.log('[E2E] Schema up to date.');
  } catch {
    console.warn('[E2E] db:push warning — schema may already be current, continuing.');
  }

  // Seed test user and base data
  try {
    execSync('pnpm --filter @node-stack/db db:seed', { stdio: 'inherit' });
    console.log('[E2E] Test data seeded.');
  } catch {
    console.warn('[E2E] db:seed warning — data may already exist, continuing.');
  }
}

export default globalSetup;
