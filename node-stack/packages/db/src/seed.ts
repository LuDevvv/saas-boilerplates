import './env.js';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';
import { createUserWithPassword, createWorkspace } from './factories/index.js';

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set after trying to load .env files');
  }

  const pool = new Pool({
    connectionString: connectionString
  });
  const db = drizzle(pool, { schema });

  console.log('--- Starting Database Seeding ---');

  try {
    // 1. Create/Update Super User
    const adminEmail = 'admin@ludevv.com';
    const adminPassword = 'password123';
    
    console.log(`Creating/Updating super user: ${adminEmail}...`);
    const { user: admin } = await createUserWithPassword(db as any, adminPassword, {
      email: adminEmail,
      name: 'Super Admin',
      role: 'super_admin',
      emailVerified: true,
    });
    console.log('✅ Super user created/updated.');

    // 2. Create/Find Default Workspace
    const workspaceName = 'Main Laboratory';
    const workspaceSlug = 'main-laboratory';
    
    console.log(`Creating/Updating workspace: ${workspaceName}...`);
    const workspace = await createWorkspace(db as any, admin.id, {
      name: workspaceName,
      slug: workspaceSlug,
    });
    console.log('✅ Workspace created/updated.');

    // 3. Link user to workspace with ADMIN role (Factory creates 'owner', so we update it)
    console.log('Linking user to workspace with ADMIN role...');
    await (db as any)
      .insert(schema.memberships)
      .values({ userId: admin.id, workspaceId: workspace.id, role: 'admin' })
      .onConflictDoUpdate({
        target: [schema.memberships.userId, schema.memberships.workspaceId],
        set: { role: 'admin' }
      });
    console.log('✅ Membership created/updated.');

    console.log('--- Seeding Complete ---');
    console.log(`Credentials: ${adminEmail} / ${adminPassword}`);
    console.log(`Workspace: ${workspaceName} (${workspaceSlug})`);

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
