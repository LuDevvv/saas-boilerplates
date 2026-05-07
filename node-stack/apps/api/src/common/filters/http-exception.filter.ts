import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionsHandler");

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || request.headers["x-request-id"];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Error interno del servidor";
    let errorType = "INTERNAL_SERVER_ERROR";
    let extraData: any = {};

    // 1. Handle NestJS HttpExceptions (manually thrown)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = (responseBody as any).message || responseBody;
      errorType = this.formatErrorName(exception.constructor.name);
      
      if (typeof responseBody === "object") {
        const { message: _, statusCode: __, error: ___, ...rest } = responseBody as any;
        extraData = rest;
      }
    } 
    // 2. Handle Connection & Network Errors (Redis, Database down, etc.)
    else if (exception.code === 'ECONNREFUSED' || exception.code === 'ETIMEDOUT' || exception.code === 'ENOTFOUND') {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = "El servidor no puede conectar con un servicio requerido (Base de Datos/Caché). Por favor, intenta más tarde.";
      errorType = "SERVICE_UNAVAILABLE";
    }
    // 3. Handle Database errors (Postgres codes via Drizzle/pg)
    else if (exception.code && typeof exception.code === 'string' && (exception.detail || exception.message)) {
      const dbError = exception;
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
          message = `Campo requerido faltante: ${dbError.column || 'desconocido'}`;
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
    else if (exception.type && (exception.raw || exception.requestId)) {
      status = exception.statusCode || exception.raw?.statusCode || HttpStatus.BAD_REQUEST;
      message = exception.raw?.message || exception.message || "Payment processor error";
      errorType = exception.type.toUpperCase().replace(/\./g, "_");
    }

    // 4. Logging Strategy
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} [rid=${requestId}] - Status: ${status} - Error: ${exception.message || 'Unknown'}`,
        exception.stack,
      );
      
      // Use dynamic import for Sentry to avoid ESM resolution crashes during startup
      try {
        const Sentry = await import("@sentry/node");
        Sentry.captureException(exception, {
          tags: { requestId },
          user: { id: (request as any).user?.id },
        });
      } catch (err: any) {
        this.logger.warn(`Sentry capture failed: ${err.message}`);
      }
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} [rid=${requestId}] - Status: ${status} - Message: ${JSON.stringify(message)} - Original: ${exception.message || "N/A"}`,
      );
    }

    // 5. Standardized Response Payload
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

  private formatErrorName(name: string): string {
    return name
      .replace(/Exception$/, "")
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .toUpperCase();
  }

  private formatDbDetail(detail: string): string | null {
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
