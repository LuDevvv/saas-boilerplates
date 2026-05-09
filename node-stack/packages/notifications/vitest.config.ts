import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'notifications-unit',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
