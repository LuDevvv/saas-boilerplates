import bcrypt from 'bcrypt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

export type CreateUserInput = Partial<typeof schema.users.$inferInsert>;

export async function createUser(
  db: NodePgDatabase<typeof schema>,
  overrides: CreateUserInput = {},
): Promise<typeof schema.users.$inferSelect> {
  const { faker } = await import('@faker-js/faker');
  const passwordHash = overrides.passwordHash ?? await bcrypt.hash('Password123!', 10);

  const values = {
    email: (overrides.email || faker.internet.email()).toLowerCase(),
    name: overrides.name || faker.person.fullName(),
    passwordHash,
    emailVerified: true,
    ...overrides,
  };

  const [user] = await db
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({
      target: schema.users.email,
      set: values,
    })
    .returning();

  return user;
}

// Convenience: create user with known password for auth tests
export async function createUserWithPassword(
  db: NodePgDatabase<typeof schema>,
  password: string,
  overrides: CreateUserInput = {},
): Promise<{ user: typeof schema.users.$inferSelect; password: string }> {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(db, { ...overrides, passwordHash });
  return { user, password };
}
