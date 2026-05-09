import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema/index.js";
import { DB_TOKEN } from "../tokens.js";

type User = typeof schema.users.$inferSelect;
type CreateUserData = typeof schema.users.$inferInsert;
export type UpdateUserData = Partial<CreateUserData>;

type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async create(data: CreateUserData, tx?: Tx): Promise<User> {
    const db = tx ?? this.db;
    const [user] = await db
      .insert(schema.users)
      .values(data)
      .returning();
    return user;
  }

  async update(id: string, data: UpdateUserData, tx?: Tx): Promise<User | undefined> {
    const db = tx ?? this.db;
    const [user] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async delete(id: string, tx?: Tx): Promise<void> {
    const db = tx ?? this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
  }
}
