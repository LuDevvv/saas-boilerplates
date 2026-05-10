import { resolve } from 'path';
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
    alias: [
      { find: /^@\/(.*)\.js$/, replacement: resolve(__dirname, 'src') + '/$1.ts' },
      { find: /^@\/(.*)$/, replacement: resolve(__dirname, 'src') + '/$1' },
      { find: '@node-stack/db/schema', replacement: resolve(__dirname, '../../packages/db/src/schema/index.ts') },
      { find: '@node-stack/db', replacement: resolve(__dirname, '../../packages/db/src/index.ts') },
      { find: '@node-stack/cache', replacement: resolve(__dirname, '../../packages/cache/src/index.ts') },
      { find: '@node-stack/validators', replacement: resolve(__dirname, '../../packages/validators/src/index.ts') },
      { find: '@node-stack/config', replacement: resolve(__dirname, '../../packages/config/src/index.ts') },
      { find: '@node-stack/utils', replacement: resolve(__dirname, '../../packages/utils/src/index.ts') },
    ],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
