/**
 * One-shot script: cancel all active Polar subscriptions for a given email.
 * Run: node --env-file=.env scripts/cancel-user-subscription.mjs
 */

import { Polar } from "@polar-sh/sdk";

const EMAIL   = "miguelangelguerrero99@gmail.com";
const TOKEN   = process.env.POLAR_ACCESS_TOKEN;
const SERVER  = process.env.POLAR_SERVER ?? "sandbox";

if (!TOKEN) {
  console.error("POLAR_ACCESS_TOKEN not set");
  process.exit(1);
}

const polar = new Polar({ accessToken: TOKEN, server: SERVER });

console.log(`\n[Polar ${SERVER}] Looking up customer: ${EMAIL}\n`);

// ── 1. Find the customer ───────────────────────────────────────────────────

const customersPage = await polar.customers.list({ email: EMAIL, limit: 5 });
const customers = customersPage.result?.items ?? [];

if (customers.length === 0) {
  console.log("No Polar customer found for this email. Nothing to do.");
  process.exit(0);
}

for (const customer of customers) {
  console.log(`Customer: ${customer.id} (${customer.email})`);

  // ── 2. List their subscriptions ────────────────────────────────────────
  const subsPage = await polar.subscriptions.list({
    customerId: customer.id,
    limit: 20,
  });
  const subs = subsPage.result?.items ?? [];

  if (subs.length === 0) {
    console.log("  → No subscriptions found.\n");
    continue;
  }

  for (const sub of subs) {
    console.log(`  Subscription: ${sub.id} | status: ${sub.status} | product: ${sub.productId}`);

    if (sub.status === "active" || sub.status === "trialing") {
      // Cancel immediately (revoke) by setting cancelAtPeriodEnd: false + revoking
      // For sandbox testing the simplest approach is to revoke immediately
      try {
        await polar.subscriptions.revoke({ id: sub.id });
        console.log(`  ✓ Revoked subscription ${sub.id}`);
      } catch (err) {
        // If revoke fails, try cancel at period end
        console.log(`  revoke failed (${err.message}), trying cancel...`);
        try {
          await polar.subscriptions.cancel({ id: sub.id });
          console.log(`  ✓ Cancelled subscription ${sub.id}`);
        } catch (err2) {
          console.error(`  ✗ Could not cancel: ${err2.message}`);
        }
      }
    } else {
      console.log(`  → Already ${sub.status}, skipping.`);
    }
  }
}

console.log("\nDone. You can now subscribe again.\n");
