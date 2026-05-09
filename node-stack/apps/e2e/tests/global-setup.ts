import { execSync } from 'child_process';
import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Preparing test database...');
  try {
    // Sync schema
    execSync('pnpm --filter @node-stack/db db:push', { stdio: 'inherit' });
    // Seed default data
    execSync('pnpm --filter @node-stack/db db:seed', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to prepare test database:', error);
    throw error;
  }
}

export default globalSetup;
