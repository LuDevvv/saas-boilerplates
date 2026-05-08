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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 60,
        branches: 40,
        functions: 60,
        statements: 60,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/test/**',
        '**/*.config.*',
        '**/migrations/**',
      ],
    },
  },
});
