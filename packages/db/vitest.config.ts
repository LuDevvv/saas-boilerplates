import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@workspace/testing": path.resolve(__dirname, "../testing/src"),
      "@workspace/db": path.resolve(__dirname, "./src"),
    },
  },
});
