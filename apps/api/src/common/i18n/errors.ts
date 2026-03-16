/**
 * API Error Message Dictionary.
 * Maps machine-readable error codes to localized human-readable messages.
 */
export const errorMessages = {
  en: {
    UNAUTHORIZED: "Unauthorized access.",
    MISSING_TOKEN: "Authorization header missing or invalid format.",
    INVALID_TOKEN: "Invalid authentication token.",
    TOKEN_EXPIRED: "Authentication token has expired.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    FORBIDDEN: "You do not have permission to access this resource.",
    NOT_FOUND: "The requested resource was not found.",
    DUPLICATE_SLUG: "A workspace with this slug already exists.",
    UPDATE_FAILED: "The requested update operation could not be completed.",
    GENERIC_ERROR: "An unexpected error occurred on the server.",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  },
  es: {
    UNAUTHORIZED: "Acceso no autorizado.",
    MISSING_TOKEN:
      "Falta el encabezado de autorización o el formato es inválido.",
    INVALID_TOKEN: "Token de autenticación inválido.",
    TOKEN_EXPIRED: "El token de autenticación ha expirado.",
    INVALID_CREDENTIALS: "Correo electrónico o contraseña inválidos.",
    FORBIDDEN: "No tienes permiso para acceder a este recurso.",
    NOT_FOUND: "El recurso solicitado no fue encontrado.",
    DUPLICATE_SLUG: "Ya existe un espacio de trabajo con este identificador.",
    UPDATE_FAILED:
      "La operación de actualización solicitada no pudo completarse.",
    GENERIC_ERROR: "Ocurrió un error inesperado en el servidor.",
    RATE_LIMIT_EXCEEDED:
      "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.",
  },
} as const;

export type ErrorCode = keyof typeof errorMessages.en;
