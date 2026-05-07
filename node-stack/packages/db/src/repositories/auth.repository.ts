import { Injectable, Inject, Logger } from "@nestjs/common";
import { eq, and, gt, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

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
  rememberMe?: boolean;
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
    @Inject(DB_TOKEN) private readonly _db: Tx,
  ) {
    this.logger.log("[AuthRepository] Initialized and injected");
  }

  get db(): Tx {
    return this._db;
  }

  // ── User queries ────────────────────────────────────────

  async findUserByEmail(email: string, tx?: Tx): Promise<User | undefined> {
    const database = tx ?? this._db;
    return database.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async findUserById(id: string, tx?: Tx): Promise<User | undefined> {
    const database = tx ?? this._db;
    return database.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async createUser(
    data: CreateUserData,
    tx?: Tx,
  ): Promise<User> {
    const database = tx ?? this._db;
    const [user] = await database
      .insert(schema.users)
      .values(data)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>, tx?: Tx): Promise<User> {
    const database = tx ?? this._db;
    const [user] = await database
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  // ── Session queries ─────────────────────────────────────

  async findActiveSessionById(
    sessionId: string,
    tx?: Tx,
  ): Promise<Session | undefined> {
    const database = tx ?? this._db;
    return database.query.sessions.findFirst({
      where: eq(schema.sessions.id, sessionId),
    });
  }

  async findActiveSessionByUserAgent(
    userId: string,
    userAgent: string,
    tx?: Tx,
  ): Promise<Session | undefined> {
    const database = tx ?? this._db;
    return database.query.sessions.findFirst({
      where: and(
        eq(schema.sessions.userId, userId),
        eq(schema.sessions.userAgent, userAgent),
        gt(schema.sessions.expiresAt, new Date()),
      ),
      orderBy: [desc(schema.sessions.lastUsedAt)],
    });
  }

  async createSession(data: CreateSessionData, tx?: Tx): Promise<void> {
    const database = tx ?? this._db;
    await database.insert(schema.sessions).values(data);
  }

  async updateSessionActivity(
    sessionId: string,
    data: { lastUsedAt: Date; expiresAt: Date; ipAddress?: string },
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this._db;
    const updateData: { lastUsedAt: Date; expiresAt: Date; ipAddress?: string } = {
      lastUsedAt: data.lastUsedAt,
      expiresAt: data.expiresAt,
    };
    if (data.ipAddress !== undefined) {
      updateData.ipAddress = data.ipAddress;
    }
    await database
      .update(schema.sessions)
      .set(updateData)
      .where(eq(schema.sessions.id, sessionId));
  }

  async deleteSessionById(sessionId: string, tx?: Tx): Promise<void> {
    const database = tx ?? this._db;
    await database
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));
  }

  async rotateSession(
    oldSessionId: string,
    newSession: CreateSessionData,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this._db;
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
    const database = tx ?? this._db;
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
    const database = tx ?? this._db;
    await database
      .update(schema.oauthAccounts)
      .set({ accessToken })
      .where(eq(schema.oauthAccounts.id, oauthAccountId));
  }

  async createOAuthAccount(
    data: CreateOAuthAccountData,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this._db;
    await database.insert(schema.oauthAccounts).values(data);
  }

  // ── Verification Tokens ─────────────────────────────────

  async createVerificationToken(
    data: { identifier: string; token: string; expiresAt: Date; userId: string },
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this._db;
    await database.insert(schema.verificationTokens).values(data);
  }

  async findVerificationToken(
    identifier: string,
    token: string,
    tx?: Tx,
  ): Promise<VerificationToken | undefined> {
    const database = tx ?? this._db;
    return database.query.verificationTokens.findFirst({
      where: and(
        eq(schema.verificationTokens.identifier, identifier),
        eq(schema.verificationTokens.token, token),
      ),
    });
  }

  async deleteVerificationToken(token: string, tx?: Tx): Promise<void> {
    const database = tx ?? this._db;
    await database
      .delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.token, token));
  }

  async deleteVerificationTokensByUser(
    userId: string,
    identifier: string,
    tx?: Tx,
  ): Promise<void> {
    const database = tx ?? this._db;
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
    const database = tx ?? this._db;
    return database.query.auditLogs.findMany({
      where: eq(schema.auditLogs.userId, userId),
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
      limit: 50,
    });
  }

  async findAll(options: { page: number; limit: number; search?: string }, tx?: Tx) {
    const database = tx ?? this._db;
    const offset = (options.page - 1) * options.limit;

    // In a real application, you'd add complex filtering here
    const users = await database.query.users.findMany({
      limit: options.limit,
      offset,
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    return users;
  }

  // ── Outbox queries ──────────────────────────────────────

  async createOutboxEvent(
    eventType: string,
    payload: Record<string, unknown>,
    tx?: Tx,
  ): Promise<string> {
    const database = tx ?? this._db;
    const [row] = await database
      .insert(schema.outbox)
      .values({ eventType, payload })
      .returning();
    return row.id;
  }
}
