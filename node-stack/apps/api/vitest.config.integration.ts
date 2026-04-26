import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    name: 'api-integration',
    globals: true,
    environment: 'node',
    include: ['test/integration/**/*.spec.ts', 'test/**/*.int-spec.ts'],
    globalSetup: '../../scripts/vitest-global-setup.ts',
    testTimeout: 300000,
    hookTimeout: 300000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
