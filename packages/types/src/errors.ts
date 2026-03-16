/**
 * Custom application error class for handling domain-specific exceptions.
 * Encapsulates status code, error code, and optional metadata for consistent error reporting.
 */
export class AppError extends Error {
  /** HTTP Status code */
  public readonly statusCode: number;
  /** Domain-specific error code */
  public readonly errorCode: string;
  /** Optional error details/metadata */
  public readonly details?: unknown;

  /**
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (e.g., 400, 404, 500)
   * @param errorCode - Machine-readable error identifier (e.g., 'AUTH_FAILED')
   * @param details - Optional additional context or validation errors
   */
  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
