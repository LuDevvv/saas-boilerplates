/**
 * Creates Polar Meters for the boilerplate and updates product descriptions.
 *
 * Run once when setting up a new Polar organization:
 *   node scripts/setup-polar-meters.mjs
 *
 * After running, copy the printed meter IDs into plan-features.config.ts
 * and into your Polar product configuration.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const TOKEN  = process.env.POLAR_ACCESS_TOKEN;
const SERVER = process.env.POLAR_SERVER ?? "production";
const ORG_ID = process.env.POLAR_ORGANIZATION_ID;

const BASE = SERVER === "sandbox"
  ? "https://sandbox-api.polar.sh"
  : "https://api.polar.sh";

async function polarReq(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

// ─── Meter definitions ────────────────────────────────────────────────────────

const METERS = [
  {
    slug: "api_calls",
    name: "API Calls",
    description: "Counts every API request made by the workspace",
    filter: {
      conjunction: "and",
      clauses: [{ property: "name", operator: "eq", value: "api_call" }],
    },
    aggregation: { func: "count" },
  },
  {
    slug: "active_users",
    name: "Active Users",
    description: "Number of active members in the workspace",
    filter: {
      conjunction: "and",
      clauses: [{ property: "name", operator: "eq", value: "active_users" }],
    },
    aggregation: { func: "sum", property: "value" },
  },
  {
    slug: "storage_mb",
    name: "Storage (MB)",
    description: "Total storage used by the workspace in megabytes",
    filter: {
      conjunction: "and",
      clauses: [{ property: "name", operator: "eq", value: "storage_mb" }],
    },
    aggregation: { func: "sum", property: "value" },
  },
];

// ─── Product descriptions ────────────────────────────────────────────────────

const PRODUCT_DESCRIPTIONS = {
  [process.env.POLAR_PRODUCT_ID_PRO_MONTHLY]: [
    "**Para equipos en crecimiento.** Todo lo que necesitas para escalar tu negocio.",
    "",
    "✅ Proyectos ilimitados",
    "✅ Analíticas avanzadas",
    "✅ Soporte prioritario 24/7",
    "✅ 10 GB de almacenamiento",
    "✅ Exportación de datos",
    "✅ Acceso API",
    "",
    "Facturado mensualmente. Cancela en cualquier momento.",
  ].join("\n"),
  [process.env.POLAR_PRODUCT_ID_PRO_YEARLY]: [
    "**Para equipos en crecimiento.** Ahorra 15% con el plan anual.",
    "",
    "✅ Proyectos ilimitados",
    "✅ Analíticas avanzadas",
    "✅ Soporte prioritario 24/7",
    "✅ 10 GB de almacenamiento",
    "✅ Exportación de datos",
    "✅ Acceso API",
    "",
    "Facturado anualmente (US$ 290/año). Cancela en cualquier momento.",
  ].join("\n"),
  [process.env.POLAR_PRODUCT_ID_ELITE_MONTHLY]: [
    "**Infraestructura dedicada para organizaciones.** Sin límites, con SLA garantizado.",
    "",
    "✅ Todo lo de Growth",
    "✅ Infraestructura dedicada",
    "✅ SLA del 99.99%",
    "✅ Almacenamiento ilimitado",
    "✅ Manager dedicado",
    "✅ Integraciones personalizadas",
    "✅ Soporte telefónico",
    "",
    "Facturado mensualmente. Cancela en cualquier momento.",
  ].join("\n"),
  [process.env.POLAR_PRODUCT_ID_ELITE_YEARLY]: [
    "**Infraestructura dedicada para organizaciones.** Ahorra 15% con el plan anual.",
    "",
    "✅ Todo lo de Growth",
    "✅ Infraestructura dedicada",
    "✅ SLA del 99.99%",
    "✅ Almacenamiento ilimitado",
    "✅ Manager dedicado",
    "✅ Integraciones personalizadas",
    "✅ Soporte telefónico",
    "",
    "Facturado anualmente (US$ 990/año). Cancela en cualquier momento.",
  ].join("\n"),
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Polar setup script — ${SERVER} environment\n`);

  // ── 1. Check existing meters ──────────────────────────────────────────────
  console.log("📊 Checking existing meters...");
  const existing = await polarReq("GET", `/v1/meters?organization_id=${ORG_ID}`);
  const existingByName = new Map(existing.items?.map(m => [m.name, m]) ?? []);
  console.log(`   Found ${existingByName.size} existing meter(s)\n`);

  // ── 2. Create missing meters ───────────────────────────────────────────────
  const createdMeterIds = {};
  for (const meter of METERS) {
    if (existingByName.has(meter.name)) {
      const m = existingByName.get(meter.name);
      console.log(`   ✓ ${meter.name} already exists (id: ${m.id})`);
      createdMeterIds[meter.slug] = m.id;
      continue;
    }

    try {
      const created = await polarReq("POST", "/v1/meters", {
        name: meter.name,
        filter: meter.filter,
        aggregation: meter.aggregation,
        // organization_id is inferred from the org-scoped access token
      });
      console.log(`   ✅ Created meter "${meter.name}" → id: ${created.id}`);
      createdMeterIds[meter.slug] = created.id;
    } catch (err) {
      console.error(`   ❌ Failed to create "${meter.name}": ${err.message}`);
    }
  }

  // ── 3. Update product descriptions ────────────────────────────────────────
  console.log("\n📦 Updating product descriptions...");
  for (const [productId, description] of Object.entries(PRODUCT_DESCRIPTIONS)) {
    if (!productId || productId.includes("replace")) continue;
    try {
      await polarReq("PATCH", `/v1/products/${productId}`, { description });
      console.log(`   ✅ Updated product ${productId.slice(0, 8)}...`);
    } catch (err) {
      console.error(`   ❌ Failed to update product ${productId}: ${err.message}`);
    }
  }

  // ── 4. Print summary ──────────────────────────────────────────────────────
  console.log(`
\n╔══════════════════════════════════════════════════════════════════╗
║                     SETUP COMPLETE                               ║
╚══════════════════════════════════════════════════════════════════╝

Meter IDs (add to plan-features.config.ts → meters object):
${Object.entries(createdMeterIds).map(([slug, id]) => `  ${slug}: "${id}"`).join("\n")}

Next steps:
  1. In Polar dashboard → Products → attach meters to each product
     (sets the per-unit price for metered billing)
  2. Copy meter IDs above into plan-features.config.ts meters fields
  3. Usage events are reported automatically via BillingService.reportMeterEvent()

`);
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
