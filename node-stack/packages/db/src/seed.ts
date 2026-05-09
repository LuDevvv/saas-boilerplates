import './env.js';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { createUserWithPassword, createWorkspace } from './factories/index.js';
import * as schema from './schema/index.js';


async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set after trying to load .env files');
  }

  const pool = new Pool({
    connectionString: connectionString
  });
  const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

  // Simple arg parsing
  const args = process.argv.slice(2);
  const tenantArg = args.find(a => a.startsWith('--tenant='));
  const specificSlug = tenantArg ? tenantArg.split('=')[1] : null;

  console.warn('--- Starting Database Seeding ---');

  try {
    if (specificSlug) {
      console.warn(`[Atomic Seed] Targeting tenant: ${specificSlug}`);

      // Atomic Seeding Logic
      const adminEmail = `${specificSlug}-admin@example.com`;
      const adminPassword = 'password123';

      console.warn(`Creating/Updating user for ${specificSlug}: ${adminEmail}...`);
      const { user: admin } = await createUserWithPassword(db, adminPassword, {
        email: adminEmail,
        name: `${specificSlug} Admin`,
        role: 'user', // regular user for tenant seeds
        emailVerified: true,
      });

      console.warn(`Creating/Updating workspace: ${specificSlug}...`);
      const workspace = await createWorkspace(db, admin.id, {
        name: specificSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: specificSlug,
      });

      console.warn('Linking user to workspace...');
      await db
        .insert(schema.memberships)
        .values({ userId: admin.id, workspaceId: workspace.id, role: 'admin' })
        .onConflictDoUpdate({
          target: [schema.memberships.userId, schema.memberships.workspaceId],
          set: { role: 'admin' }
        });

      console.warn(`✅ Atomic seed for ${specificSlug} complete.`);
      console.warn(`Credentials: ${adminEmail} / ${adminPassword}`);
    } else {
      // 1. Create/Update Super User
      const adminEmail = 'admin@ludevv.com';
      const adminPassword = 'Password123';

      console.warn(`Creating/Updating super user: ${adminEmail}...`);
      const { user: admin } = await createUserWithPassword(db, adminPassword, {
        email: adminEmail,
        name: 'Super Admin',
        role: 'super_admin',
        emailVerified: true,
      });
      console.warn('✅ Super user created/updated.');

      // 2. Create/Find Default Workspace
      const workspaceName = 'Main Laboratory';
      const workspaceSlug = 'main-laboratory';

      console.warn(`Creating/Updating workspace: ${workspaceName}...`);
      const workspace = await createWorkspace(db, admin.id, {
        name: workspaceName,
        slug: workspaceSlug,
      });
      console.warn('✅ Workspace created/updated.');

      // 3. Link user to workspace with ADMIN role
      console.warn('Linking user to workspace with ADMIN role...');
      await db
        .insert(schema.memberships)
        .values({ userId: admin.id, workspaceId: workspace.id, role: 'admin' })
        .onConflictDoUpdate({
          target: [schema.memberships.userId, schema.memberships.workspaceId],
          set: { role: 'admin' }
        });
      console.warn('✅ Membership created/updated.');

      console.warn('--- Full Seeding Complete ---');
      console.warn(`Credentials: ${adminEmail} / ${adminPassword}`);
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
