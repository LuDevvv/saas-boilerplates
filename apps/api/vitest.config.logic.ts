import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest configuration for the 'Logic' pool.
 * Runs in a pure Node.js environment using better-sqlite3 for fast,
 * in-memory database testing without Cloudflare Worker overhead.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    exclude: ["node_modules/**"],
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.logic.setup.ts"],
  },
  resolve: {
    alias: {
      "@workspace/testing": path.resolve(
        __dirname,
        "../../packages/testing/src",
      ),
      "@workspace/db": path.resolve(__dirname, "../../packages/db/src"),
      "@workspace/validators": path.resolve(
        __dirname,
        "../../packages/validators/src",
      ),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
