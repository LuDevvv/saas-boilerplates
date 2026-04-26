import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'api-unit',
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    alias: {
      '@node-stack/db/schema': resolve(__dirname, '../../packages/db/src/schema/index.ts'),
      '@node-stack/db': resolve(__dirname, '../../packages/db/src/index.ts'),
      '@node-stack/cache': resolve(__dirname, '../../packages/cache/src/index.ts'),
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/test/e2e/**', '**/test/integration/**'],
  },

  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});




