/**
 * Standalone OpenAPI spec generator.
 *
 * Bootstraps the NestJS application without starting the HTTP server,
 * generates the OpenAPI document, writes it to openapi-spec.json, and exits.
 *
 * Usage:
 *   GENERATE_OPENAPI=true node --import tsx src/main.ts
 *
 * Or directly:
 *   node --import tsx scripts/generate-openapi-spec.ts
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../..');
const SPEC_PATH = join(__dirname, '../openapi-spec.json');
const DIST_MAIN = join(__dirname, '../dist/src/main.js');

async function generate(): Promise<void> {
  if (!existsSync(DIST_MAIN)) {
    throw new Error(
      `API must be compiled first.\nExpected: ${DIST_MAIN}\nRun: pnpm --filter @node-stack/api build`,
    );
  }

  console.log('Starting API in OpenAPI generation mode...');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GENERATE_OPENAPI: 'true',
    SKIP_TRACING: 'true',
    // Drizzle/pg pool is lazy — dummy URL is safe for spec generation
    DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
    REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
    PORT: '4999',
    NODE_ENV: 'development',
  };

  const child = spawn(
    'node',
    ['--env-file=.env', DIST_MAIN],
    { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] },
  );

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Timeout: API did not write spec within 60s'));
    }, 60_000);

    child.stdout?.on('data', (chunk: Buffer) => {
      const line = chunk.toString();
      process.stdout.write(line);
      if (line.includes('OpenAPI spec written to')) {
        // The spec was already written by main.ts; process will exit(0) itself.
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk.toString());
    });

    child.on('close', (code: number | null) => {
      clearTimeout(timeout);
      if (code === 0) {
        console.log(`\nSpec generated: ${SPEC_PATH}`);
        resolve();
      } else {
        reject(new Error(`API process exited with code ${code ?? 'null'}`));
      }
    });
  });
}

generate().catch((err: unknown) => {
  console.error('OpenAPI generation failed:', err);
  process.exit(1);
});
