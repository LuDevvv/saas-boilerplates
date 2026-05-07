import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index.js';
import { withTransaction } from '../index.js';

export type CreateWorkspaceInput = Partial<typeof schema.workspaces.$inferInsert>;

export async function createWorkspace(
  db: NodePgDatabase<typeof schema>,
  ownerUserId: string,
  overrides: CreateWorkspaceInput = {},
): Promise<typeof schema.workspaces.$inferSelect> {
  const { faker } = await import('@faker-js/faker');
  const name = overrides.name ?? faker.company.name();
  const slug = overrides.slug
    ?? name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 48)
         + '-' + faker.string.alphanumeric(4);

  return withTransaction(async (tx) => {
    const [workspace] = await (tx as any)
      .insert(schema.workspaces)
      .values({ name, slug, ...overrides })
      .onConflictDoUpdate({
        target: schema.workspaces.slug,
        set: { name: name }
      })
      .returning();

    // Always create owner membership
    await (tx as any).insert(schema.memberships).values({
      userId: ownerUserId,
      workspaceId: workspace.id,
      role: 'owner',
    }).onConflictDoNothing();

    return workspace;
  }, db as any);
}
