export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Correo o contraseña incorrectos",
  USER_EXISTS: "Este correo electrónico ya está registrado",
  USER_NOT_FOUND: "Usuario no encontrado",
  INVALID_TOKEN: "Token inválido o expirado",
  TOKEN_EXPIRED: "Tu sesión ha expirado",
  SESSION_NOT_FOUND: "Sesión no encontrada",
} as const;

export const JWT_EXPIRY = {
  ACCESS: "15m",
  REFRESH: "90d",
} as const;
