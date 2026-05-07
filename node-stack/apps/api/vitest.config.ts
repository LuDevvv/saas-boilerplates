import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'api-unit',
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    alias: [
      // Strip the .js suffix and rewrite the @/ path alias to absolute
      // src/ paths so vitest can resolve TypeScript sources directly.
      { find: /^@\/(.*)\.js$/, replacement: resolve(__dirname, 'src') + '/$1.ts' },
      { find: /^@\/(.*)$/, replacement: resolve(__dirname, 'src') + '/$1' },
      { find: '@node-stack/db/schema', replacement: resolve(__dirname, '../../packages/db/src/schema/index.ts') },
      { find: '@node-stack/db', replacement: resolve(__dirname, '../../packages/db/src/index.ts') },
      { find: '@node-stack/cache', replacement: resolve(__dirname, '../../packages/cache/src/index.ts') },
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/test/e2e/**', '**/test/integration/**'],
  },

  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});




