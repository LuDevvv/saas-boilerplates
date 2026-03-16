import { eq, sql } from "drizzle-orm";
import type { Database } from "../db";
import { users, type User, type NewUser } from "../schema/users";

/**
 * Repository for User-related database operations.
 */
export const UserRepository = {
  /**
   * Finds a user by their unique ID.
   * @param db - Database instance
   * @param id - User ID
   */
  async findById(db: Database, id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  /**
   * Finds a user by their email address.
   * @param db - Database instance
   * @param email - User email
   */
  async findByEmail(db: Database, email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  },

  /**
   * Creates a new user record.
   * @param db - Database instance
   * @param user - User data
   */
  async create(db: Database, user: NewUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    if (!result[0]) throw new Error("Failed to create user");
    return result[0];
  },

  /**
   * Updates an existing user record.
   * @param db - Database instance
   * @param id - User ID
   * @param data - Data to update
   */
  async update(
    db: Database,
    id: string,
    data: Partial<NewUser>,
  ): Promise<User | null> {
    const {
      id: _id,
      email: _email,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = data as any;
    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  },

  /**
   * Deletes a user record by ID.
   * @param db - Database instance
   * @param id - User ID
   */
  async delete(db: Database, id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  },
};
