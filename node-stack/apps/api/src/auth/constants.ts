export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_EXISTS: "User already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired",
  SESSION_NOT_FOUND: "Session not found",
} as const;

export const JWT_CONSTANTS = {
  ACCESS_SECRET: process.env.JWT_SECRET || "",
  REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "",
  ACCESS_EXPIRY: "15m",
  REFRESH_EXPIRY: "7d",
} as const;
