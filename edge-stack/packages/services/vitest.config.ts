import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
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
      "@workspace/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
});
