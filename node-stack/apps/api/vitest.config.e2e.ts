import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    name: 'api-e2e',
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: '../../scripts/vitest-global-setup.ts',
    testTimeout: 60000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
