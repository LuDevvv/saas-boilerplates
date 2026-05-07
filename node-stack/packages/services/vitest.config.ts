import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "services-unit",
    globals: true,
    environment: "node",
  },
});
