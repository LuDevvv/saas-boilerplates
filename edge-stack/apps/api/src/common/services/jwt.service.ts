import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

/**
 * Interface for the JWT Service.
 */
export interface JwtService {
  /**
   * Signs a payload and returns a JWT token.
   * @param payload - Data to be encoded in the token
   * @returns JWT string
   */
  signToken(payload: JWTPayload): Promise<string>;

  /**
   * Verifies a JWT token and returns its payload.
   * @param token - JWT string
   * @returns Decoded payload
   */
  verifyToken(token: string): Promise<JWTPayload>;
}

/**
 * Factory to create a JWT Service instance.
 * Uses Hono's native Edge-compatible JWT utilities.
 *
 * @param secret - The JWT secret for signing and verification
 */
export const createJwtService = (secret: string): JwtService => {
  if (!secret) {
    throw new Error("Missing JWT_SECRET configuration.");
  }

  return {
    async signToken(payload: JWTPayload): Promise<string> {
      // Sign using HS256 as per project standard
      return await sign(payload, secret, "HS256");
    },

    async verifyToken(token: string): Promise<JWTPayload> {
      return await verify(token, secret, "HS256");
    },
  };
};
