import path from "path";
import { fileURLToPath } from "url";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),

        // FSD Layer Aliases
        "@app": path.resolve(__dirname, "./src/app"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@entities": path.resolve(__dirname, "./src/entities"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),

        // Legacy aliases (gradually migrate)
        "@assets": path.resolve(__dirname, "./assets"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@common": path.resolve(__dirname, "./src/components/common"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@api": path.resolve(__dirname, "./src/api"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@ui": path.resolve(__dirname, "./src/components/ui"),
        "@elements": path.resolve(__dirname, "./src/components/elements"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@data": path.resolve(__dirname, "./src/data"),
        "@node-stack/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
        "@node-stack/api-client": path.resolve(__dirname, "../../packages/api-client/src/index.ts"),
        "@node-stack/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
        "@node-stack/validators": path.resolve(__dirname, "../../packages/validators/src/index.ts"),
        "@node-stack/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      },
    },
    define: {
      'process.env': {},
    },
    optimizeDeps: {
      exclude: ['nestjs-zod', '@nestjs/common', '@nestjs/core', '@nestjs/swagger'],
    },
    plugins: [
      react(),
      {
        name: 'mock-nestjs',
        enforce: 'pre',
        resolveId(id) {
          if (['nestjs-zod', '@nestjs/common', '@nestjs/core', '@nestjs/swagger', 'node:module'].includes(id) || id.startsWith('@nestjs/')) {
            return id;
          }
          return null;
        },
        load(id) {
          if (id === 'node:module') {
            return 'export const createRequire = () => ({}); export default { createRequire };';
          }
          if (['nestjs-zod', '@nestjs/common', '@nestjs/core', '@nestjs/swagger'].includes(id) || id.startsWith('@nestjs/')) {
            return 'export const createZodDto = (s) => { return class { static schema = s; constructor() {} }; }; export const ApiProperty = () => (() => {}); export const ApiPropertyOptional = () => (() => {}); export const Injectable = () => (() => {}); export const Module = () => (() => {}); export const Controller = () => (() => {}); export const HttpStatus = { OK: 200, CREATED: 201 }; export const BadRequestException = class extends Error {}; export const InternalServerErrorException = class extends Error {}; export const HttpCode = () => (() => {}); export const Optional = () => (() => {}); export const SetMetadata = () => (() => {});';
          }
          return null;
        }
      },
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt"],
        manifest: {
          name: "NodeStack - Dashboard",
          short_name: "NodeStack",
          description: "Panel de administración de NodeStack",
          theme_color: "#7144F9",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          maximumFileSizeToCacheInBytes: 5000000,
          sourcemap: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        external: ['node:module'],
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-ui": ["@node-stack/ui"],
            "vendor-charts": ["recharts"],
            "vendor-state": ["zustand"],
            "vendor-forms": ["react-hook-form", "zod"],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
    server: {
      host: true,
      port: 5173,
    }
  };
});