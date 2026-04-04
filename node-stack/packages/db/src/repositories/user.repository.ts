import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens";
import * as schema from "../schema";

type User = typeof schema.users.$inferSelect;
type CreateUserData = typeof schema.users.$inferInsert;
export type UpdateUserData = Partial<CreateUserData>;

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async create(data: CreateUserData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    const [user] = await db
      .insert(schema.users)
      .values(data)
      .returning();
    return user;
  }

  async update(id: string, data: UpdateUserData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    const [user] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async delete(id: string, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
  }
}
