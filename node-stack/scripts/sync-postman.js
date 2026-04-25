import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import converter from 'openapi-to-postmanv2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAPI_PATH = path.resolve(__dirname, '../apps/api/openapi-spec.json');
const OUTPUT_PATH = path.resolve(__dirname, '../postman/node_stack.postman_collection.json');

/**
 * Automate Postman Collection sync from OpenAPI.
 * Includes folder organization and auth script injection.
 */
async function syncPostman() {
  console.log('🚀 Starting Postman collection sync...');

  if (!fs.existsSync(OPENAPI_PATH)) {
    console.error(`❌ OpenAPI spec not found at: ${OPENAPI_PATH}`);
    console.log('💡 Run "pnpm --filter @node-stack/api openapi:export" first.');
    process.exit(1);
  }

  const openApiData = fs.readFileSync(OPENAPI_PATH, 'utf8');

  converter.convert({ type: 'string', data: openApiData }, {
    folderStrategy: 'Tags',
    includeAuthInfoInExample: true,
    optimizeConversion: true,
    stacklimit: 10,
  }, (err, status) => {
    if (err) {
      console.error('❌ Conversion failed:', err);
      process.exit(1);
    }

    if (!status.result) {
      console.error('❌ Conversion status result is false:', status.reason);
      process.exit(1);
    }

    let collection = status.output[0].data;

    // --- Post-Processing ---
    console.log('🔧 Enhancing collection with premium features...');

    // 1. Set global base URL
    collection.item.forEach(folder => {
      if (folder.item) {
        folder.item.forEach(request => {
          if (request.request && request.request.url) {
            // Replace hardcoded host with {{base_url}}
            request.request.url.host = ['{{base_url}}'];
          }
        });
      }
    });

    // 2. Inject Auth Scripts
    injectAuthScripts(collection);

    // 3. Save
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(collection, null, 2));
    console.log(`✅ Postman collection updated: ${OUTPUT_PATH}`);
  });
}

/**
 * Injects test scripts for Login and Register to extract tokens.
 */
function injectAuthScripts(collection) {
  const authFolder = collection.item.find(i => i.name.toLowerCase().includes('auth'));
  if (!authFolder || !authFolder.item) return;

  authFolder.item.forEach(request => {
    const name = request.name.toLowerCase();
    if (name.includes('login') || name.includes('register')) {
      console.log(`   📝 Injecting auth script into: ${request.name}`);
      
      request.event = [
        {
          listen: 'test',
          script: {
            exec: [
              "let jsonData = pm.response.json();",
              "let token = jsonData.accessToken || (jsonData.data && jsonData.data.token);",
              "if (token) pm.environment.set('access_token', token);",
              "let refresh = jsonData.refreshToken || (jsonData.data && jsonData.data.refreshToken);",
              "if (refresh) pm.environment.set('refresh_token', refresh);",
              "if (jsonData.requires2FA || (jsonData.data && jsonData.data.pending2faToken)) pm.environment.set('pending_2fa_token', jsonData.tempToken || jsonData.data.pending2faToken);"
            ],
            type: 'text/javascript'
          }
        }
      ];
    }
  });
}

syncPostman().catch(console.error);
