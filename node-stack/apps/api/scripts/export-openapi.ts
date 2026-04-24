import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { setupSwagger } from '../src/common/docs/swagger.config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to export the OpenAPI JSON specification.
 * This is used by the SDK generator to build the client.
 */
async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  // Align with main.ts prefix
  app.setGlobalPrefix('v1', {
    exclude: [
      '/api/docs',
      '/api/docs-json',
      '/billing/webhook',
      '/health',
      '/health/live',
      '/health/ready',
    ],
  });
  
  const document = setupSwagger(app);
  const outputPath = path.resolve(__dirname, '../openapi-spec.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI spec exported to: ${outputPath}`);
  
  await app.close();
  process.exit(0);
}

exportOpenApi().catch((err) => {
  console.error('❌ Failed to export OpenAPI spec:', err);
  process.exit(1);
});
