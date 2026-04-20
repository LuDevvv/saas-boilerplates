import fs from "fs";
import os from "os";
import { execSync } from "child_process";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");

console.log("🔄 Checking for GITHUB_TOKEN in .env...");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found at:", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const match = envContent.match(/GITHUB_TOKEN=(.+)/);

if (!match) {
  console.error("❌ GITHUB_TOKEN not found in .env");
  console.log("ℹ️  Please add GITHUB_TOKEN=your_token to your .env file");
  process.exit(1);
}

const token = match[1].trim();
const platform = os.platform();

console.log(`✅ Found GITHUB_TOKEN (length: ${token.length})`);

if (platform === "win32") {
  try {
    console.log(
      "🪟 Windows detected. Attempting to set environment variable persistently..."
    );
    // Set user-level environment variable using PowerShell
    const psCommand = `[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', '${token}', 'User')`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: "inherit" });
    console.log("✅ GITHUB_TOKEN set successfully for User Environment!");
    console.log(
      "🔄 Please restart your terminal (VS Code users: kill terminal and start new one) to apply changes."
    );
  } catch (error) {
    console.error(
      "❌ Failed to set environment variable on Windows:",
      error.message
    );
    process.exit(1);
  }
} else {
  console.log("🐧 Non-Windows platform detected.");
  console.log(
    "⚠️  Automatic persistent environment variables are not yet implemented for this OS via this script."
  );
  console.log(
    "To set it manually, add this to your shell profile (~/.bashrc, ~/.zshrc, etc):"
  );
  console.log(`export GITHUB_TOKEN=${token}`);
}
