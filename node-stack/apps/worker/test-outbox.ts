import { Logger } from "@nestjs/common";
import { db, schema, eq } from "@node-stack/db";
import { OutboxWriter } from "./src/processors/outbox.writer";
import {
  OutboxProcessor,
  EventHandlers,
} from "./src/processors/outbox.processor";

const logger = new Logger("TestOutbox");

// Simple event handlers for testing
const handlers: EventHandlers = {
  "user.created": async (event) => {
    logger.log(`Processing user.created: ${event.id}`);
    const payload = event.payload as { userId: string; email: string };
    logger.log(`User email: ${payload.email}`);
  },
  "subscription.activated": async (event) => {
    logger.log(`Processing subscription.activated: ${event.id}`);
  },
};

async function testOutbox() {
  logger.log("Testing Outbox Pattern...\n");

  // 1. Write events to outbox
  const writer = new OutboxWriter();

  await writer.write({
    eventType: "user.created",
    payload: { userId: "user_123", email: "test@example.com" },
  });

  await writer.write({
    eventType: "subscription.activated",
    payload: { subscriptionId: "sub_456", customerId: "cus_789" },
  });

  logger.log("✅ 1. Wrote 2 events to outbox");

  // 2. Verify events are pending
  const pendingEvents = await db.query.outbox.findMany({
    where: eq(schema.outbox.processed, false),
  });
  logger.log(`✅ 2. Found ${pendingEvents.length} pending events`);

  // 3. Process events
  const processor = new OutboxProcessor();
  processor.setEventHandlers(handlers);
  processor.start();

  // Wait a bit for processing
  await new Promise((resolve) => setTimeout(resolve, 2000));
  processor.stop();

  // 4. Verify all events are processed
  const remainingEvents = await db.query.outbox.findMany({
    where: eq(schema.outbox.processed, false),
  });
  logger.log(`✅ 3. Remaining pending events: ${remainingEvents.length}`);

  // 5. Check all processed events
  const allEvents = await db.query.outbox.findMany({});
  logger.log(`\nTotal events in outbox: ${allEvents.length}`);
  logger.log(
    `Processed events: ${allEvents.filter((e) => e.processed).length}`,
  );

  logger.log("\n✅ Outbox test completed!");
}

testOutbox().catch(console.error);
