import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface RequestWithId extends Request {
  requestId?: string;
}

interface DbError {
  code: string;
  detail?: string;
  message?: string;
  column?: string;
}

interface StripeError {
  type: string;
  raw?: { statusCode?: number; message?: string };
  requestId?: string;
  statusCode?: number;
  message?: string;
}

interface NetworkError {
  code: string;
  message?: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionsHandler");

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();
    const requestId = request.requestId ?? (request.headers["x-request-id"] as string | undefined);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Error interno del servidor";
    let errorType = "INTERNAL_SERVER_ERROR";
    let extraData: Record<string, unknown> = {};

    // 1. Handle NestJS HttpExceptions (manually thrown)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      const body = responseBody as Record<string, unknown>;
      message = (body.message as string | string[]) || (responseBody as string);
      errorType = this.formatErrorName(exception.constructor.name);

      if (typeof responseBody === "object") {
        const { message: _msg, statusCode: _sc, error: _err, ...rest } = responseBody as Record<string, unknown>;
        extraData = rest;
      }
    }
    // 2. Handle Connection & Network Errors (Redis, Database down, etc.)
    else if (this.isNetworkError(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = "El servidor no puede conectar con un servicio requerido (Base de Datos/Caché). Por favor, intenta más tarde.";
      errorType = "SERVICE_UNAVAILABLE";
    }
    // 3. Handle Database errors (Postgres codes via Drizzle/pg)
    else if (this.isDbError(exception)) {
      const dbError = exception as DbError;
      switch (dbError.code) {
        case "23505": // Unique violation
          status = HttpStatus.CONFLICT;
          message = this.formatDbDetail(dbError.detail) || "El registro ya existe (entrada duplicada).";
          errorType = "UNIQUE_VIOLATION";
          break;
        case "23503": // Foreign key violation
          status = HttpStatus.CONFLICT;
          message = request.method === "DELETE"
            ? "No se puede eliminar este registro porque está siendo utilizado por otros recursos."
            : "Registro relacionado no encontrado.";
          errorType = "FOREIGN_KEY_VIOLATION";
          break;
        case "23502": // Not null violation
          status = HttpStatus.BAD_REQUEST;
          message = `Campo requerido faltante: ${dbError.column ?? 'desconocido'}`;
          errorType = "NOT_NULL_VIOLATION";
          break;
        case "08003": // Connection does not exist
        case "08006": // Connection failure
        case "08P01": // Protocol violation
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = "Error de conexión con la base de datos. Por favor, contacta a soporte.";
          errorType = "DATABASE_CONNECTION_ERROR";
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = "Ocurrió una violación de restricción en la base de datos.";
          errorType = "DATABASE_ERROR";
      }
    }
    // 4. Handle Stripe Errors
    else if (this.isStripeError(exception)) {
      const stripeErr = exception as StripeError;
      status = stripeErr.statusCode ?? stripeErr.raw?.statusCode ?? HttpStatus.BAD_REQUEST;
      message = stripeErr.raw?.message ?? stripeErr.message ?? "Payment processor error";
      errorType = stripeErr.type.toUpperCase().replace(/\./g, "_");
    }

    // 5. Logging Strategy
    const exceptionMessage = exception instanceof Error ? exception.message : String(exception ?? "Unknown");
    const exceptionStack = exception instanceof Error ? exception.stack : undefined;

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} [rid=${requestId ?? ""}] - Status: ${status} - Error: ${exceptionMessage}`,
        exceptionStack,
      );

      // Use dynamic import for Sentry to avoid ESM resolution crashes during startup
      try {
        const Sentry = await import("@sentry/node");
        const reqWithUser = request as RequestWithId & { user?: { id?: string } };
        Sentry.captureException(exception, {
          tags: { requestId },
          user: { id: reqWithUser.user?.id },
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Sentry capture failed: ${errMsg}`);
      }
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} [rid=${requestId ?? ""}] - Status: ${status} - Message: ${JSON.stringify(message)} - Original: ${exceptionMessage}`,
      );
    }

    // 6. Standardized Response Payload
    const errorPayload = {
      statusCode: status,
      error: errorType,
      message: message,
      path: request.url,
      requestId,
      ...extraData,
    };

    const responsePayload = {
      data: errorPayload,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(responsePayload);
  }

  private isNetworkError(exception: unknown): boolean {
    if (typeof exception !== "object" || exception === null) return false;
    const err = exception as NetworkError;
    return err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND";
  }

  private isDbError(exception: unknown): boolean {
    if (typeof exception !== "object" || exception === null) return false;
    const err = exception as Partial<DbError>;
    // PostgreSQL error codes are exactly 5 alphanumeric chars starting with a digit
    // (e.g., "23505", "08003"). This prevents Node.js codes like "ERR_INVALID_URL"
    // from being misclassified as DB errors.
    return (
      typeof err.code === "string" &&
      /^\d[0-9A-Z]{4}$/.test(err.code) &&
      !!(err.detail ?? err.message)
    );
  }

  private isStripeError(exception: unknown): boolean {
    if (typeof exception !== "object" || exception === null) return false;
    const err = exception as Partial<StripeError>;
    return typeof err.type === "string" && !!(err.raw ?? err.requestId);
  }

  private formatErrorName(name: string): string {
    return name
      .replace(/Exception$/, "")
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .toUpperCase();
  }

  private formatDbDetail(detail?: string): string | null {
    if (!detail) return null;
    // Extract field from "(email)=(test@test.com) already exists."
    const match = detail.match(/\((.*?)\)=\((.*?)\)/);
    if (match) {
      const field = match[1];
      return `El valor para el campo '${field}' ya está en uso.`;
    }
    return detail;
  }
}
