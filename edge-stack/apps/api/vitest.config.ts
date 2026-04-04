import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

/**
 * Vitest configuration for the 'Edge' pool.
 * Runs in the Cloudflare Workers sandbox using @cloudflare/vitest-pool-workers.
 * Uses wrangler.toml to resolve bindings and environment variables.
 */
export default defineWorkersConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "wrangler.toml" },
      },
    },
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
