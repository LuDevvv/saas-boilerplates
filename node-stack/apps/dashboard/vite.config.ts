import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./assets"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@common": path.resolve(__dirname, "./src/components/common"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@helpers": path.resolve(__dirname, "./src/helpers"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@api": path.resolve(__dirname, "./src/api"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@ui": path.resolve(__dirname, "./src/components/ui"),
        "@elements": path.resolve(__dirname, "./src/components/elements"),
        "@lib": path.resolve(__dirname, "./src/lib"),
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt"],
        manifest: {
          name: "Premium Dashboard Boilerplate",
          short_name: "Dashboard",
          description: "A premium boilerplate for building high-end dashboards.",
          theme_color: "#3b82f6",
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
          maximumFileSizeToCacheInBytes: 5000000,
        },
      }),
    ],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('zustand')) {
                return 'vendor-store';
              }
              return 'vendor-misc';
            }
            return undefined;
          }
        }
      }
    },
  };
});
