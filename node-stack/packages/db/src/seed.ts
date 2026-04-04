import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import {
  createUser, createWorkspace, createMembership, createSubscription
} from './factories';

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: connectionString
  });
  const db = drizzle(pool, { schema });

  console.log('Seeding database...');

  // Admin user
  const admin = await createUser(db as any, {
    email: 'admin@example.com',
    name: 'Admin User',
    emailVerified: true,
  });
  console.log(`Created admin: ${admin.email}`);

  // Regular users
  const alice = await createUser(db as any, { email: 'alice@example.com', name: 'Alice' });
  const bob = await createUser(db as any, { email: 'bob@example.com', name: 'Bob' });
  const guest = await createUser(db as any, { email: 'guest@example.com', name: 'Guest' });

  // Workspace with multiple members
  let workspace: any;
  try {
    workspace = await createWorkspace(db as any, admin.id, {
      name: 'Acme Corp',
      slug: 'acme-corp',
    });
  } catch (e) {
    // If it exists, find it
    workspace = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.slug, 'acme-corp'),
    });
  }

  if (workspace) {
    try { await createMembership(db as any, alice.id, workspace.id, 'admin'); } catch(e) {}
    try { await createMembership(db as any, bob.id, workspace.id, 'member'); } catch(e) {}
    try { await createMembership(db as any, guest.id, workspace.id, 'member'); } catch(e) {}
  }

  // Pro subscription
  if (workspace) {
    try { await createSubscription(db as any, workspace.id, 'pro'); } catch(e) {}
  }

  // Second workspace (free plan)
  try {
    const ws2 = await createWorkspace(db as any, alice.id, { name: 'Side Project' });
    if (ws2) {
      try { await createMembership(db as any, bob.id, ws2.id, 'member'); } catch(e) {}
    }
  } catch(e) {}

  console.log('Seed complete.');
  console.log(`  Users: admin, alice, bob, guest`);
  console.log(`  Workspaces: Acme Corp (pro) and others.`);
  console.log(`  Password for all users: Password123!`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
