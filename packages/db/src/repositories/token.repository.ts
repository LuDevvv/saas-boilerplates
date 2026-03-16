import { eq, and, gt } from "drizzle-orm";
import type { Database } from "../db";
import {
  verificationTokens,
  type VerificationToken,
  type NewVerificationToken,
} from "../schema/auth";

/**
 * Repository for authentication tokens (Verification, Password Reset).
 */
export const TokenRepository = {
  /**
   * Creates a new verification token.
   * @param db - Database instance
   * @param data - Token data
   */
  async create(
    db: Database,
    data: NewVerificationToken,
  ): Promise<VerificationToken> {
    const result = await db.insert(verificationTokens).values(data).returning();
    if (!result[0]) throw new Error("Failed to create token");
    return result[0];
  },

  /**
   * Validates and consumes a token (deletes it upon successful validation).
   * @param db - Database instance
   * @param token - The token string
   * @param type - Expected token type
   */
  async validateAndConsume(
    db: Database,
    token: string,
    type: string,
  ): Promise<VerificationToken | null> {
    const result = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, type),
          gt(verificationTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const foundToken = result[0];
    if (!foundToken) return null;

    // Atomic consumption: delete after finding
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, foundToken.id));

    return foundToken;
  },
};
