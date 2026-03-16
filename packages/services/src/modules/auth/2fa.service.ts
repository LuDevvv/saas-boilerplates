import * as OTPAuth from "otpauth";

/**
 * Service to manage Two-Factor Authentication TOTP generation and verification.
 * Built to be fully compatible with V8 Isolates (Edge native).
 */
export const create2faService = () => {
  return {
    /**
     * Generates a new Base32 secret and OTP URI.
     *
     * @param email The user's email, used as a label for the authenticator app.
     */
    generateSecret(email: string) {
      const secret = new OTPAuth.Secret({ size: 20 });

      const totp = new OTPAuth.TOTP({
        issuer: "L.A. Labs",
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      return {
        secret: secret.base32,
        uri: totp.toString(),
      };
    },

    /**
     * Verifies a 6-digit token against a user's stored Base32 secret.
     *
     * @param secret Base32 string
     * @param token 6-digit TOTP string
     */
    verifyToken(secret: string, token: string): boolean {
      // Remove spaces from input token to allow formats like '123 456'
      const cleanToken = token.replace(/\s+/g, "");

      if (!secret || cleanToken.length !== 6) return false;

      const totp = new OTPAuth.TOTP({
        issuer: "L.A. Labs",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const delta = totp.validate({ token: cleanToken, window: 1 });
      return delta !== null;
    },

    /**
     * Generates 10 strong alphanumeric recovery codes dynamically using native Web Crypto APIs.
     */
    generateRecoveryCodes(): string[] {
      const codes: string[] = [];
      for (let i = 0; i < 10; i++) {
        // Generate 8 bytes of entropy and convert to hex string
        const array = new Uint8Array(5);
        crypto.getRandomValues(array);
        const code = Array.from(array)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase();

        // Format as XXXX-XXXX-XX
        codes.push(`${code.slice(0, 4)}-${code.slice(4, 10)}`);
      }
      return codes;
    },
  };
};

export type TfaService = ReturnType<typeof create2faService>;
