import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = (request as any).requestId;

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} [rid=${requestId}]`,
        exception instanceof Error ? exception.stack : exception,
      );
      
      // Use dynamic import for Sentry to avoid ESM resolution crashes during startup
      import("@sentry/node").then((Sentry) => {
        Sentry.captureException(exception, {
          tags: { requestId: request.headers["x-request-id"] },
          user: { id: (request as any).user?.id },
        });
      }).catch(err => this.logger.warn(`Sentry capture failed: ${err.message}`));
    }

    response.status(status).json({
      statusCode: status,
      error: this.getErrorCode(status, exception),
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorCode(status: number, exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.constructor.name.replace("Exception", "").toUpperCase();
    }
    switch (status) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 429:
        return "TOO_MANY_REQUESTS";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
