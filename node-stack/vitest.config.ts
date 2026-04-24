import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/*/vitest.config.ts',
      'apps/api/vitest.config.ts',
      'apps/api/vitest.config.integration.ts',
      'apps/api/vitest.config.e2e.ts',
      'apps/worker/vitest.config.ts',
    ],
  },
});
