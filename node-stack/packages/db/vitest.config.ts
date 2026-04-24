import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'db-integration',
    globals: true,
    environment: 'node',
    include: ['src/testing/**/*.int-spec.ts'],
    globalSetup: '../../scripts/vitest-global-setup.ts',
    testTimeout: 60000,
  },
});
