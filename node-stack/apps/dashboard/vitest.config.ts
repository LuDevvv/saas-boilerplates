import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@node-stack/api-client": path.resolve(__dirname, "../../packages/api-client/src/index.ts"),
      "@node-stack/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
    },
  },
});
