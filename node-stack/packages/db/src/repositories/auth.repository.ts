import { Injectable, Inject, Logger } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens";
import * as schema from "../schema";

type User = typeof schema.users.$inferSelect;
type CreateUserData = typeof schema.users.$inferInsert;
type Session = typeof schema.sessions.$inferSelect;
type OAuthAccount = typeof schema.oauthAccounts.$inferSelect;
type VerificationToken = typeof schema.verificationTokens.$inferSelect;
type Tx = NodePgDatabase<typeof schema>;

export interface CreateSessionData {
  id: string;
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateOAuthAccountData {
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
}

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {
    this.logger.log("[AuthRepository] Initialized and injected");
  }

  // ── User queries ────────────────────────────────────────

  async findUserByEmail(email: string, tx?: Tx): Promise<User | undefined> {
    const database = tx ?? this.db;
    return database.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async findUserById(id: string, tx?: Tx): Promise<User | undefined> {
    const database = tx ?? this.db;
    return database.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async createUser(
    data: CreateUserData,
    tx?: Tx,
  ): Promise<User> {
    const database = tx ?? this.db;
    const [user] = await database
      .insert(schema.users)
      .values(data)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database.update(schema.users).set(data).where(eq(schema.users.id, id));
  }

  // ── Session queries ─────────────────────────────────────

  async findActiveSessionById(
    sessionId: string,
    tx?: Tx,
  ): Promise<Session | undefined> {
    const database = tx ?? this.db;
    return database.query.sessions.findFirst({
      where: eq(schema.sessions.id, sessionId),
    });
  }

  async createSession(data: CreateSessionData, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database.insert(schema.sessions).values(data);
  }

  async deleteSessionById(sessionId: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));
  }

  async rotateSession(
    oldSessionId: string,
    newSession: CreateSessionData,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, oldSessionId));
    await database.insert(schema.sessions).values(newSession);
  }

  // ── OAuth queries ───────────────────────────────────────

  async findOAuthLink(
    provider: string,
    providerAccountId: string,
    tx?: Tx,
  ): Promise<OAuthAccount | undefined> {
    const database = tx ?? this.db;
    return database.query.oauthAccounts.findFirst({
      where: and(
        eq(schema.oauthAccounts.provider, provider),
        eq(schema.oauthAccounts.providerAccountId, providerAccountId),
      ),
    });
  }

  async updateOAuthAccessToken(
    oauthAccountId: string,
    accessToken: string,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database
      .update(schema.oauthAccounts)
      .set({ accessToken })
      .where(eq(schema.oauthAccounts.id, oauthAccountId));
  }

  async createOAuthAccount(
    data: CreateOAuthAccountData,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database.insert(schema.oauthAccounts).values(data);
  }

  // ── Verification Tokens ─────────────────────────────────

  async createVerificationToken(
    data: { identifier: string; token: string; expiresAt: Date; userId: string },
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database.insert(schema.verificationTokens).values(data);
  }

  async findVerificationToken(
    identifier: string,
    token: string,
    tx?: Tx,
  ): Promise<VerificationToken | undefined> {
    const database = tx ?? this.db;
    return database.query.verificationTokens.findFirst({
      where: and(
        eq(schema.verificationTokens.identifier, identifier),
        eq(schema.verificationTokens.token, token),
      ),
    });
  }

  async deleteVerificationToken(token: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.token, token));
  }

  async deleteVerificationTokensByUser(
    userId: string,
    identifier: string,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(schema.verificationTokens)
      .where(
        and(
          eq(schema.verificationTokens.userId, userId),
          eq(schema.verificationTokens.identifier, identifier),
        ),
      );
  }

  // ── Audit Logs ──────────────────────────────────────

  async getAuthAuditLogs(userId: string, tx?: Tx) {
    const database = tx ?? this.db;
    return database.query.auditLogs.findMany({
      where: eq(schema.auditLogs.userId, userId),
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
      limit: 50,
    });
  }

  // ── Outbox queries ──────────────────────────────────────

  async createOutboxEvent(
    eventType: string,
    payload: Record<string, unknown>,
    tx?: Tx,
  ): Promise<string> {
    const database = tx ?? this.db;
    const [row] = await database
      .insert(schema.outbox)
      .values({ eventType, payload })
      .returning();
    return row.id;
  }
}
