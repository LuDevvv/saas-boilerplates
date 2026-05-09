import fs from 'fs';
import path from 'path';

// Node 20+ supports process.loadEnvFile
// Try to load env file from various levels
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      // @ts-ignore - only available in Node 20.6.0+
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
        // console.log(`Loaded env from ${envPath}`);
      }
    } catch {
      // ignore errors loading env file
    }
  }
}
