import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Checks the bundle size of a Cloudflare Worker after dry-run build.
 * Fails if the compressed or minified bundle exceeds the limit.
 */
function checkBundleSize(appPath: string, limitKb: number) {
  console.log(`\n📦 Checking bundle size for ${appPath}...`);
  const absoluteAppPath = path.resolve(process.cwd(), appPath);

  try {
    // 1. Run build (wrangler deploy --dry-run --outdir dist)
    console.log("🛠️  Running build...");
    execSync("pnpm run build", { cwd: absoluteAppPath, stdio: "inherit" });

    // 2. Identify the bundled file (usually index.js or src/index.js in the outdir)
    const distPath = path.join(absoluteAppPath, "dist");

    // Find the first .js or .mjs file in dist
    const files = fs.readdirSync(distPath, { recursive: true }) as string[];
    const bundleFile = files.find(
      (f) => f.endsWith(".js") || f.endsWith(".mjs"),
    );

    if (!bundleFile) {
      throw new Error(`Could not find bundled file in ${distPath}`);
    }

    const bundleFilePath = path.join(distPath, bundleFile);
    const stats = fs.statSync(bundleFilePath);
    const sizeKb = stats.size / 1024;

    console.log(`📏 Bundle file: ${bundleFile}`);
    console.log(
      `📏 Final Size: ${sizeKb.toFixed(2)} KB (Limit: ${limitKb} KB)`,
    );

    if (sizeKb > limitKb) {
      console.error(`❌ FAILED: Bundle size exceeds limit of ${limitKb} KB!`);
      process.exit(1);
    } else if (sizeKb > limitKb * 0.75) {
      // Warn at 75% of limit (which is 600KB for 800KB limit)
      console.warn(
        `⚠️  WARNING: Bundle size is getting large: ${sizeKb.toFixed(2)} KB (> ${(limitKb * 0.75).toFixed(0)} KB)`,
      );
    } else {
      console.log("✅ PASSED: Bundle size within limit.");
    }
  } catch (error) {
    console.error("❌ Error checking bundle size:", error);
    process.exit(1);
  }
}

// Default limits from backlog
// Adjusted to 800KB to accommodate Sentry + OpenAPI/Scalar UI
const API_LIMIT_KB = 800;
const WARNING_LIMIT_KB = 600;

// Run checks
checkBundleSize("apps/api", API_LIMIT_KB);

// Add warning logic inside checkBundleSize if needed or just handle here.
// Actually, let's update the checkBundleSize function in the script to handle warning.
// checkBundleSize("apps/jobs-worker", 400); // Optional: jobs worker is allowed to be heavier?
// Backlog mostly emphasized API worker for cold starts.
