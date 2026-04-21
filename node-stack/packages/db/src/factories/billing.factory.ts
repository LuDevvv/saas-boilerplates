import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index.js';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export async function createSubscription(
  db: NodePgDatabase<typeof schema>,
  workspaceId: string,
  plan: SubscriptionPlan = 'pro',
  overrides: Partial<typeof schema.subscriptions.$inferInsert> = {},
): Promise<typeof schema.subscriptions.$inferSelect> {
  const { faker } = await import('@faker-js/faker');
  const [subscription] = await db
    .insert(schema.subscriptions)
    .values({
      workspaceId,
      planId: plan,
      variantId: 'monthly', // default
      status: 'active',
      providerSubscriptionId: faker.string.uuid(),
      nextPaymentAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ...overrides,
    })
    .returning();
  return subscription;
}
