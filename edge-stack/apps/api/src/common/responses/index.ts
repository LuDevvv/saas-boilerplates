/**
 * Standard success response structure.
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: unknown;
}

/**
 * Standard error response structure.
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Creates a standardized success response body.
 * @param data - The payload to return
 * @param meta - Optional metadata (pagination, etc.)
 */
export const successResponse = <T>(
  data: T,
  meta?: unknown,
): SuccessResponse<T> => {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
};

/**
 * Creates a standardized error response body.
 * @param code - Machine-readable error code
 * @param message - Human-readable error message
 * @param details - Optional error context
 */
export const errorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ErrorResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
};
