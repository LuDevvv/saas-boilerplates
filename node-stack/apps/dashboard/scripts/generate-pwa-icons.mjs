import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const sourceIcon = path.join(publicDir, "Logo.svg");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const sizes = [
  { size: 192, name: "pwa-192x192.png", padding: 20 },
  { size: 512, name: "pwa-512x512.png", padding: 50 },
  { size: 192, name: "pwa-maskable-192x192.png", padding: 40, maskable: true },
  { size: 512, name: "pwa-maskable-512x512.png", padding: 100, maskable: true },
  { size: 180, name: "apple-touch-icon.png", padding: 20 },
];

async function generateIcons() {
  console.log("🎨 Generando iconos PWA...\n");

  for (const { size, name, padding, maskable } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      const iconSize = size - padding * 2;

      // Create a canvas with background
      const background = maskable
        ? Buffer.from(
            `<svg width="${size}" height="${size}">
              <rect width="${size}" height="${size}" fill="#3b82f6"/>
            </svg>`
          )
        : Buffer.from(
            `<svg width="${size}" height="${size}">
              <rect width="${size}" height="${size}" fill="#ffffff"/>
            </svg>`
          );

      // Resize the logo and composite it on the background
      await sharp(sourceIcon)
        .resize(iconSize, iconSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer()
        .then((logoBuffer) =>
          sharp(background)
            .composite([
              {
                input: logoBuffer,
                top: padding,
                left: padding,
              },
            ])
            .png()
            .toFile(outputPath)
        );

      console.log(`✅ Generado: ${name} (${size}x${size}px)`);
    } catch (error) {
      console.error(`❌ Error generando ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (32x32)
  try {
    const faviconPath = path.join(publicDir, "favicon.ico");
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(faviconPath);
    console.log(`✅ Generado: favicon.ico (32x32px)`);
  } catch (error) {
    console.error(`❌ Error generando favicon.ico:`, error.message);
  }

  console.log("\n🎉 ¡Todos los iconos PWA han sido generados exitosamente!");
}

generateIcons().catch(console.error);
