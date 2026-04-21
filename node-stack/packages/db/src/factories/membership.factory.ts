import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index.js';

export type MemberRole = 'owner' | 'admin' | 'member';

export async function createMembership(
  db: NodePgDatabase<typeof schema>,
  userId: string,
  workspaceId: string,
  role: MemberRole = 'member',
): Promise<typeof schema.memberships.$inferSelect> {
  const [membership] = await db
    .insert(schema.memberships)
    .values({ userId, workspaceId, role })
    .returning();
  return membership;
}
