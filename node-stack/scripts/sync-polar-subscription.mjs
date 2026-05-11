/**
 * One-time script: pulls the active Polar subscription and inserts customer +
 * subscription records directly into the local DB (bypassing the webhook path).
 *
 * Usage:
 *   node scripts/sync-polar-subscription.mjs
 *
 * Reads all config from .env in the monorepo root.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createCipheriv, randomBytes } from "crypto";
import pg from "pg";

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

const {
  POLAR_ACCESS_TOKEN,
  POLAR_SERVER = "production",
  POLAR_ORGANIZATION_ID,
  DATABASE_URL,
  ENCRYPTION_KEY,
} = process.env;

const BASE_URL = POLAR_SERVER === "sandbox"
  ? "https://sandbox-api.polar.sh"
  : "https://api.polar.sh";

// ─── AES-256-GCM encrypt (matches EncryptionUtils in packages/services) ───────
function encrypt(plaintext) {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let enc = cipher.update(plaintext, "utf8", "hex");
  enc += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc}`;
}

async function polarGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${POLAR_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Polar GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

const STATUS_MAP = {
  active: "active",
  trialing: "trialling",
  past_due: "past_due",
  canceled: "cancelled",
  cancelled: "cancelled",
  unpaid: "unpaid",
  paused: "paused",
};

async function main() {
  console.log("🔍 Fetching subscriptions from Polar…");

  const data = await polarGet(`/v1/subscriptions?organization_id=${POLAR_ORGANIZATION_ID}&limit=50&sorting=-started_at`);
  const items = data.items ?? data.result?.items ?? [];

  if (items.length === 0) {
    console.log("❌ No subscriptions found for this organization.");
    return;
  }

  console.log(`Found ${items.length} subscription(s):\n`);
  for (const sub of items) {
    const meta = { ...(sub.metadata ?? {}), ...(sub.customer?.metadata ?? {}) };
    console.log(`  ID: ${sub.id}  status: ${sub.status}  workspace_id: ${meta.workspace_id ?? "—"}`);
  }

  const active = items.find(s => {
    const m = { ...(s.metadata ?? {}), ...(s.customer?.metadata ?? {}) };
    return !!m.workspace_id && (s.status === "active" || s.status === "trialing");
  });

  if (!active) {
    console.log("\n⚠️  No subscription with workspace_id in metadata found.");
    console.log("    List the subscription IDs above and re-run with: --id <sub-id> --workspace <ws-id>");
    return;
  }

  const meta = { ...(active.metadata ?? {}), ...(active.customer?.metadata ?? {}) };
  const workspaceId = meta.workspace_id;
  const userId = meta.user_id;
  const customerId = active.customerId ?? active.customer_id;
  const subscriptionId = active.id;
  const productId = active.productId ?? active.product_id;
  const priceId = active.priceId ?? active.price_id;
  const status = STATUS_MAP[active.status] ?? "active";
  const periodStart = active.currentPeriodStart ? new Date(active.currentPeriodStart) : new Date();
  const periodEnd = active.currentPeriodEnd ? new Date(active.currentPeriodEnd) : null;

  console.log(`\n✅ Syncing:`);
  console.log(`   Subscription ID: ${subscriptionId}`);
  console.log(`   Customer ID:     ${customerId}`);
  console.log(`   Workspace ID:    ${workspaceId}`);
  console.log(`   User ID:         ${userId}`);
  console.log(`   Product:         ${productId}`);
  console.log(`   Status:          ${status}`);

  // ─── Connect to DB ──────────────────────────────────────────────────────────
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Set RLS context for this workspace
    await client.query("SELECT set_config('app.current_workspace_id', $1, true)", [workspaceId]);

    // Upsert customer
    const encryptedCustomerId = encrypt(customerId);
    await client.query(`
      INSERT INTO customers (workspace_id, provider_customer_id, provider, created_at, updated_at)
      VALUES ($1, $2, 'polar', NOW(), NOW())
      ON CONFLICT (workspace_id) DO UPDATE
        SET provider_customer_id = EXCLUDED.provider_customer_id,
            updated_at = NOW()
    `, [workspaceId, encryptedCustomerId]);
    console.log("\n   ✓ Customer upserted");

    // Upsert subscription
    await client.query(`
      INSERT INTO subscriptions (
        workspace_id, provider_subscription_id, plan_id, variant_id, status,
        current_period_start, current_period_end, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (provider_subscription_id) DO UPDATE
        SET status = EXCLUDED.status,
            plan_id = EXCLUDED.plan_id,
            variant_id = EXCLUDED.variant_id,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            updated_at = NOW()
    `, [workspaceId, subscriptionId, productId, priceId ?? null, status, periodStart, periodEnd]);
    console.log("   ✓ Subscription upserted");

    // Mark onboarding complete for user
    if (userId) {
      await client.query("SELECT set_config('app.current_workspace_id', 'system', true)");
      await client.query(
        "UPDATE users SET onboarding_status = 'completed' WHERE id = $1",
        [userId],
      );
      console.log("   ✓ User onboarding_status set to completed");
    }

    // Record the billing event so it won't be double-processed if webhook fires later
    const fakeEventId = `sync_${subscriptionId}`;
    await client.query(`
      INSERT INTO billing_events (provider_event_id, event_type, processed_at, created_at)
      VALUES ($1, 'subscription.created', NOW(), NOW())
      ON CONFLICT (provider_event_id) DO NOTHING
    `, [fakeEventId]);

    await client.query("COMMIT");
    console.log("\n🎉 Done! Reload the billing page in your browser.");
    console.log("   Note: clear browser cache (hard refresh) if you still see old data.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
